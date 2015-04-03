module.exports = function(req, data, ctx, session)
{
	ctx.db.query(
		"SELECT posts.date_created, users.username, posts.html "+
		"FROM users, posts, threads "+
		"WHERE posts.user_id = users.id "+
		"AND posts.thread_id = $1 "+
		"AND threads.id = $1 "+
		"ORDER BY posts.date_created ASC "+
		"LIMIT "+data.count+" "+
		"OFFSET "+data.offset,
		[data.thread_id],
		queryCallback
	);

	function queryCallback(err, res)
	{
		if (err)
		{
			ctx.util.log("warning", "Error querying database for posts.", err);
			return req.fail("EUNKNOWN");
		}

		req.reply(
		{
			"posts": res.rows
		});
	}
}

module.exports.args =
{
	"thread_id": "number",
	"offset": "number",
	"count": "number"
}
