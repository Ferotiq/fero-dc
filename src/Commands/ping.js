const Discord = require("discord.js");
const Command = require("../Classes/Command.js");
const interactionMessage = require("../Classes/interactionMessage.js");

module.exports = new Command({
    name: "ping",
    desc: "Does a ping thing",
    aliases: ["ping"],
    permissions: ["SEND_MESSAGES"],
    category: "music",
    slashCommand: {
        bool: true,
        options: []
    },
    argumentDescriptions: [{ argument: "emoji", desc: "A Discord Emoji" }],
    /**
     * @param {interactionMessage | Discord.Message} message 
     * @param {String[]} args 
     * @param {Discord.Client} client 
     */
    async run(message, args, client, emoji) {
        message.reply(`Ping: ${client.ws.ping} ms. ${emoji}`);   
    }
});