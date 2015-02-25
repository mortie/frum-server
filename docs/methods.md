# Methods

These are "methods", things the client can request to have specific functions performed. The source code for each method is in `methods/{methodNome}.js`, and methods are automatically included from there on startup.

All method requests should be sent as json, looking like this:

	{
		"m": method name,
		"r": request ID,
		"d": arguments (object)
	}

Replies will look like this:

	{
		"r": request ID,
		"d": arguments (object)
	}

Or like this, in the case of an error:

	{
		"r": request ID,
		"err": error code
	}

The `request ID` must be unique for each request, and will be how the client routes a reply to the correct callback.

Please note that if the client recieves an object without an `request ID`, it's not a reply to a method call. It's likely an event.

All communication takes place over websockets.

## user_register

Register a new user. Session will be flagged as logged in if successful.

**Arguments**:

* **username**
* **password**
* **inviteCode**: Invitation code. Only required if "requireInvites" is set to true in the config.

**Returns**:

* **token**: Authentication token. Used with user_token_auth to authenticate without username and password.

## user_login

Log in with username and password. Session will be flagged as logged in if successful.

**Arguments**:

* **username**
* **password**

**Returns**:

* **token**: Authentication token. Used with user_token_auth to authenticate without username and password.

## user_token_auth

Log in with auth token instead of username and password.

**Arguments**:

* **token**: Authentication token. Obtained from user_login or user_register.

**Returns**:

Nothing.

## user_logout

Log out. Session will be flagged as logged out if successful.

**Arguments**:

None.

**Returns**:

Nothing.

## user_logout_all

Log out all sessions. All sessions will be flagged as logged out if successful, and auth token will be invalidated. This means all sessions which want to log in again will have to obtain a new auth token.

**Arguments**:

None.

**Returns**:

Nothing.
