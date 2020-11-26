module.exports = class Event {
    constructor(options = {}) {

        this.name = options.name;
        this.run = options.run;

    }
}