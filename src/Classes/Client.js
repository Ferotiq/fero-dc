"use strict"

const {
    Client,
    Collection,
    GuildMember,
    Permissions,
    BitField
} = require("discord.js"),
    fs = require("fs"),
    path = require("path"),
    colors = require("colors"),
    Command = require("./Command.js"),
    Argument = require("./Argument.js"),
    Event = require("./Event.js"),
    interactions = require("discord-slash-commands-client");

/**
 * @extends {Client}
 * @description A built-on version of the standard Discord.js Client that has a built in command handler and event handler.
 */
module.exports = class FeroDC extends Client {

    /**
     * @param {{token: String, prefix: String}} config - Stores bot token and prefix
     * @param {{cmds: String, events: String, args: String}} paths - Paths to the Commands and Events folders
     * @param {{cmdLoadedMsg: boolean, eventLoadedMsg: boolean, argLoadedMsg: boolean}} bools - Boolean values for some client settings
     * @param {*} modules - Stores modules/data that is requested to be stored in the client
     */
    constructor(config = {
        token: "BOTTOKEN",
        prefix: "!"
    }, paths = {
        cmds: path.join(process.cwd(), "src", "Commands"),
        args: path.join(process.cwd(), "src", "Arguments"),
        events: path.join(procedss.cwd(), "src", "Events")
    }, bools = {
        cmdLoadedMsg: true,
        eventLoadedMsg: true,
        argLoadedMsg: true
    }, modules = {}) {

        super({
            partials: ["MESSAGE", "USER", "CHANNEL", "GUILD_MEMBER", "REACTION"]
        });

        this.commands = new Collection();
        this.arguments = new Collection();
        this.prefix = config.prefix || "!";
        this.clientOptions = bools;
        this.paths = paths;
        this.modules = modules;

        Object.entries(this.paths)
            .forEach(p => {
                if (!fs.existsSync(p[1])) fs.mkdirSync(p[1]);
            });

        this.login(config.token);

        this.on("ready", async () => {
            console.log(`${this.user.username} is online!`.magenta.bold);
            this.interactionsClient = new interactions.Client(config.token, this.user.id);
            const result = await this.reload();
            console.log(result.blue.bold);
        });

    }

    /**
     * Reloads all commands, arguments, events, modules, etc.
     * @returns {String} A reload message showing how many commands, arguments, events, and modules were reloaded
     */
    async reload() {

        var commandsCount = 0,
            argumentsCount = 0,
            eventsCount = 0,
            modulesCount = 0;

        this.commands.clear();
        this.arguments.clear();

        const slashCommands = await this.interactionsClient.getCommands({});
        const commands = fs.readdirSync(this.paths.cmds).filter(file => path.extname(file) == ".js");

        slashCommands.forEach(command => {
            if (!commands.find(file => {
                    const c = require(`${this.paths.cmds}/${file}`);
                    return c.aliases.map(a => a.toLowerCase()).includes(command.name.toLowerCase());
                })) {
                this.interactionsClient.deleteCommand(command.id);
                console.log(`Deleted SlashCommand ${command.name.bold} (${command.id.bold})`.blue);
            }
        });

        commands.forEach(file => {
            commandsCount++;
            const fileCommand = require(`${this.paths.cmds}/${file}`);
            if (!(fileCommand instanceof Command)) return;
            if (fileCommand.slashCommand.bool) fileCommand.aliases.forEach(alias => {
                const cmd = slashCommands instanceof Array ? slashCommands.find(cmd => cmd.name.toLowerCase() == alias.toLowerCase()) : slashCommands.name.toLowerCase() == alias.toLowerCase();
                if (cmd) {
                    if (fileCommand.desc != cmd.description) {
                        this.interactionsClient.editCommand({
                                name: alias,
                                description: fileCommand.desc,
                                options: fileCommand.slashCommand.options
                            }, cmd.id)
                            .then(result => console.log(`Edited SlashCommand ${cmd.name.bold} (${cmd.id.bold})`.blue))
                            .catch(err => console.log(`Something went wrong trying to edit SlashCommand ${cmd.name.bold} (${cmd.id.bold})`.red));

                    } else {
                        console.log(`Did not change SlashCommand ${cmd.name.bold} (${cmd.id.bold})`.blue);
                    }
                } else {
                    this.interactionsClient.createCommand({
                            name: alias,
                            description: fileCommand.desc,
                            options: fileCommand.slashCommand.options
                        })
                        .then(result => console.log(`Added SlashCommand ${result.name.bold} (${result.id.bold})`.blue))
                        .catch(err => console.log(`Something went wrong trying to add SlashCommand ${alias.bold}`.red));
                }
            });
            this.commands.set(fileCommand.name, fileCommand);
            if (this.clientOptions.cmdLoadedMsg) console.log(`Command "${fileCommand.name.bold}" loaded.`.blue);
            const argsPath = path.join(this.paths.args, file.substring(0, file.indexOf(".js")));
            if (!fs.existsSync(argsPath)) fs.mkdirSync(argsPath);
            fs.readdirSync(argsPath).filter(file => path.extname(file) == ".js").forEach(arg => {
                argumentsCount++;
                const fileArgument = require(`${argsPath}/${arg}`);
                if (!(fileArgument instanceof Argument)) return;
                fileCommand.args.push(fileArgument.name);
                this.arguments.set(`${fileArgument.name}-${fileArgument.parent}`, fileArgument);
                if (this.clientOptions.argLoadedMsg) console.log(`Argument "${fileArgument.name.bold}" loaded for command "${fileCommand.name.bold}".`.green);
            });
        });

        this.removeAllListeners();

        fs.readdirSync(this.paths.events).filter(file => path.extname(file) == ".js").forEach(file => {
            eventsCount++;
            const fileEvent = require(`${this.paths.events}/${file}`);
            if (!(fileEvent instanceof Event)) return;
            if (fileEvent.name == "interactionCreate") {
                this.ws.on("INTERACTION_CREATE", fileEvent.run.bind(null, this));
            } else {
                this.on(fileEvent.name, fileEvent.run.bind(null, this));
            }
            if (this.clientOptions.eventLoadedMsg) console.log(`Event "${fileEvent.name.bold}" loaded.`.red);
        });

        Object.entries(this.modules).forEach(m => {
            modulesCount++;
            this[m[0]] = m[1] || null;
        });

        this.discord = require("discord.js");

        return `Reloaded ${commandsCount} commands, ${argumentsCount} arguments, ${eventsCount} events, and ${modulesCount} modules.`;

    }

    /**
     * @param {Command | Argument} cmd - The command or argument with permissions
     * @param {GuildMember} member - The member to check permissions
     * @param {} data - Any specific roles that an unknown string should be attached to ex. MOD: ["Mod", "Admin", "Owner" (in Discord.RoleResolvable form)]
     */
    async checkPermissions(cmd, member, data = {}) {

        const dataArray = Object.keys(data);

        const permissionsRoleAliasesArray = cmd.permissions.filter(c => dataArray.includes(c));
        const permissionsPermissionsArray = cmd.permissions.filter(c => c instanceof Permissions || c instanceof BitField || Permissions.FLAGS[c]);

        const owner = member.id == member.guild.ownerID;
        const hasPermissionsUsers = cmd.permissions.includes(member.id);
        const hasPermissionsRoles = cmd.permissions.find(role => member.roles.cache.get(role)) ? true : false;
        const hasPermissionsRoleAliases = permissionsRoleAliasesArray.map(v => data[v]).find(sf => sf.includes(member.id) || sf.find(r => member.roles.cache.has(r))) ? true : false;
        const hasPermissionsPermissions = (await Promise.all(permissionsPermissionsArray.map(v => member.hasPermission(v)))).includes(true);

        if (!permissionsRoleAliasesArray.length &&
            !permissionsPermissionsArray &&
            !hasPermissionsUsers) return false;

        if (owner) return true;

        if (hasPermissionsUsers || hasPermissionsRoles || hasPermissionsRoleAliases || hasPermissionsPermissions) return true;

        return false;

    }

}