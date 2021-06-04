/** @format */

"use strict";

// Imports
const Discord = require("discord.js"),
	discordButtons = require("discord-buttons"),
	fs = require("fs"),
	path = require("path"),
	colors = require("colors"),
	Command = require("./Command.js"),
	Subcommand = require("./Subcommand.js"),
	Event = require("./Event.js"),
	Interaction = require("./Interaction"),
	interactions = require("discord-slash-commands-client"),
	FMS = require("fero-ms"),
	resolveUser = require("../Scripts/resolveUser.js"),
	resolveChannel = require("../Scripts/resolveChannel.js"),
	resolveMessage = require("../Scripts/resolveMessage.js"),
	resolveEmoji = require("../Scripts/resolveEmoji.js"),
	resolveInvite = require("../Scripts/resolveInvite.js"),
	resolvePermission = require("../Scripts/resolvePermission.js"),
	resolveRole = require("../Scripts/resolveRole.js"),
	resolveSubcommand = require("../Scripts/resolveSubcommand.js"),
	builtInHelpCommand = require("../Scripts/builtInHelpCommand.js");

const stripComments =
		/(\/\/.*$)|(\/\*[\s\S]*?\*\/)|(\s*=[^,\)]*(('(?:\\'|[^'\r\n])*')|("(?:\\"|[^"\r\n])*"))|(\s*=[^,\)]*))/gm,
	argumentNames = /([^\s,]+)/g,
	falsy = [
		"false",
		"0",
		"0n",
		"null",
		"undefined",
		"NaN",
		"",
		"no",
		"off",
		null,
		undefined
	];

module.exports = class Client extends Discord.Client {
	/**
	 * Define types for simplicity
	 * @typedef {Discord.Collection<String | Discord.Guild, String> | [String | Discord.Guild, String][] | Map<String | Discord.Guild, String>} PrefixCollection
	 * @typedef {Discord.MessageEmbedOptions & { slashCommand: Boolean }} HelpCmdStyle
	 * @typedef {{cmdLoadedMsg: boolean, eventLoadedMsg: boolean, subLoadedMsg: boolean, emitMessageOnInteraction: boolean, builtInHelpCommand: HelpCmdStyle | false, debug: boolean, deleteUnusedSlashCommands: boolean}} Bools
	 * @typedef {{token: String, prefix: String} & Bools & Discord.ClientOptions} Config
	 * @typedef {{cmds: String, events: String, subs: String}} Paths
	 */

	/**
	 * Create a new Fero-DC Discord Client
	 * @param {Config} config - Stores bot token, prefix, bools, and client options
	 * @param {Paths} paths - Paths to the Commands, Subcommands, and Events folders
	 * @param {Object} modules - Stores modules/data that is requested to be stored in the client (key-value pairs)
	 * @extends {Discord.Client}
	 * @classdesc A built-on version of the standard Discord.js Client
	 * @class
	 */
	constructor(
		config = {
			token: "BOTTOKEN",
			prefix: "!",
			partials: [
				"CHANNEL",
				"GUILD_MEMBER",
				"MESSAGE",
				"REACTION",
				"USER"
			],
			fetchAllMembers: true,
			disableMentions: "everyone",
			cmdLoadedMsg: true,
			eventLoadedMsg: true,
			subLoadedMsg: true,
			emitMessageOnInteraction: false,
			builtInHelpCommand: false,
			debug: false,
			deleteUnusedSlashCommands: false
		},
		paths = {
			cmds: path.join(process.cwd(), "src", "Commands"),
			subs: path.join(process.cwd(), "src", "Subcommands"),
			events: path.join(process.cwd(), "src", "Events")
		},
		modules = {}
	) {
		// Initiate Discord Client
		super(config);

		this.disbut = discordButtons(this);

		// Collections for the Handlers
		/**
		 * A collection with all the commands
		 * @type {Discord.Collection<String, Command>}
		 */
		this.commands = new Discord.Collection();
		/**
		 * A collection with all the subcommands
		 * @type {Discord.Collection<String, Subcommand>}
		 */
		this.subcommands = new Discord.Collection();
		/**
		 * An array with all the command categories
		 * @type {String[]}
		 */
		this.commandCategories = new Array();

		// Add Discord
		this.discord = Discord;

		/**
		 * The default prefix for the client
		 * @type {String}
		 */
		this.defaultPrefix = config.prefix;
		/**
		 * The collection for guild prefixes
		 * @type {Discord.Collection<String, String>}
		 */
		this.prefixes = new Discord.Collection();
		/**
		 * The boolean values passed into the client (bools)
		 * @type {Bools}
		 */
		this.bools = {
			cmdLoadedMsg: config.cmdLoadedMsg,
			subLoadedMsg: config.subLoadedMsg,
			eventLoadedMsg: config.eventLoadedMsg,
			emitMessageOnInteraction: config.emitMessageOnInteraction,
			builtInHelpCommand: config.builtInHelpCommand,
			debug: config.debug,
			deleteUnusedSlashCommands: config.deleteUnusedSlashCommands
		};
		/**
		 * The paths to all handlers
		 * @type {Paths}
		 */
		this.paths = paths;
		/**
		 * The modules passed into the client
		 */
		this.modules = modules;

		// Add folders for the paths if they don't exist
		Object.entries(this.paths).forEach(p => {
			if (!fs.existsSync(p[1])) fs.mkdirSync(p[1]);
		});

		// Log the bot in with the token
		this.login(config.token);

		// Once the bot logs in, load all of the commands
		this.once("ready", async () => {
			// Log that the bot is online
			console.log(`${this.user.username} is online!`.magenta.bold);

			// Create a new client for Slash Command Interactions
			this.interactionsClient = new interactions.Client(
				config.token,
				this.user.id
			);

			// Load all the commands
			const result = await this.reload();

			// Log the result
			console.log(result.blue.bold);
		});
	}

	/**
	 * Reloads all commands, subcommands, events, modules, etc.
	 * @returns {String} A reload message showing how many commands, subcommands, events, and modules were reloaded
	 */
	async reload() {
		// Add event counter to tally up all events
		var eventsCount = 0;

		// Clear all collections
		this.commands.clear();
		this.subcommands.clear();

		// Get all global slash commands
		const slashCommands = await this.interactionsClient.getCommands({});

		// Get all command files
		const commands = fs
			.readdirSync(this.paths.cmds)
			.filter(
				file =>
					path.extname(file) == ".js" ||
					fs.lstatSync(path.join(this.paths.cmds, file)).isDirectory()
			);

		// Check if there are unneeded slash commands
		slashCommands.forEach(command => {
			// If the command is the help command it's the built in help command, stop it from deleting
			if (
				command.name == "help" &&
				this.bools.builtInHelpCommand != false
			)
				return;

			// Check if there is a command with a matching alias and has slashCommand turned on
			const c = commands.find(file => {
				const cmd = require(`${this.paths.cmds}/${file}`);
				return (
					cmd.aliases
						.map(a => a.toLowerCase())
						.includes(command.name.toLowerCase()) &&
					cmd.slashCommand.bool
				);
			});

			// If there isn't, delete the command
			if (!c && this.bools.deleteUnusedSlashCommands) {
				this.interactionsClient.deleteCommand(command.id);
				console.log(
					`Deleted SlashCommand ${command.name.bold} (${command.id.bold})`
						.blue
				);
			}
		});

		// Add built in help command if it's enabled
		if (this.bools.builtInHelpCommand != false) {
			// Create custom help command using options
			const c = builtInHelpCommand(this, this.bools.builtInHelpCommand);

			// Set it in the collection
			this.commands.set("help", c);
			if (!this.commandCategories.includes(c.category))
				this.commandCategories.push(c.category);

			// Add args
			const conversions = this.getParamNames(c.run);
			c.args.push(
				...conversions.map(v => {
					return {
						fullName: v.fullName,
						name: v.name,
						type: v.type?.name ?? "Not found"
					};
				})
			);

			// If there isn't a help slash command, add it
			const cmd =
				slashCommands instanceof Array
					? slashCommands.find(
							cmd =>
								cmd.name.toLowerCase() == c.name.toLowerCase()
					  )
					: slashCommands.name.toLowerCase() == c.name.toLowerCase();
			if (this.commands.get("help").slashCommand.bool && !cmd) {
				this.interactionsClient
					.createCommand({
						name: c.name,
						description: c.desc,
						options: c.slashCommand.options
					})
					.then(res =>
						console.log(
							`Added SlashCommand ${res.name.bold} (${res.id.bold})`
								.blue
						)
					)
					.catch(err =>
						console.log(
							`Something went wrong trying to add SlashCommand ${c.name.bold}`
								.red
						)
					);
			}
		}

		const loadCommand = (file, folder = null) => {
			// Import the file
			const fileCommand = require(`${this.paths.cmds}${
				folder ? `/${folder}` : ""
			}/${file}`);

			// If the file isn't of type "Command" return
			if (!(fileCommand instanceof Command)) return;

			// Add the category to categories list
			if (
				!this.commandCategories.includes(fileCommand.category) &&
				fileCommand != null
			)
				this.commandCategories.push(fileCommand.category);

			// If it's enabled for slash command, then add or edit them
			if (fileCommand.slashCommand.bool)
				fileCommand.aliases.forEach(alias => {
					const cmd =
						slashCommands instanceof Array
							? slashCommands.find(
									cmd =>
										cmd.name.toLowerCase() ==
										alias.toLowerCase()
							  )
							: slashCommands.name.toLowerCase() ==
							  alias.toLowerCase();
					if (cmd) {
						if (fileCommand.desc != cmd.description)
							this.interactionsClient
								.editCommand(
									{
										name: alias,
										description: fileCommand.desc,
										options:
											fileCommand.slashCommand.options
									},
									cmd.id
								)
								.then(res =>
									console.log(
										`Edited SlashCommand ${cmd.name.bold} (${cmd.id.bold})`
											.blue
									)
								)
								.catch(err =>
									console.log(
										`Something went wrong trying to edit SlashCommand ${cmd.name.bold} (${cmd.id.bold})`
											.red
									)
								);
						else
							console.log(
								`Did not change SlashCommand ${cmd.name.bold} (${cmd.id.bold})`
									.blue
							);
					} else {
						this.interactionsClient
							.createCommand({
								name: alias,
								description: fileCommand.desc,
								options: fileCommand.slashCommand.options
							})
							.then(res =>
								console.log(
									`Added SlashCommand ${res.name.bold} (${res.id.bold})`
										.blue
								)
							)
							.catch(err =>
								console.log(
									`Something went wrong trying to add SlashCommand ${alias.bold}`
										.red
								)
							);
					}
				});

			// Prevent command overwrites
			if (this.commands.get(fileCommand.name))
				throw Error(
					`Fero-DC: Command "${
						fileCommand.name
					}" was attempted to be overwritten.${
						fileCommand.name == "help" &&
						this.bools.builtInHelpCommand
							? `\n\nThis is due to the builtInHelpCommand not being false.`
							: ""
					}`
				);

			// Get the parameters of the run function to convert them
			const conversions = this.getParamNames(fileCommand.run);

			// If conversions == null, that means that a parameter was improperly set up
			if (!conversions)
				throw Error(
					`Fero-DC: Command "${fileCommand.name}" has improper parameters.`
				);

			// Push the conversions into the arguments array
			fileCommand.args.push(
				...conversions.map(v => {
					return {
						fullName: v.fullName,
						name: v.name,
						type: v.type?.name ?? "Not found"
					};
				})
			);

			// Set the command into the collection
			this.commands.set(fileCommand.name, fileCommand);

			// Log the command
			if (this.bools.cmdLoadedMsg)
				console.log(`Command "${fileCommand.name.bold}" loaded.`.blue);

			// Look for subcommands
			const subsPath = path.join(
				this.paths.subs,
				file.substring(0, file.indexOf(".js"))
			);

			// Make the subcommands path if there isn't one
			if (!fs.existsSync(subsPath)) fs.mkdirSync(subsPath);

			// Read the directory and go through all the files
			fs.readdirSync(subsPath)
				.filter(file => path.extname(file) == ".js")
				.forEach(sub => {
					// Import the file
					const fileSubcommand = require(`${subsPath}/${sub}`);

					// If the file isn't of type "Subcommand" return
					if (!(fileSubcommand instanceof Subcommand)) return;

					// If the subcommand's parent doesn't startWith the command then return
					if (!fileSubcommand.parent.startsWith(fileCommand.name))
						return;

					// Set the subcommand into the collection
					this.subcommands.set(
						`${fileSubcommand.parent}/${fileSubcommand.name}`,
						fileSubcommand
					);

					// Log the subcommand
					if (this.bools.subLoadedMsg)
						console.log(
							`Subcommand "${fileSubcommand.name.bold}" loaded for subcommand train "${fileSubcommand.parent.bold}".`
								.green
						);
				});
		};

		// Loop through all the command files and set them up
		commands.forEach(file => {
			if (file.endsWith(".js")) loadCommand(file);
			else
				fs.readdirSync(path.join(this.paths.cmds, file)).forEach(f =>
					loadCommand(f, file)
				);
		});

		// Remove all added events
		this.removeAllListeners();

		// If emitMessageOnInteraction then for each interaction, emit message with the Interaction
		if (this.bools.emitMessageOnInteraction)
			this.ws.on("INTERACTION_CREATE", async interaction =>
				this.emit(
					"message",
					await new Interaction(this, interaction).fetchMember()
				)
			);

		// If debug is on, then do custom debugging
		if (this.bools.debug)
			this.on("debug", (...info) => {
				info.forEach(i => {
					if (typeof i == "string") {
						const matches = i.match(/\[.*?\]/g);
						var s = i;
						for (const m of matches)
							s =
								s.substring(0, s.indexOf(m)) +
								s.substring(
									s.indexOf(m),
									s.indexOf(m) + m.length
								).green +
								s.substring(s.indexOf(m) + m.length);
						console.log(
							`${
								`{${new Date(Date.now()).toUTCString()}}`.green
							}: ${s}`
						);
					}
				});
			});

		// Read the events directory and go all the files
		fs.readdirSync(this.paths.events)
			.filter(file => path.extname(file) == ".js")
			.forEach(file => {
				// Up the event counter
				eventsCount++;

				// Import the file
				const fileEvent = require(`${this.paths.events}/${file}`);

				// If the file isn't of type "Event" return
				if (!(fileEvent instanceof Event)) return;

				// If the event is "interactionCreate" then add the event (INTERACTION_CREATE isn't currently supported in discord.js)
				if (fileEvent.name == "interactionCreate") {
					this.ws.on(
						"INTERACTION_CREATE",
						fileEvent.run.bind(null, this)
					);
				} else {
					this.on(fileEvent.name, fileEvent.run.bind(null, this));
				}

				// Log the event
				if (this.bools.eventLoadedMsg)
					console.log(`Event "${fileEvent.name.bold}" loaded.`.red);
			});

		// Assign this the modules
		Object.assign(this, this.modules);

		// Emit ready once the reloading is done
		this.emit("ready");

		// Return the reload message
		return `Reloaded ${this.commands.size} commands, ${
			this.subcommands.size
		} subcommands, ${eventsCount} events, and ${
			Object.keys(this.modules).length
		} modules.`;
	}

	/**
	 * Check permissions considering members, roles, permissions, and custom properties
	 * @param {Command | Subcommand} cmd The command or subcommand with permissions
	 * @param {Discord.GuildMember} member The member to check permissions
	 * @param {Object} data Any specific roles that an unknown string should be attached to ex. MOD: ["Mod", "Admin", "Owner" (in Discord.RoleResolvable form)]
	 */
	async checkPermissions(cmd, member, data = {}) {
		// Convert data to an array
		const dataArray = Object.keys(data);

		// Make an array of the role aliases
		const permissionsRoleAliasesArray = cmd.permissions.filter(c =>
			dataArray.includes(c)
		);

		// Make an array of the permissions
		const permissionsPermissionsArray = cmd.permissions.filter(
			c =>
				c instanceof Discord.Permissions ||
				c instanceof Discord.BitField ||
				Discord.Permissions.FLAGS[c]
		);

		// Check owner
		const owner = member.id == member.guild.ownerID;

		// If the permissions include the member's id
		const hasPermissionsUsers = cmd.permissions.includes(member.id);

		// If the member has a role
		const hasPermissionsRoles = cmd.permissions.find(role =>
			member.roles.cache.get(role)
		)
			? true
			: false;

		// If the member has a role alias
		const hasPermissionsRoleAliases = permissionsRoleAliasesArray
			.map(v => data[v])
			.find(
				sf =>
					sf.includes(member.id) ||
					sf.find(r => member.roles.cache.has(r))
			)
			? true
			: false;

		// If the member has a permission
		const hasPermissionsPermissions = (
			await Promise.all(
				permissionsPermissionsArray.map(v => member.hasPermission(v))
			)
		).includes(true);

		// If there is only user permissions and the member isn't one of them, then return false
		if (
			!permissionsRoleAliasesArray.length &&
			!permissionsPermissionsArray.length &&
			!hasPermissionsUsers
		)
			return false;

		// If owner automatically return true
		if (owner) return true;

		// If they have any permission, return true
		if (
			hasPermissionsUsers ||
			hasPermissionsRoles ||
			hasPermissionsRoleAliases ||
			hasPermissionsPermissions
		)
			return true;

		// By default return false
		return false;
	}

	/**
	 * Runs a command considering conversions
	 * @param {Command | Subcommand} command The command to run
	 * @param {Discord.Message} message The message to get info to convert
	 * @param {String[]} args The args to get info to convert
	 */
	async runCommand(command, message, args) {
		// Get the conversions
		const conversions = this.getParamNames(command.run);

		// Return an error
		if (!conversions)
			throw Error(`Fero-DC: Command ${command} has improper parameters.`);

		// Convert all the parameters
		const newConversions = await Promise.all(
			conversions.map(
				async (v, i) =>
					await v.type(
						args[i + 1],
						message,
						args.slice(i + 2).join(" "),
						command
					)
			)
		);

		// Run the command with the parameters
		const result = await command.run(
			message,
			args,
			this,
			...newConversions
		);

		// Return the result
		return result;
	}

	/**
	 * A public description for parameter converter types
	 */
	converterTypes = {
		string: "A single-word string of text",
		mstring: "A multi-word string of text",
		char: "A single character (takes first character of a word given)",
		number: "A floating point (decimal) number",
		int: "An integer (whole number)",
		float: "A floating point (decimal) number",
		double: "A floating point (decimal) number",
		boolean: "A truthful or falsy value",
		bool: "A truthful or falsy value",
		color: "A hexadecimal color",
		guild: "A Discord server",
		member: "A Discord server member",
		user: "A Discord user",
		channel: "A Discord channel (all types)",
		message: "A Discord message from a Discord text channel",
		invite: "A Discord invite for a Discord server",
		emoji: "A Discord emoji",
		role: "A Discord server role",
		permission: "A Discord server permission",
		time: "A fero-ms time format (https://npmjs.com/package/fero-ms for more info)",
		subcommand: "A fero-dc subcommand",
		command: "A fero-dc parent command"
	};

	/**
	 * Converters
	 * @private
	 */
	constructors = {
		string: string => string,
		mstring: (...string) =>
			string?.filter(s => typeof s == "string").join(" ") ?? null,
		char: string => string?.substring(0, 1) ?? null,
		number: string => parseFloat(string),
		int: string => parseInt(string),
		float: string => parseFloat(string),
		double: string => parseFloat(string),
		boolean: string => !falsy.includes(string),
		bool: string => !falsy.includes(string),
		color: string => Discord.Util.resolveColor(string),
		guild: string => this.guilds.cache.get(string),
		member: async (string, message) =>
			message?.guild?.member(await resolveUser(this, string)) ?? null,
		user: string => resolveUser(this, string),
		channel: (string, message) => resolveChannel(message, string),
		message: (string, message) => resolveMessage(message, string),
		invite: (string, message) => resolveInvite(message, string),
		emoji: string => resolveEmoji(this, string),
		role: (string, message) => resolveRole(message, string),
		permission: string => resolvePermission(string),
		time: string => FMS(string, "ms"),
		subcommand: (string, message, rest, cmd) =>
			resolveSubcommand(this, string, cmd),
		command: (string, message, rest, cmd) =>
			resolveSubcommand(this, string, cmd, "cmd")
	};

	/**
	 * Get all parameters and conversions
	 * @param {Function} func The function to get parameters
	 * @returns {{name: String, fullName: String, type: any}[]}
	 * @private
	 */
	getParamNames(func) {
		/**
		 * @type {String[]}
		 */
		const result = new Array();
		// Get rid of all comments
		const fnStr = func.toString().replace(stripComments, "");

		// Push all parameters
		result.push(
			...fnStr
				.slice(fnStr.indexOf("(") + 1, fnStr.indexOf(")"))
				.match(argumentNames)
				?.slice(3)
		);

		// Get constructors
		const cs = r =>
			Object.keys(this.constructors).filter(c => r.startsWith(c));

		// Make a filter by constructors length
		const filter = r => cs(r).length > 0;

		// Filter
		const rs = result.filter(filter);

		// Incorrect parameters
		if (rs.length != result.length) return null;

		// Return an array of the name, fullName, and type of the parameters
		return rs.map(v => {
			return {
				name: v.substring(cs(v)[0].length) || "",
				fullName: v,
				type: this.constructors[cs(v)[0]]
			};
		});
	}

	/**
	 * Get all commands from a category
	 * @param {String} category
	 */
	getCommandsFromCategory(category) {
		return this.commands.filter(command => command.category == category);
	}

	/**
	 * Get the command usage of a command, if it doesn't have one, format it with the arguments
	 * @param {Command} command The command to get usage
	 * @param {Discord.Guild} guild The guild to get prefix
	 * @returns {String}
	 */
	getCommandUsage(command, guild = null) {
		if (!command) return;
		const prefix = this.prefix(guild);

		const cmdArgs = command.args
			.map(
				v =>
					`<${getName(v)}${
						find(v, command)?.optional ?? false ? "?" : ""
					}>`
			)
			.join(" ");
		const usage =
			command.usage ||
			`${prefix}${command.name}${cmdArgs == "" ? "" : " " + cmdArgs}`;
		return usage;
	}

	/**
	 * Fetches the prefix for a guild, if no guild is passed or no prefix for that guild, then return the default prefix
	 * @param {Discord.Guild | String} guild The guild to get (id or guild)
	 * @returns {String} The prefix
	 */
	prefix(guild = null) {
		return guild
			? typeof guild == "string"
				? this.prefixes.get(guild) || this.defaultPrefix
				: this.prefixes.get(guild.id) || this.defaultPrefix
			: this.defaultPrefix;
	}

	/**
	 * Load prefixes into the client, accepts any object, map, collection, array if it maps a guild's id to a prefix
	 * @param {PrefixCollection[]} Ts The collection
	 */
	loadPrefixes(...Ts) {
		Ts.forEach(T => {
			if (T instanceof Discord.Collection) {
				T.forEach((v, k) => {
					if (typeof v != "string") return;
					if (typeof k != "string" && !(k instanceof Discord.Guild))
						return;
					if (k instanceof Discord.Guild) {
						this.prefixes.set(k.id, v);
					} else {
						this.prefixes.set(k, v);
					}
				});
			} else if (T instanceof Array) {
				T.forEach(i => {
					const k = i[0],
						v = i[1];
					if (typeof v != "string") return;
					if (typeof k != "string" && !(k instanceof Discord.Guild))
						return;
					if (k instanceof Discord.Guild) {
						this.prefixes.set(k.id, v);
					} else {
						this.prefixes.set(k, v);
					}
				});
			} else if (T instanceof Map) {
				T.forEach((v, k) => {
					if (typeof v != "string") return;
					if (typeof k != "string" && !(k instanceof Discord.Guild))
						return;
					if (k instanceof Discord.Guild) {
						this.prefixes.set(k.id, v);
					} else {
						this.prefixes.set(k, v);
					}
				});
			} else if (typeof T == "object") {
				Object.entries(T).forEach(i => {
					const k = i[0],
						v = i[1];
					if (typeof v != "string" || typeof k != "string") return;
					this.prefixes.set(k, v);
				});
			} else
				throw Error(
					"Fero-DC: loadPrefixes was not passed object, array, map, or collection."
				);
		});

		return this.prefixes;
	}
};

function find(v, command) {
	return command.argumentDescriptions.find(v2 => v2.argument == v.fullName);
}

function getName(v) {
	const s =
		v.fullName != v.name && (v.name.match(/[a-zA-Z]/)?.length > 0 ?? false)
			? v.name
			: v.fullName;
	return FLL(s);
}

function FLL(s) {
	return s.substring(0, 1).toLowerCase() + s.substring(1);
}
