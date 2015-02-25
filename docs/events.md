# Methods

These are "events", messages the server sends to the client that aren't triggered directly by a method call.

All events will be sent from the server as json, looking like this:

	{
		"e": event,
		"data": object
	}

Please note that if the client recieves an object with a `request ID`, it's not an event. It's likely a method call.

All communication takes place over websockets.

## login

The session has successfully logged in.

**Data**:

Nothing.

## logout

The session has been logged out.

**Data**:

Nothing.
