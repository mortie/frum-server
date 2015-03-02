module.exports = function(req, data, ctx, session)
{
	if (!session.loggedIn)
		return req.fail("ENOPERM");

	ctx.util.getPerms(ctx.db, session.userId, function(err, perms)
	{
		if (err)
			return req.fail(err);

		if (!perms.perm_newcat)
			return req.fail("ENOPERM");

		ctx.db.query(
			"INSERT INTO categories (name,  description) "+
			"VALUES ($1, $2) "+
			"RETURNING id",
			[data.name, data.description],
			queryCallback
		);

		function queryCallback(err, res)
		{
			if (err)
			{
				ctx.util.log("warning", "Failed query to create new category.", err);
				return req.fail("EUNKNOWN");
			}

			req.reply(
			{
				"id": res.rows[0].id
			});
		}
	});
}

module.exports.args =
{
	"name": "string",
	"description": "string"
}
