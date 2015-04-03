var marked = require("marked");

module.exports = function(req, data, ctx, session)
{
	if (!session.loggedIn)
		return req.fail("ENOPERM");

	var html = marked(data.content);

	ctx.db.query(
		"INSERT INTO threads (name,  user_id, category_id) "+
		"VALUES ($1, $2, $3) "+
		"RETURNING id",
		[data.name, session.userId, data.category_id],
		threadQueryCallback
	);

	function threadQueryCallback(err, res)
	{
		if (err)
		{
			ctx.util.log("warning", "Failed query to create new thread.", err);
			return req.fail("EUNKNOWN");
		}

		ctx.db.query(
			"INSERT INTO posts (html, raw_text, user_id, thread_id) "+
			"VALUES ($1, $2, $3, $4) "+
			"RETURNING thread_id",
			[html, data.content, session.userId, res.rows[0].id],
			postQueryCallback
		);
	}

	function postQueryCallback(err, res)
	{
		if (err)
		{
			ctx.util.log("warning", "Failed query to create new post.", err);
			return req.fail("EUNKNOWN");
		}

		req.reply(
		{
			"thread_id": res.rows[0].thread_id
		});
	}
}

module.exports.args =
{
	"name": "string",
	"content": "string",
	"category_id": "number"
}

module.exports.perms =
[
	"newthread"
]
