const Command = require("./Command.js");

module.exports = class Argument {
    /**
     * * name - the name of the argument
     * * desc - the description of the argument
     * * aliases - the aliases or shortened names of the argument
     * * parent - the parent argument of the argument
     * * permission - the permission needed to run the argument
     * * run - the function that will run once the argument is called
     * @param {{name: String, desc: String, aliases: String[], parent: Command | String, permission: String, run: Function}} options 
     */
    constructor(options = {}) {
        
        this.name = options.name;
        this.desc = options.desc;
        this.aliases = options.aliases;
        this.parent = options.parent;
        this.permission = options.permission;
        this.run = options.run;

    }
}