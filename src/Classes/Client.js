const {
    Client,
    Collection
} = require("discord.js"),
    fs = require("fs"),
    path = require("path"),
    Command = require("./Command"),
    Argument = require("./Argument"),
    colors = require("colors");

/**
 * @extends {Client}
 * @description A built-on version of the standard Discord.js Client that has a built in command handler and event handler.
 */
module.exports = class FeroDC extends Client {

    /**
     * @param {{token: String, prefix: String}} config - Stores bot token and prefix
     * @param {*} modules - Stores modules/data that is requested to be stored in the client
     * @param {{cmds: String, events: String, args: String}} paths - Paths to the Commands and Events folders
     * @param {{cmdLoadedMsg: boolean, eventLoadedMsg: boolean, argLoadedMsg: boolean}} bools - Boolean values for some client settings
     */
    constructor(config = {}, modules = {}, paths = {}, bools = {
        cmdLoadedMsg: false,
        eventLoadedMsg: false,
        argLoadedMsg: false
    }) {

        super();

        this.commands = new Collection([
            [String, Command]
        ]);

        this.arguments = new Collection([
            [String, Argument]
        ]);

        if (config.prefix) {
            this.prefix = config.prefix;
        }

        this.clientOptions = bools;
        this.paths = paths;

        Object.entries(this.paths)
            .forEach(p => {
                if (!fs.existsSync(p[1])) {
                    try {
                        fs.mkdir(p[1]);
                    } catch (err) {
                        console.error(`Fero-Dc Error: Could not find ${p[0]}: ${p[1]} nor make a directory in it's place. ${err}`);
                    }
                }
            });

        fs.readdirSync(this.paths.cmds).filter(file => path.extname(file) == ".js").forEach(file => {
            const fileCommand = require(`${this.paths.cmds}/${file}`);
            this.commands.set(fileCommand.name, fileCommand);
            if (this.clientOptions.cmdLoadedMsg) {
                console.log(`Command "${fileCommand.name.bold}" loaded.`.blue)
            }
            const argsPath = path.join(this.paths.args, file.substring(0, file.indexOf(".js")));
            fs.readdirSync(argsPath).filter(file => path.extname(file) == ".js").forEach(arg => {
                const fileArgument = require(`${argsPath}/${arg}`);
                fileCommand.args.push(fileArgument.name);
                this.arguments.set(fileArgument.name, fileArgument);
                if (this.clientOptions.cmdLoadedMsg) {
                    console.log(`Argument "${fileArgument.name.bold}" loaded for command "${fileCommand.name.bold}".`.green)
                }
            });
        });

        fs.readdirSync(this.paths.events).filter(file => path.extname(file) == ".js").forEach(file => {
            const fileEvent = require(`${this.paths.events}/${file}`);
            this.on(fileEvent.name, fileEvent.run.bind(null, this));
            if (this.clientOptions.eventLoadedMsg) {
                console.log(`Event "${fileEvent.name.bold}" loaded.`.red)
            }
        });

        Object.entries(modules).forEach(m => this[m[0]] = m[1]);

        this.discord = require("discord.js");

        this.login(config.token);

        this.on("ready", () => console.log(`${this.user.username} is online!`.magenta.bold));

    }

    /**
     * Run a command that is assigned to the client
     * @param {String} cmd 
     */
    runCommand(cmd, ...args) {
        if (!this.commands.find(c => c.aliases.includes(cmd))) return null;
        return this.commands.find(c => c.aliases.includes(cmd)).run(args);
    }

}