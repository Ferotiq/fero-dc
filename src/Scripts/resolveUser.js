"use strict";

module.exports = async (client, string) => {
	const user = client.users.cache.find(
		u =>
			u.id == string ||
			u.tag == string ||
			`<@!${u.id}>` == string ||
			`<@${u.id}>` == string
	);
	return user ? user : null;
};
