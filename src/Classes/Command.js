const Discord = require("discord.js");

module.exports = class Command {
    /**
     * * name - the name of the command
     * * desc - the description of the command
     * * aliases - the aliases or shortened names of the command
     * * args - the arguments of the command
     * * permissions - the permission needed to run the command
     * * usage - how to use the command in Discord (optional)
     * * slashCommand - whether or not to add slash commands off of the name and description
     * * run - the function that will run once the command is called
     * @param {{name: String, desc: String, aliases: String[], permissions: Discord.Permissions[] | String[], usage: String, slashCommand: {bool: Boolean, options?: Array} , run: Function}} options 
     */
    constructor(options = {}) {

        this.name = options.name;
        this.desc = options.desc;
        this.aliases = options.aliases;
        this.args = [];
        this.permissions = options.permissions;
        this.usage = options.usage || "";
        this.slashCommand = options.slashCommand;
        this.run = options.run;

    }

}