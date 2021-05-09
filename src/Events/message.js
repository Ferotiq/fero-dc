const Event = require("../Classes/Event.js"),
    InteractionMessage = require("../Classes/InteractionMessage.js");

module.exports = new Event({
    name: "message",
    async run(client, message) {

        if (message.author.bot || message.channel.type != "text") return;

        if (!message.content.startsWith(client.prefix) && !message.content.startsWith("/")) return;

        const args = message instanceof InteractionMessage ? message.args : message.content.substring(client.prefix.length).split(/ +/);

        const command = await client.commands.find(command => command.aliases.includes(args[0]));

        if (!command) return message.reply("Command not found.");

        if (!await client.checkPermissions(command, message.member, {
                "MOD": ["825393027416719411"]
            })) return message.reply("You do not have the correct permissions to run this command.");

        const result = await client.runCommand(command, message, args);

        if (result == "usage") return message.reply(`Usage: ${command.usage}`);

        if (result == "permission") return message.reply("You do not have the correct permissions to run this command.");

    }
});