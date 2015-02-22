var WebSocketServer = require("ws").Server;
var pg = require("pg");
var fs = require("fs");

fs.unlinkSync("latest.log");
var conf = JSON.parse(fs.readFileSync("conf.json"));

var ctx = {};

ctx.conf = JSON.parse(fs.readFileSync("conf.json"));
ctx.db = new pg.Client(conf.postgres);
ctx.util = require("./util");
ctx.methods = require("./methods");

ctx.db.connect(function(err)
{
	ctx.util.log("severe", "Could not connect to postgres database.", err);

	var wss = new WebSocketServer(
	{
		"port": conf.port
	});

	wss.on("connection", function(sock)
	{
		sock.on("message", function(data)
		{
			var msg = JSON.parse(data);
			var meth = ctx.methods[msg.m];
			var req = new Request(msg.r, sock);

			if (meth === undefined)
			{
				console.log("No such method: "+msg.m);
				req.error("ENOMETH");
			}
			else
			{
				meth(req, msg.d);
			}
		});
		console.log("New connection!");
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
				"d": data
			}));
		},

		"error": function(msg)
		{
			this.sock.send(JSON.stringify(
			{
				"r": this.requestId,
				"err": msg
			}));
		}
	}
});
