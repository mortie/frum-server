module.exports = function(req, data, ctx, user)
{
	try
	{
		ctx.util.checkType(data.username, "string");
		ctx.util.checkType(data.password, "string");
	}
	catch (err)
	{
		return ctx.util.log("warning", "Bad request.", err);
	}

	user.login(data.username, data.password, function(valid)
	{
		if (valid)
			req.reply({"yay":"yay"});
		else
			req.error("EBADLOGIN");
	});
}
