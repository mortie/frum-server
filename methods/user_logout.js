module.exports = function(req, data, ctx, session)
{
	if (!session.loggedIn)
		return cb("ENOTLOGGEDIN");

	session.loggedIn = false;
	req.reply();
}
