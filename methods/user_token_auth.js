module.exports = function(req, data, ctx, session)
{
	if (session.loggedIn)
		return req.fail("ELOGGEDIN");

	//Query the database for users with the provided username
	ctx.db.query(
		"SELECT id "+
		"FROM users "+
		"WHERE auth_token=$1",
		[data.token],
		function(err, res)
	{
		ctx.util.log("warning", "Error querying database for user.", err);
		if (err)
			return req.fail("EUNKNOWN");

		//If no rows are returned, the user doesn't exist
		if (res.rowCount === 0)
			return req.fail("EBADLOGIN");

		var user = res.rows[0];

		session.loggedIn = true;
		session.userId = user.id;

		req.reply();;
	});
}

module.exports.args =
{
	"token": "string"
}
