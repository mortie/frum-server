module.exports = function(req, data, ctx, session)
{
	if (!session.loggedIn)
		return req.fail("ENOTLOGGEDIN");

	ctx.db.query(
		"SELECT username, date_created "+
		"FROM users "+
		"WHERE id=$1",
		[session.userId],
		queryCallback
	);

	function queryCallback(err, res)
	{
		req.reply(
		{
			"user": 
	}
}
