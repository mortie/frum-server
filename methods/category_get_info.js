module.exports = function(req, data, ctx, session)
{
	ctx.db.query(
		"SELECT name, description "+
		"FROM categories "+
		"WHERE id = $1",
		[data.id],
		queryCallback
	);

	function queryCallback(err, res)
	{
		if (err)
		{
			ctx.util.log("Error querying database for category.", err);
			req.fail("EUNKNOWN");
		}

		req.reply(res.rows[0]);
	}
}

module.exports.args =
{
	"id": "number"
}
