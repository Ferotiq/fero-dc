const Discord = require("discord.js");
const Command = require("../Classes/Command.js");

module.exports = new Command({
    name: "removeCommand",
    desc: "Removes a command",
    aliases: ["removeCommand"],
    permissions: ["SEND_MESSAGES"],
    usage: "!removeCommand <command>",
    slashCommand: {
        bool: true,
        options: [{
            name: "command",
            description: "The command to delete",
            type: 3,
            required: true
        }]
    },
    /**
     * @param {Discord.Message} message 
     * @param {String[]} args 
     * @param {Discord.Client} client 
     */
    async run(message, args, client) {

        await client.interactionsClient.deleteCommand(args[1]);

        message.reply("removed command");

    }
});