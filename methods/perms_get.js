module.exports = function(req, data, ctx, session)
{
	//if the user isn't logged in, they don't have permission to do anything.
	if (!session.loggedIn)
	{
		return req.reply(
		{
			"perms": []
		});
	}

	ctx.util.getPerms(ctx.db, session.userId, function(err, perms)
	{
		if (err)
			return req.fail(err);

		var res = [];
		for (var i in perms)
		{
			if (perms[i] === true)
				res.push(i);
		}

		req.reply(
		{
			"perms": res
		});
	});
}
