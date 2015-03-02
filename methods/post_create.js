var marked = require("marked");

module.exports = function(req, data, ctx, session)
{
	if (!session.loggedIn)
		return req.fail("ENOPERM");

	ctx.util.getPerms(ctx.db, session.userId, function(err, perms)
	{
		if (err)
			return req.fail(err);

		if (!perms.perm_newpost)
			return req.fail("ENOPERM");

		var html = marked(data.content);

		ctx.db.query(
			"INSERT INTO posts (html, raw_text, user_id, thread_id) "+
			"VALUES ($1, $2, $3, $4) "+
			"RETURNING id",
			[html, data.content, session.userId, data.thread_id],
			queryCallback
		);

		function queryCallback(err, res)
		{
			if (err)
			{
				ctx.util.log("warning", "Failed query to create new post.", err);
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
	"content": "string",
	"thread_id": "number"
}
