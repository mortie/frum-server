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

		sock.on("message", function(data)
		{
			var msg = JSON.parse(data);
			var meth = ctx.methods[msg.m];
			var req = new Request(msg.r, sock);

			if (meth === undefined)
			{
				ctx.util.log("notice", "Bad request: No such method: '"+msg.m+"'");
				return req.fail("ENOMETH");
			}

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

			meth(req, msg.d, ctx, session);
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
