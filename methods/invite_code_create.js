var crypto = require("crypto");

module.exports = function(req, data, ctx, session)
{
	if (!session.loggedIn)
		return req.fail("ENOTLOGGEDIN");

	ctx.util.getPerms(ctx.db, session.userId, function(err, res)
	{
		if (err)
			return req.fail(err);

		if (res.perm_invite !== true)
			return req.fail("ENOPERM");

		var inviteCode = crypto.randomBytes(32).toString("hex");

		ctx.db.query(
			"INSERT INTO invite_codes (code, user_id) "+
			"VALUES ($1, $2) ",
			[inviteCode, session.userId],
			queryCallback
		);

		function queryCallback(err, res)
		{
			if (err)
			{
				ctx.util.log("warning", "Failed to execute query to create invite code.", err);
				return req.fail("EUNKNOWN");
			}

			req.reply(
			{
				"code": inviteCode
			});
		}
	});
}
