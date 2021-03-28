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
            if (fileCommand.slashCommand.bool) fileCommand.aliases.forEach(async alias => {
                const cmd = slashCommands instanceof Array ? slashCommands.find(cmd => cmd.name.toLowerCase() == alias.toLowerCase()) : slashCommands.name.toLowerCase() == alias.toLowerCase();
                if (cmd) {
                    if (fileCommand.desc != cmd.description) {
                        await this.interactionsClient.editCommand({
                            name: alias,
                            description: fileCommand.desc,
                            options: fileCommand.slashCommand.options
                        }, cmd.id);
                        console.log(`Edited SlashCommand ${cmd.name.bold} (${cmd.id.bold})`.blue);
                    } else {
                        console.log(`Did not change SlashCommand ${cmd.name.bold} (${cmd.id.bold})`.blue);
                    }
                } else {
                    const i = await this.interactionsClient.createCommand({
                        name: alias,
                        description: fileCommand.desc,
                        options: fileCommand.slashCommand.options
                    });
                    console.log(`Added SlashCommand ${i.name.bold} (${i.id.bold})`.blue);
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

        fs.readdirSync(this.paths.events).filter(file => path.extname(file) == ".js").forEach(file => {
            this.removeAllListeners();
            eventsCount++;
            const fileEvent = require(`${this.paths.events}/${file}`);
            if (!(fileEvent instanceof Event)) return;
            if (fileEvent.name == "interactionCreate") {
                const e = this.ws.on("INTERACTION_CREATE", fileEvent.run.bind(null, this));
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

        await member.guild.members.fetch({
            cache: true,
            force: true
        });

        const permissionsUsersArray = cmd.permissions.filter(c => this.users.cache.get(c));
        const permissionsRolesArray = cmd.permissions.filter(c => member.guild.roles.resolve(c));
        const permissionsRoleAliasesArray = cmd.permissions.filter(c => dataArray.includes(c));
        const permissionsPermissionsArray = cmd.permissions.filter(c => c instanceof Permissions || c instanceof BitField || Permissions.FLAGS[c]);

        const owner = member.id == member.guild.ownerID;
        const hasPermissionsUsers = permissionsUsersArray.includes(member.id);
        const hasPermissionsRoles = permissionsRolesArray.find(role => member.roles.cache.get(role)) ? true : false;
        const hasPermissionsRoleAliases = permissionsRoleAliasesArray.map(v => data[v]).find(sf => sf.includes(member.id) || sf.find(r => member.roles.cache.has(r))) ? true : false;
        const hasPermissionsPermissions = (await Promise.all(permissionsPermissionsArray.map(v => member.hasPermission(v)))).includes(true);

        if (permissionsUsersArray.length > 0 &&
            !permissionsRolesArray.length &&
            !permissionsRoleAliasesArray.length &&
            !permissionsPermissionsArray &&
            !hasPermissionsUsers) return false;

        if (owner) return true;

        if (hasPermissionsUsers || hasPermissionsRoles || hasPermissionsRoleAliases || hasPermissionsPermissions) return true;

        return false;

    }

}

// const filter = cmd.permissions.filter(async permission => {

//     if (typeof (permission) == "string") {
//         const f = (this.users.fetch(permission, true)).then(user => user.id == member.id).catch(reason => {
//             if (member.guild.roles.cache.has(permission)) {
//                 if (member.id == member.guild.ownerID) return true;
//                 if (admin) return true;
//                 if (member.roles.cache.has(permission)) return true;
//                 else return false;
//             } else if (member.hasPermission(permission, {
//                     checkAdmin: true,
//                     checkOwner: true
//                 })) return true;
//             else {
//                 if (dataArray.includes(permission)) {
//                     const roles = data[permission];
//                     const filteredRoles = roles.filter(role => member.roles.cache.has(role));
//                     if (filteredRoles.length > 0) return true;
//                 }
//             }
//         });

//         const bool = await f ? true : false;

//         return bool;

//     } else {

//         if (permission instanceof BitField || permission instanceof Permissions) {
//             if (member.hasPermission(new Permissions(permission), {
//                     checkAdmin: true,
//                     checkOwner: true
//                 })) return true;
//         }

//         if (member.hasPermission(permission, {
//                 checkAdmin: true,
//                 checkOwner: true
//             })) return true;
//     }
// });