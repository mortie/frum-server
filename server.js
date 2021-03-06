var WebSocketServer = require("ws").Server;
var pg = require("pg");
var fs = require("fs");
var scrypt = require("scrypt");

try
{
	fs.unlinkSync("latest.log");
}
catch (err)
{
	if (err.code != "ENOENT")
		throw new Error("Couldn't delete log file", err);
}

var ctx = {};

ctx.conf = JSON.parse(fs.readFileSync("conf.json"));
ctx.db = new pg.Client(ctx.conf.postgres);
ctx.util = require("./util");
ctx.methods = require("./methods");
ctx.sessions = [];

ctx.db.connect(function(err)
{
	ctx.util.log("severe", "Could not connect to postgres database.", err);

	var wss = new WebSocketServer(
	{
		"port": ctx.conf.port
	}, function()
	{
		ctx.util.log("info", "Started server on port "+ctx.conf.port+".");
	});

	wss.on("connection", function(sock)
	{
		var session = new Session(sock);
		ctx.sessions.push(session);

		sock.on("close", function(msg)
		{
			session = undefined;
			sock = undefined;
		});

		//handle incoming messages from the client
		sock.on("message", function(data)
		{
			//figure out which method the client wants to run based on the message
			var msg = JSON.parse(data);
			var meth = ctx.methods[msg.m];
			var req = new Request(msg.r, sock);

			//don't do anything if the method doesn't exist
			if (meth === undefined)
			{
				ctx.util.log("notice", "Bad request: No such method: '"+msg.m+"'");
				return req.fail("ENOMETH");
			}

			//check whether all arguments are in place
			if (meth.args !== undefined)
			{
				for (var i in meth.args)
				{
					if (typeof msg.d[i] !== meth.args[i])
					{
						ctx.util.log("notice", "Bad request for method "+msg.m+": Argument '"+i+"' missing.");
						return req.fail("EBADARGS");
					}
				}
			}

			//check whether all permissions are in place
			if (meth.perms === undefined)
			{
				meth(req, msg.d, ctx, session);
			}
			else
			{
				ctx.util.getPerms(ctx.db, session.userId, function(err, perms)
				{
					var hasPerm = true;
					meth.perms.forEach(function(perm)
					{
						if (perms["perm_"+perm] !== true)
							hasPerm = false;
					});

					if (hasPerm)
						meth(req, msg.d, ctx, session);
					else
						req.fail("ENOPERM");
				});
			}
		});

		ctx.util.log("info", "New connection.");
	});

	wss.on("error", function(err)
	{
		ctx.util.log("severe", "WebSocket server error.", err);
	});
});

var Request = function(requestId, sock)
{
	this.requestId = requestId;
	this.sock = sock;
}

Request.prototype =
{
	"reply": function(data)
	{
		this.sock.send(JSON.stringify(
		{
			"r": this.requestId,
			"d": data || {}
		}));
	},

	"fail": function(msg)
	{
		this.sock.send(JSON.stringify(
		{
			"r": this.requestId,
			"err": msg
		}));
	}
}

var Session = function(sock)
{
	this.sock = sock;
	this.loggedIn = false;
	this.userId;
}

Session.prototype  =
{
	"send": function(evt, data)
	{
		this.sock.send(JSON.stringify(
		{
			"e": evt,
			"d": data  || {}
		}));
	},

	"logout": function()
	{
		this.loggedIn = false;
		delete this.userId;
		this.send("logout");
	},

	"login": function(uid)
	{
		this.loggedIn = true;
		this.userId = uid;
		this.send("login");
	}
}
