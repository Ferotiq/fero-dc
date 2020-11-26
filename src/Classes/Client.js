const fs = require("fs"),
    path = require("path");
const feroClient = require("../fero-client");

/**
 * @param {*} discord - The discord.js library
 * @param {*} config - Stores bot token and prefix
 * @param {*} modules - Stores modules/data that is requested to be stored in the client
 * @param {*} paths  - Paths to the Commands and Events folders
 */
module.exports = (discord = {}, config = {}, modules = {}, paths = {}) => {

    if (!discord.Client || !discord.Collection) {
        return console.error("Fero-Client Error: discord.js package passed in was invalid.");
    }

    /**
     * @extends {discord.Client}
     * @description A built-on version of the standard Discord.js Client that has a built in command handler and event handler.
     */
    class FeroClient extends discord.Client {

        /**
         * @param {*} config - Stores bot token and prefix
         * @param {*} modules - Stores modules/data that is requested to be stored in the client
         * @param {*} paths  - Paths to the Commands and Events folders
         */
        constructor(config = {}, modules = {}, paths = {}) {

            super();

            this.commands = new discord.Collection();
            if (config.prefix) {
                this.prefix = config.prefix;
            }
            this.cmdsPath = paths.cmds;
            this.eventsPath = paths.events;

            if (!fs.existsSync(this.cmdsPath)) {
                try {
                    fs.mkdir(cmdsPath);
                } catch (err) {
                    console.error(`Fero-Client Error: Could not find ${cmdsPath} nor make a directory in it's place. ${err}`);
                }
            }

            if (!fs.existsSync(this.eventsPath)) {
                try {
                    fs.mkdir(eventsPath);
                } catch (err) {
                    console.error(`Fero-Client Error: Could not find ${eventsPath} nor make a directory in it's place. ${err}`);
                }
            }

            fs.readdirSync(this.cmdsPath).filter(file => path.extname(file) == ".js").forEach(file => {
                const fileCommand = require(`${cmdsPath}/${file}`);
                this.commands.set(fileCommand.name, fileCommand);
            });

            fs.readdirSync(this.eventsPath).filter(file => path.extname(file) == ".js").forEach(file => {
                const fileEvent = require(`${eventsPath}/${file}`);
                this.on(fileEvent.name, fileEvent.run.bind(null, this));
            });

            Object.entries(modules).forEach(m => this[m[0]] = m[1]);

            this.login(config.token);

            this.on("ready", () => console.log(`${this.user.username} is online!`));

        }

        /**
         * @param {String} cmd 
         */
        runCommand(cmd) {
            if (!this.commands.find(c => c.aliases.includes(cmd))) return null;
            return this.commands.find(c => c.aliases.includes(cmd)).run();
        }

    }

    return new FeroClient(config, modules, paths);
}