module.exports = function(req, data, ctx, session)
{
	if (!session.loggedIn)
		return req.fail("ENOTLOGGEDIN");

	session.logout();
	req.reply();
}
