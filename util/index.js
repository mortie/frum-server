var fs = require("fs");

var logSeverities =
{
	"debug": "DEBUG: ",
	"info": "INFO: ",
	"notice": "NOTICE: ",
	"warning": "WARNING: ",
	"severe": "SEVERE: "
}

module.exports =
{
	"log": function(severity, msg, err)
	{
		this.checkType(logSeverities[severity], "string");
		this.checkType(msg, "string");

		if (err === undefined || err)
		{
			if (err)
				msg = logSeverities[severity]+msg+" ("+err+")";
			else
				msg = logSeverities[severity]+msg;

			console.log(msg);

			if (severity === "severe")
			{
				fs.appendFileSync("latest.log", msg+"\n");
				process.exit();
			}
			else
			{
				fs.writeFile("latest.log", msg+"\n");
			}
		}
	},

	"checkType": function(val, type)
	{
		if (typeof val !== type)
		{
			throw new Error("Type mismatch: value should have been "+type+" but is "+(typeof val));
		}
	},

	"getPerms": function(db, id, cb)
	{
		db.query(
			"SELECT groups.* "+
			"FROM users, groups "+
			"WHERE users.id = $1 "+
			"AND users.group_id = groups.id",
			[id],
			queryCallback
		);

		function queryCallback(err, res)
		{
			if (err)
			{
				ctx.util.log("warning", "Failed to query for permissions.", err);
				return cb("EUNKNOWN");
			}

			//filter out all properties which aren't permission flags
			var perms = {};
			for (var i in res)
			{
				if (i.indexOf("perm_") === 0)
					perms[i] = res[i];
			}

			cb(undefined, res.rows[0]);
		}
	}
}
