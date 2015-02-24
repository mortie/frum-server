var scrypt = require("scrypt");
var crypto = require("crypto");

module.exports = function(req, data, ctx, session)
{
	if (session.loggedIn)
		return req.fail("ELOGGEDIN");

	//Insert into database. Query will fail if user exists.
	ctx.db.query(
		"INSERT INTO users (username, pass_hash, auth_token, date_created) "+
		"VALUES ($1, $2, $3, NOW()) "+
		"RETURNING id, auth_token",
		[
			data.username,
			scrypt.passwordHashSync(password, 0.1),
			crypto.randomBytes(64).toString("hex")
		],
		function(err, res)
	{
		if (err && err.constraint === "users_username_key")
		{
			return req.fail("EUSEREXISTS");
		}
		else if (err)
		{
			ctx.util.log("warning", "Error inserting user to database.", err);
			return req.fail("EUNKNOWN");
		}

		var user = res.rows[0];

		session.loggedIn = true;
		session.userId = user.id;

		ctx.util.log("info", "User '"+data.username+"' registered successfully.");
		req.reply(user.auth_token);
	});
}

module.exports.args =
{
	"username": "string",
	"password": "string"
}
