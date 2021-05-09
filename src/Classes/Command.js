const Discord = require("discord.js");

module.exports = class Command {

    /**
     * @typedef {{name: String, value: any}} SlashCommandChoice
     * @typedef {{name: String, description: String, type: Integer, required?: Boolean, options?: Array<SlashCommandOption>, choices?: SlashCommandChoice[]}} SlashCommandOption
     * @typedef {{argument: String, desc: String}} ArgumentDescription
     * @typedef {{fullName: String, name: String, type: String}} Argument
     * @typedef {{name: String, desc: String, aliases: String[], permissions: Discord.Permissions[] | String[], usage: String, category: String, slashCommand: {bool: Boolean, options?: SlashCommandOption[]}, argumentDescriptions?: ArgumentDescription[], run: Function}} CommandOptions
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
        if (!this.aliases.length) throw Error("Fero-DC: Command has no aliases");
        this.permissions = options.permissions || new Array();
        this.usage = options.usage || "";
        this.category = options.category || "other";
        this.slashCommand = options.slashCommand || {
            bool: false,
            options: []
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

}