/** @format */

"use strict";

module.exports = async (client, string) => {
	const channel = client.channels.cache.find(
		c => c.id == string || `<#!${c.id}>` == string || `<#${c.id}>` == string
	);
	return channel ? channel : null;
};
