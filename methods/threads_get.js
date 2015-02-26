module.exports = function(req, data, ctx, session)
{
	if (typeof data.category_id === "number")
		var categoryId = data.category_id;

	ctx.db.query(
		"SELECT threads.id, threads.name, threads.date_created, "+
		"       threads.user_id, threads.category_id, users.username, users.id "+
		"FROM threads, users "+
		"WHERE users.id = threads.user_id "+
		(categoryId ? "AND threads.category_id = "+categoryId : "")+
		"ORDER BY threads.date_created DESC "+
		"LIMIT "+data.count+" "+
		"OFFSET "+data.offset,
		queryCallback
	);

	function queryCallback(err, res)
	{
		if (err)
		{
			ctx.util.log("warning", "Error querying database for threads.", err);
			return req.fail("EUNKNOWN");
		}

		req.reply(
		{
			"threads": res.rows
		});
	}
}

module.exports.args =
{
	"offset": "number",
	"count": "number"
}
