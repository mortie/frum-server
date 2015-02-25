var scrypt = require("scrypt");
var crypto = require("crypto");

module.exports = function(req, data, ctx, session)
{
	if (session.loggedIn)
		return req.fail("ELOGGEDIN");

	//callback to run when query is done
	var queryCallback = function(err, res)
	{
		if (err)
		{
			ctx.util.log("warning", "Error logging out all clients for user.", err);
			return req.fail("EUNKNOWN");
		}

		session.loggedIn = false

		req.reply();
	}

	//Insert into database. Query will fail if user exists.
	ctx.db.query(
		"UPDATE users "+
		"SET auth_token=$1 "+
		"WHERE id=$2",
		[
			crypto.randomBytes(64).toString("hex"),
			session.userId
		],
		queryCallback
	);
}

module.exports.args =
{
	"username": "string",
	"password": "string"
}
