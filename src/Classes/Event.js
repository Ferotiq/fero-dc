module.exports = class Event {
    /**
     * @param {{name: String, run: Function}} options 
     */
    constructor(options = {}) {

        this.name = options.name;
        this.run = options.run;

    }
}