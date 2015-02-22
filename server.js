var WebSocketServer = require("ws").Server;
var fs = require("fs");

var methods = require("./methods");

var conf = JSON.parse(fs.readFileSync("conf.json"));

var wss = new WebSocketServer(
{
	"port": conf.port
});

wss.on("connection", function(sock)
{
	sock.on("message", function(data)
	{
		var msg = JSON.parse(data);
		var meth = methods[msg.m];
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
