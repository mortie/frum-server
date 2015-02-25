module.exports = function(req, data, ctx, session)
{
	if (!session.loggedIn)
		return cb("ENOTLOGGEDIN");

	session.logout();
	req.reply();
}
