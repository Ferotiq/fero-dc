"use strict";

const Command = require("../Classes/Command.js"),
	Client = require("../Classes/Client.js"),
	Discord = require("discord.js");

module.exports = (client, options) => {
	return new Command({
		name: "help",
		desc: "Shows a help embed",
		aliases: ["help"],
		permissions: ["SEND_MESSAGES"],
		category: "other",
		argumentDescriptions: [
			{
				argument: "command",
				desc: "The command to get information on",
				optional: true
			}
		],
		slashCommand: {
			bool: options.slashCommand,
			options: [
				{
					name: "command",
					description: "The command to get information on",
					type: "STRING",
					required: false
				}
			]
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
				if (
					command.name == "help" &&
					client.clientOptions.builtInHelpCommand != false
				) {
					command.args.push({
						name: "",
						fullName: "command",
						type: "command"
					});
					command.argumentDescriptions.push({
						argument: "command",
						desc: "The command to get info on (optional)."
					});
				}

				embed
					.setDescription(
						`Info about the \`${command.name}\` command.`
					)
					.addFields(
						{
							name: "Description",
							value: command.desc || "No description provided.",
							inline: false
						},
						{
							name: "Arguments",
							value:
								[
									`\`${client.getCommandUsage(
										command,
										message.guild
									)}\`\n`,
									...command.args.map(
										v =>
											`\`${getName(v)} (${v.type}${
												find(v, command) != undefined &&
												find(v, command).optional
													? ", optional"
													: ""
											})\`: ${
												find(v, command) != undefined
													? find(v, command)?.desc ??
													  "No description provided."
													: "No description provided."
											}`
									)
								].join("\n") || "None",
							inline: false
						},
						{
							name: "Types",
							value:
								[
									...new Set(
										command.args.map(
											v =>
												`\`${v.type}\`: ${
													client.converterTypes[
														v.type
													]
												}`
										)
									)
								].join("\n") || "No arguments for this command",
							inline: false
						},
						{
							name: "Category",
							value: FLC(command.category || "None"),
							inline: true
						},
						{
							name: "Permissions",
							value:
								command.permissions
									.map(v =>
										typeof v == "string"
											? v
													.toLowerCase()
													.split(/_+/)
													.map(v2 => FLC(v2))
													.join(" ")
											: "Permissions Object"
									)
									.join(", ") || "None",
							inline: true
						},
						{
							name: "Slash Command",
							value: command.slashCommand.bool
								? "Enabled"
								: "Disabled",
							inline: true
						},
						{
							name: "Aliases",
							value: command.aliases.join(", ") || "None",
							inline: true
						},
						{
							name: "Subcommands",
							value:
								client.subcommands
									.filter(s =>
										s.parent.startsWith(command.name)
									)
									.map(s => `\`${s.name}\`: ${s.desc}`)
									.join("\n") || "None",
							inline: true
						}
					);
			} else
				embed.addFields(
					client.commandCategories
						.filter(v => v != null)
						.map(v => {
							return {
								name:
									v[0].toUpperCase() +
									v.slice(1).toLowerCase(),
								value: client.commands
									.filter(v2 => v2.category == v)
									.map(v2 => `\`${v2.name}\`: ${v2.desc}\n`)
									.join(" ")
							};
						})
				);

			try {
				message.reply("Sending a help embed now!");
				message.author.send(embed);
			} catch {
				message.reply(embed);
			}
		}
	});
};

/**
 * @param {{argument: String}} v
 * @param {Command} command
 */
function find(v, command) {
	return command.argumentDescriptions.find(v2 => v2.argument == v.fullName);
}

/**
 * @param {{name: String, fullName: String}} v
 */
function getName(v) {
	const s =
		v.fullName != v.name && (v.name.match(/[a-zA-Z]/)?.length > 0 ?? false)
			? v.name
			: v.fullName;
	return FLL(s);
}

/**
 * @param {String} s
 * @returns {String}
 */
function FLC(s) {
	return s.substring(0, 1).toUpperCase() + s.substring(1);
}

function FLL(s) {
	return s.substring(0, 1).toLowerCase() + s.substring(1);
}
