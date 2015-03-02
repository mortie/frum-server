module.exports = function(req, data, ctx, session)
{
	if (!session.loggedIn)
		return req.fail("ENOTLOGGEDIN");

	ctx.db.query(
		"SELECT username "+
		"FROM users "+
		"WHERE id=$1",
		[session.userId],
		queryCallback
	);

	function queryCallback(err, res)
	{
		if (err || res.rowCount === 0)
		{
			ctx.util.log("warning", "Failed to query for user.", err || undefined);
			return req.fail("EUNKNOWN");
		}

		var user = res.rows[0];

		req.reply(
		{
			"username": user.username
		});
	}
}
