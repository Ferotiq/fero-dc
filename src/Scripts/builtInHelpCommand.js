const Command = require("../Classes/Command.js"),
    Client = require("../Classes/Client.js"),
    Discord = require("discord.js");

module.exports = (client, options) => {

    return new Command({
        name: "help",
        desc: "Shows a help embed",
        aliases: ["help"],
        permissions: ["SEND_MESSAGES"],
        usage: "!help <command?>",
        category: "other",
        slashCommand: {
            bool: options.slashCommand,
            options: [{
                name: "command",
                description: "The command to get information on",
                type: 3,
                required: false
            }]
        },

        /**
         * @param {Discord.Message} message 
         * @param {String[]} args 
         * @param {Client} client 
         * @param {Command} command 
         */
        async run(message, args, client, command) {

            const embed = new Discord.MessageEmbed(options);

            embed.setTitle(`${client.user.username}: Help`);

            if (command && command instanceof Command) {
                if (command.name == "help" && client.clientOptions.builtInHelpCommand != false) {
                    command.args.push({
                        name: "",
                        fullName: "command",
                        type: "command"
                    });
                    command.argumentDescriptions.push({
                        argument: "command",
                        desc: "The command to get info on (optional)."
                    });
                };
                embed.setDescription(`Info about the \`${command.name}\` command.`)
                    .addFields({
                        name: "Description",
                        value: command.desc || "No description provided."
                    }, {
                        name: "Arguments",
                        value: [`\`${command.usage || `${client.prefix}${command.name} ${command.args.map(v => `<${v.fullName}>`).join(" ")}`}\`\n`, ...command.args.map(v => `\`${v.fullName} (${v.type})\`: ${find(v, command) != undefined ? find(v, command)?.desc ?? "No description provided.": "No description provided."}`)].join("\n") || "None"
                    }, {
                        name: "Category",
                        value: command.category || "None",
                        inline: true
                    }, {
                        name: "Permissions",
                        value: command.permissions.map(v => typeof (v) == "string" ? v : "PObject").join(", ") || "None",
                        inline: true
                    }, {
                        name: "Slash Command",
                        value: new String(command.slashCommand.bool) || "false",
                        inline: true
                    }, {
                        name: "Aliases",
                        value: command.aliases.join(", ") || "None",
                        inline: true
                    }, {
                        name: "Subcommands",
                        value: client.subcommands.filter(s => s.parent.startsWith(command.name)).map(s => `\`${s.name}\`: ${s.desc}`).join("\n") || "None",
                        inline: true
                    });
            } else embed.setDescription(`Commands:\n${client.commands.sort((a, b) => a.category.localeCompare(b.category)).map(c => `\`${c.category}\`: \`${c.name}\`: ${c.desc}`).join("\n")}`);

            try {
                message.reply("Sending a help embed now!");
                message.author.send(embed);
            } catch {
                message.reply(embed);
            }

        }
    });
}

/**
 * @param {Command} command 
 * @returns 
 */
function find(v, command) {
    return command.argumentDescriptions.find(v2 => v2.argument == v.fullName);
}