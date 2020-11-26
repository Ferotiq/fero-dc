const FeroDC = require("./Client");

module.exports = class Command {
    /**
     * * name - the name of the command
     * * desc - the description of the command
     * * aliases - the aliases or shortened names of the command
     * * arguments - the arguments of the command
     * * permission - the permission needed to run the command
     * * run - the function that will run once the command is called
     * @param {{name: String, desc: String, aliases: String[], arguments: Array, permission: String, run: Function}} options 
     */
    constructor(options = {}) {
        
        this.name = options.name;
        this.desc = options.desc;
        this.aliases = options.aliases;
        this.arguments = [];
        this.permission = options.permission;
        this.run = options.run;
        
    }

    /**
     * Runs a given argument assigned to this command
     * @param {String} arg 
     * @param {FeroDC} client 
     * @param  {String[]} args 
     */
    runArgument(arg, client, args) {
        if (!client.arguments.find(a => a.aliases.includes(arg) && a.parent == this | this.name)) return null;
        return client.arguments.find(a => a.aliases.includes(arg) && a.parent == this | this.name).run(args);
    }
}