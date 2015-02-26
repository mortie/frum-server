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
		var user = res.rows[0];

		req.reply(
		{
			"username": user.username
		});
	}
}
