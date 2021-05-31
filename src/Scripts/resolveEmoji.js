/** @format */

"use strict";

module.exports = async (client, string) => {
	const emoji = client.emojis.cache.find(
		e => e.id == string || e.name == string || e.url == string
	);
	return emoji ? emoji : null;
};
