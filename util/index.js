var fs = require("fs");

var logSeverities =
{
	"debug": "DEBUG: ",
	"info": "INFO: ",
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
				msg = logSeverities[severity]+": "+msg+" ("+err+")\n";
			else
				msg = severity+": "+msg+"\n";

			console.log(msg);

			if (severity === "severe")
			{
				fs.appendFileSync("latest.log", msg);
				process.exit();
			}
			else
			{
				fs.writeFile("latest.log", msg);
			}
		}
	},

	"checkType": function(val, type)
	{
		if (typeof val !== type)
		{
			throw new Error("Type mismatch: value should have been "+type+" but is "+(typeof val));
		}
	}
}
