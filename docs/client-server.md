# Client <-> Server Communication

This document specifies communication between the client and the server.

All client-server communication happens by sending json objects via websockets. There are two kinds of messages sent from the server to the client: events and responses to method calls. Responses to method calls are sent exactly once per method call the client sends, while events aren't directly caused by a method call.

A message is guaranteed to be a response to a method call if the JSON object contains a property "r" (`request ID`), and is guaranteed to be an event if the object doesn't contain a property "r".

## Table Of Contents

* [Methods](#methods)
* [Error Codes](#error-codes)
* [Events](#events)

---

## Methods

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

### user_create

Register a new user. Session will be flagged as logged in if successful.

**Arguments**:

* **username**
* **password**
* **inviteCode**: Invitation code. Only required if "requireInvites" is set to true in the config.

**Returns**:

* **token**: Authentication token. Used with session_token_auth to authenticate without username and password.

### session_login

Log in with username and password. Session will be flagged as logged in if successful.

**Arguments**:

* **username**
* **password**

**Returns**:

* **token**: Authentication token. Used with session_token_auth to authenticate without username and password.

### session_token_auth

Log in with auth token instead of username and password.

**Arguments**:

* **token**: Authentication token. Obtained from session_login or user_create.

**Returns**:

Nothing.

### session_get_info

Get info about the currently logged in user.

**Arguments**:

None.

**Returns**:

* **username**

### session_logout

Log out. Session will be flagged as logged out if successful.

**Arguments**:

None.

**Returns**:

Nothing.

### session_logout_all

Log out all of the user's sessions. All sessions will be flagged as logged out if successful, and auth token will be invalidated. This means all sessions which want to log in again will have to obtain a new auth token.

**Arguments**:

None.

**Returns**:

Nothing.

### threads_get

Get a list of the most recent threads.

**Arguments**:

* **count**: Amount of posts you want.
* **offset**: Offset, to make pagination possible. Offset = (page-1) * count.
* **category_id**: Optional. If provided, only threads from the desired category will be returned.

**Returns**:

* **threads**: Array of objects:
	[
		{
			category_id
			date_created
			id
			name
			user_id
			username
		}
	]

### thread_get

Get contents of a thread.

**Arguments**:

* **id**

**Returns**:

* **category_id**
* **category_name**
* **date_created**
* **id**
* **name**
* **user_id**
* **username**
* **html**

### categories_get

Get a list of categories.

**Arguments**:

None.

**Retuns**:

* **categories**: An array of objects:
	[
		{
			id
			name
			description
		}
	]

### invite_code_create

Get an invite code to invite other members.

**Arguments**:

None.

**Returns**:

* **code**

---

## Error Codes

This is a list of possible error codes returned to the client by the server.

* **EUNKNOWN**: An unknown error occurred (all)
* **ENOMETH**: No such method (all)
* **EBADARGS**: Bad arguments (all)
* **EUSEREXISTS**: User already exists (user_create)
* **EINVITECODE**: Invalid invite code supplied (user_create)
* **EBADLOGIN**: Invalid username, pasword, or auth token (session_login, session_token_auth)
* **ELOGGEDIN**: Already logged in (register, session_login, session_token_auth)
* **ENOTLOGGEDIN**: Not logged in (session_logout, session_logout_all, session_get_info)
* **ENOPERM**: Permission denied (invite_code_create)

---

## Events

These are "events", messages the server sends to the client that aren't triggered directly by a method call.

All events will be sent from the server as json, looking like this:

	{
		"e": event,
		"data": object
	}

### login

The session has successfully logged in.

**Data**:

Nothing.

### logout

The session has been logged out.

**Data**:

Nothing.
