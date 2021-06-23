/** @format */

"use strict";

const Discord = require("discord.js"),
	Client = require("./Client.js");

/**
 * @param {Discord.Message} message
 * @param {String[]} args
 * @param {Client} client
 */
 function RunFunction(message, args, client, ...extra = []) {}

module.exports = class Subcommand {
	/**
	 * @typedef {{name: String, desc: String, aliases: String[], permissions: Discord.Permissions[] | String[], parent: String, usage: String, run: RunFunction}} SubcommandOptions
	 */

	/**
	 * Make a subcommand that will automatically be inserted into the subcommand handler
	 * @param {SubcommandOptions} options
	 */
	constructor(options = {}) {
		this.name = options.name;

		if (!this.name) throw Error("Fero-DC: Subcommand has no name");

		this.desc = options.desc || "No description provided.";

		this.aliases = options.aliases || new Array();

		if (!this.aliases.length)
			throw Error("Fero-DC: Subcommand has no aliases");

		this.permissions = options.permissions || new Array();

		this.parent = options.parent;

		if (!this.parent) throw Error("Fero-DC: Subcommand has no parent");

		this.usage = options.usage || "";

		this.run = options.run;
	}
};
