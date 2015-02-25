var scrypt = require("scrypt");
var async = require("async");

module.exports = function(req, data, ctx, session)
{
	if (session.loggedIn)
		return req.fail("ELOGGEDIN");

	ctx.db.query(
		"SELECT id, pass_hash, auth_token "+
		"FROM users "+
		"WHERE username=$1",
		[data.username],
		queryCallback
	);

	function queryCallback(err, res)
	{
		if (err)
		{
			ctx.util.log("warning", "Failed to log in user.", err);
			return req.fail("EUNKNOWN");
		}

		//if no rows are returned, the user doesn't exist
		if (res.rowCount === 0)
			return req.fail("EBADLOGIN");

		var user = res.rows[0];

		//verify that the password matches the hash
		scrypt.verifyHash(user.pass_hash, data.password, function(err, success)
		{
			if (err)
				return req.fail("EBADLOGIN");

			session.loggedIn = true;
			session.userId = user.id;

			ctx.util.log("info", "User '"+data.username+"' logged in successfully.");
			req.reply(
			{
				"token": user.auth_token
			});
		});
	}
}

module.exports.args =
{
	"username": "string",
	"password": "string"
}
