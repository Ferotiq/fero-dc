/** @format */

"use strict";

const fs = require("fs"),
	Client = require("./Classes/Client"),
	Discord = require("discord.js");
/**
 * @typedef {{cmdLoadedMsg: boolean, eventLoadedMsg: boolean, subLoadedMsg: boolean, emitMessageOnInteraction: boolean, builtInHelpCommand: HelpCmdStyle | false, debug: boolean, deleteUnusedSlashCommands: boolean}} Bools
 * @typedef {{token: String, prefix: String} & Bools & Discord.ClientOptions} Config
 */
module.exports = {
	Discord,
	Buttons: require("discord-buttons"),
	Client,
	Interaction: require("./Classes/Interaction"),
	Command: require("./Classes/Command"),
	Subcommand: require("./Classes/Subcommand"),
	Event: require("./Classes/Event"),
	/**
	 * @param {String} path
	 * @returns {Config}
	 */
	parseConfig: path => JSON.parse(fs.readFileSync(path))
};
