var scrypt = require("scrypt");

module.exports = function(req, data, ctx, session)
{
	if (session.loggedIn)
		return cb("ELOGGEDIN");

	//Query the database for users with the provided username
	ctx.db.query(
		"SELECT id, pass_hash, auth_token "+
		"FROM users "+
		"WHERE username=$1",
		[data.username],
		function(err, res)
	{
		ctx.util.log("warning", "Error querying database for user.", err);
		if (err)
			return req.fail("EUNKNOWN");

		//If no rows are returned, the user doesn't exist
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
	});
}

module.exports.args =
{
	"username": "string",
	"password": "string"
}
