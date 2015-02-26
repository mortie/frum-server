CREATE TABLE groups
(
	id SERIAL PRIMARY KEY,
	name VARCHAR(64) NOT NULL,
	perm_admin BOOLEAN NOT NULL,
	perm_invite BOOLEAN NOT NULL
);

CREATE TABLE categories
(
	id SERIAL PRIMARY KEY,
	name VARCHAR(256) NOT NULL,
	sort SERIAL UNIQUE,
	description TEXT NOT NULL
);

CREATE TABLE users
(
	id SERIAL PRIMARY KEY,
	username VARCHAR(64) UNIQUE NOT NULL,
	pass_hash CHAR(128) NOT NULL,
	auth_token CHAR(128) NOT NULL,
	date_created TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW(),

	group_id INTEGER REFERENCES groups ON DELETE RESTRICT
);

CREATE TABLE invite_codes
(
	id SERIAL PRIMARY KEY,
	code CHAR(64),
	date_created TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW(),

	user_id INTEGER REFERENCES users (id) ON DELETE CASCADE
);

CREATE TABLE threads
(
	id SERIAL PRIMARY KEY,
	name VARCHAR(256) NOT NULL,
	html TEXT NOT NULL,
	raw_text TEXT NOT NULL,
	date_created TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),

	user_id INTEGER REFERENCES users (id) ON DELETE RESTRICT,
	category_id INTEGER REFERENCES categories (id) ON DELETE RESTRICT
);


CREATE TABLE posts
(
	ID SERIAL PRIMARY KEY,
	html TEXT NOT NULL,
	raw_text TEXT NOT NULL,
	date_created TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),

	user_id INTEGER REFERENCES users (id) ON DELETE RESTRICT,
	thread_id INTEGER REFERENCES threads (id) ON DELETE RESTRICT
);


--Create initial admin group.

INSERT INTO groups (name, perm_admin, perm_invite)
VALUES
(
	'Admin',
	TRUE,
	TRUE
);


-- Create initial admin user.
-- 'pass_hash' is initialized to a hash of "admin",
-- as that's the password for our new user.

INSERT INTO users (username, pass_hash, auth_token, group_id)
VALUES
(
	'admin',
	'c2NyeXB0AAwAAAAIAAAAAWYxeruX5M7APJeMIVFleLTBKyJAevx6uQUiia/8onBZHszbc/K0H5NWSJma0mI8CM2eLbd+x/OuxwFIEtw7DFGbrRjRgHJuO9Fhhjagnccm',
	'66713e8fd159df4d91f5e554de1d8246ccf5241ff00ace5076678668ea7e2924fd6dc4b87629ff7a5bc8a01a5e3584e5ccac6dc5fab72b9b2deefbf7337a6970',
	1
);


-- Automatically delete invite codes that are over 2 days old.

CREATE FUNCTION delete_old_invite_codes() RETURNS trigger
	LANGUAGE plpgsql
	AS $$
BEGIN
	DELETE FROM invite_codes
	WHERE date_created < NOW() - INTERVAL '2 days';
	RETURN NEW;
END;
$$;

CREATE TRIGGER delete_old_invite_codes_gc
	AFTER INSERT ON invite_codes
	EXECUTE PROCEDURE delete_old_invite_codes();
