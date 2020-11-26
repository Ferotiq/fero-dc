module.exports = class Command {
    constructor(options = {}) {

        this.name = options.name;
        this.desc = options.desc;
        this.aliases = options.aliases;
        this.permission = options.permission;
        this.run = options.run;

    }
}