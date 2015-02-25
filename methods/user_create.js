var scrypt = require("scrypt");
var crypto = require("crypto");

module.exports = function(req, data, ctx, session)
{
	if (session.loggedIn)
		return req.fail("ELOGGEDIN");

	if (ctx.conf.requireInvites && data.inviteCode === undefined)
		return req.fail("EINVITECODE");

	//query database for invite code, if appliccable
	if (ctx.conf.requireInvites)
	{
		ctx.db.query(
			"SELECT id FROM invite_codes "+
			"WHERE code=$1",
			[req.inviteCode],
			rejectIfInvalid
		);
	}
	else
	{
		rejectIfInvalid(true);
	}

	//reject if invite code is invalid, if appliccable
	function rejectIfInvalid(err, res)
	{
		if (res && res.rowCount > 0)
		{
			ctx.db.query(
				"DELETE FROM invite_codes "+
				"WHERE id=$1",
				[res.rows[0].id],
				insertUser
			);
		}
		else if (!ctx.conf.requireInvites)
		{
			insertUser();
		}
		else
		{
			req.fail("EINVITECODE");
		}
	}

	//insert new user
	function insertUser(err, res)
	{
		if (err)
		{
			ctx.util.log("warning", "Failed to delete invite codes.", err);
			return req.fail("EUNKNOWN");
		}

		ctx.db.query(
			"INSERT INTO users (username, pass_hash, auth_token, date_created) "+
			"VALUES ($1, $2, $3, NOW()) "+
			"RETURNING id, auth_token",
			[
				data.username,
				scrypt.passwordHashSync(data.password, 0.1),
				crypto.randomBytes(64).toString("hex")
			],
			userInserted
		);
	}

	//user is now inserted
	function userInserted(err, res)
	{
		if (err && err.constraint === "users_username_key")
		{
			return req.fail("EUSEREXISTS");
		}
		else if (err)
		{
			return req.fail("EUNKNOWN");
		}

		var user = res.rows[0];

		session.loggedIn = true;
		session.userId = user.id;

		ctx.util.log("info", "User '"+data.username+"' registered successfully.");
		req.reply(
		{
			"token": user.auth_token
		});
	}
}

module.exports.args =
{
	"username": "string",
	"password": "string"
}
