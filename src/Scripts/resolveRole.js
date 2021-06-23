/** @format */

"use strict";

module.exports = async (message, string) => {
	const role = message.guild.roles.cache.find(
		r => r.id == string || r.name == string
	);
	return role ? role : null;
};
