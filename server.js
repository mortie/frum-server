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

ctx.db.connect(function(err)
{
	ctx.util.log("severe", "Could not connect to postgres database.", err);

	var wss = new WebSocketServer(
	{
		"port": ctx.conf.port
	});

	ctx.util.log("info", "Started server on port "+ctx.conf.port+".");

	wss.on("connection", function(sock)
	{

		var user = new User();

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
				meth(req, msg.d, ctx, user);
			}
		});
		console.log("New connection!");
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

var User = function()
{
	this.loggedIn = false;
}

User.prototype =
{
	"login": function(username, password, cb)
	{
		//Both username and password has to be strings.
		try
		{
			ctx.util.checkType(username, "string");
			ctx.util.checkType(password, "string");
		}
		catch (err)
		{
			ctx.util.log("warning", "Type mismatch.", err);
			return cb(false);
		}

		//Query the database for users with the provided username
		ctx.db.query(
		"SELECT pass_hash FROM users WHERE username=$1",
		[username],
		function(err, res)
		{
			ctx.util.log("warning", "Error querying database for user.", err);

			//If no rows are returned, the username doesn't exist
			if (res.rowCount === 0)
				return cb(false);

			var user = res.rows[0];

			//verify that the password matches the hash
			scrypt.verifyHash(user.pass_hash, password, function(err, result)
			{
				cb(result);
			}.bind(this));
		}.bind(this));
	},

	"register": function(username, password, email, cb)
	{
		ctx.db.query(
		"SELECT FROM users WHERE username=$1",
		[username],
		function(err, res)
		{
			ctx.util.log("warning", "Error querying database for user.", err);
			if (err)
				return cb(false);

			ctx.db.query(
			"INSERT INTO users (username, pass_hash, email)"+
			"VALUES ($1), ($2), ($3)",
			[username, scrypt.passwordHashSync(password), email],
			function(err, res)
			{
				ctx.util.log("warning", "Error inserting user to database.", err);
				if (err)
					return cb(false);

				cb(true);
			});
		});
	}
}
