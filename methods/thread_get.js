module.exports = function(req, data, ctx, session)
{
	ctx.db.query(
		"SELECT threads.id, threads.name, threads.date_created, threads.html, "+
		"       threads.user_id, threads.category_id, users.username, users.id, "+
		"       categories.name AS category_name "+
		"FROM threads, users, categories "+
		"WHERE threads.user_id = users.id "+
		"AND threads.id = $1",
		[data.id],
		queryCallback
	);

	function queryCallback(err, res)
	{
		if (err)
		{
			ctx.util.log("warning", "Failed to query for thread.", err);
			return req.fail("EUNKNOWN");
		}

		req.reply(res.rows[0]);
	}
}

module.exports.args =
{
	"id": "number"
}
