var scrypt = require("scrypt");
var crypto = require("crypto");

module.exports = function(req, data, ctx, session)
{
	if (!session.loggedIn)
		return req.fail("ENOTLOGGEDIN");

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

	//callback to run when query is done
	function queryCallback(err, res)
	{
		if (err)
		{
			ctx.util.log("warning", "Error logging out all clients for user.", err);
			return req.fail("EUNKNOWN");
		}

		//loop over sessions to flag the relevant ones as logged out
		//session.userId is cached in uid, because the "session" variable is
		//one of the sessions which will have their "userId" property reset
		var uid = session.userId;
		ctx.sessions.forEach(function(s)
		{
			if (s && s.userId === uid)
				s.logout();
		});

		req.reply();
	}
}
