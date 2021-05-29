"use strict";

module.exports = async (message, string) => {
	const invite = (await message.guild.fetchInvites()).find(
		e => e.code == string || e.url == string
	);
	return invite ? invite : null;
};
