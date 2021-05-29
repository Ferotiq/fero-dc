"use strict";

const Discord = require("discord.js");

/**
 * @enum {Number}
 */
const SlashCommandOptionTypeEnum = {
	SUB_COMMAND: 1,
	SUB_COMMAND_GROUP: 2,
	STRING: 3,
	INTEGER: 4,
	BOOLEAN: 5,
	USER: 6,
	CHANNEL: 7,
	ROLE: 8,
	MENTIONABLE: 9,
};

module.exports = class Command {
	/**
	 * @typedef {"SUB_COMMAND" | "SUB_COMMAND_GROUP" | "STRING" | "INTEGER" | "BOOLEAN" | "USER" | "CHANNEL" | "ROLE" | "MENTIONABLE"} SlashCommandOptionType
	 * @typedef {{name: String, value: any}} SlashCommandChoice
	 * @typedef {{name: String, description: String, type: SlashCommandOptionType, required?: Boolean, options?: Array<SlashCommandOption>, choices?: SlashCommandChoice[]}} SlashCommandOption
	 * @typedef {{argument: String, desc: String, optional?: Boolean}} ArgumentDescription
	 * @typedef {{fullName: String, name: String, type: String}} Argument
	 * @typedef {{bool: Boolean, options?: SlashCommandOption[]}} SlashCommand
	 * @typedef {{name: String, desc: String, aliases: String[], permissions: Discord.PermissionResolvable[], usage: String, category: String, slashCommand: SlashCommand, argumentDescriptions?: ArgumentDescription[], run: Function}} CommandOptions
	 */

	/**
	 * Make a command that will automatically be inserted into the command handler
	 * @param {CommandOptions} options
	 */
	constructor(options = {}) {
		this.name = options.name;

		if (!this.name) throw Error("Fero-DC: Command has no name");

		this.desc = options.desc || "No description provided.";

		this.aliases = options.aliases || new Array();

		if (!this.aliases.length)
			throw Error("Fero-DC: Command has no aliases");

		this.permissions = options.permissions || new Array();

		this.usage = options.usage || "";

		this.category = options.category || null;

		/**
		 * @type {SlashCommand}
		 */
		this.slashCommand = {
			bool: options.slashCommand?.bool ?? false,
			options:
				options.slashCommand?.options?.map(v => {
					if (typeof v.type == "string")
						v.type = SlashCommandOptionTypeEnum[v.type];
					return v;
				}) ?? [],
		};

		/**
		 * @type {ArgumentDescription[]}
		 */
		this.argumentDescriptions = options.argumentDescriptions || new Array();

		/**
		 * @type {Argument[]}
		 * @private
		 * @readonly
		 */
		this.args = new Array();

		const noFunctionSet = () => {};

		this.run = options.run || noFunctionSet;
	}
};
