const Discord = require("discord.js");
const Command = require("../Classes/Command.js");

module.exports = new Command({
    name: "getSlashCommands",
    desc: "Gets slash commands",
    aliases: ["getSlashCommands"],
    permissions: ["325757696118882305", "ADMINISTRATOR", "MANAGE_MESSAGES", "825393027416719411", "MOD"],
    usage: "!getSlashCommands",
    slashCommand: {
        bool: true,
        options: []
    },
    /**
     * @param {Discord.Message} message 
     * @param {String[]} args 
     * @param {Discord.Client} client 
     */
    async run(message, args, client) {

        const commands = await client.interactionsClient.getCommands({});

        const embed = new Discord.MessageEmbed()
            .setTitle("Slash Commands")
            .addFields(commands.map(v => {
                return {
                    name: v.name,
                    value: `\`${v.description}\``,
                    inline: false
                }
            }));

        message.reply(embed);

    }
});