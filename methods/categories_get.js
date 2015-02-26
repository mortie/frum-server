module.exports = function(req, data, ctx, session)
{
	ctx.db.query(
		"SELECT id, name, description "+
		"FROM categories "+
		"ORDER BY sort",
		queryCallback
	);

	function queryCallback(err, res)
	{
		if (err)
		{
			ctx.log("warning", "Error querying for categories.", err);
			return req.fail("EUNKNOWN");
		}

		req.reply(
		{
			"categories": res.rows
		});
	}
}
