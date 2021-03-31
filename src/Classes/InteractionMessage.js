const Discord = require("discord.js"),
    InteractionMember = require("./InteractionMember.js")/*,*/;
    // fs = require("fs");

module.exports = class InteractionMessage {

    /**
     * @param {Discord.Client} client 
     */
    constructor(client, interaction) {
        // fs.writeFileSync("./v.json", JSON.stringify(interaction), err => {
        //     if (err) console.log(err)
        // });
        this.client = client;
        this.interaction = interaction;
        this.command = interaction.data.name;
        this.commandID = interaction.data.id;
        this.commandOptions = interaction.data.options ?? new Array();
        this.id = interaction.id;
        this.guild = client.guilds.cache.get(interaction.guild_id);
        this.channel = this.guild.channels.cache.get(interaction.channel_id);
        this.user = interaction.member.user;
        this.rawMember = interaction.member;
        this.member = new InteractionMember(client, this.rawMember, this.guild);
        this.args = [this.command];
        this.args = this.args.concat(this.commandOptions.map(v => {
            if (v.value) return v.value;
            else if (v.options) {
                this.args.push(v.name);
                v.options.forEach(o => this.args.push(o.value));
            } else return "undefined";
        }).join(" "));
        if (this.args[this.args.length - 1] == "") this.args.pop();
        this.content = `/${this.args.join(" ")}`;
        this.subCommands = new Array();
        this.subCommands.concat(this.commandOptions.filter(option => {
            if (option.options) return true;
        }));
        this.resolved = {
            users: new Array(),
            members: new Array(),
            channels: new Array(),
            roles: new Array()
        };

        if (interaction.data.resolved) {
            const r = interaction.data.resolved;
            if (r.users) {
                const users = Object.keys(r.users).map(v => {
                    const data = r.users[v];
                    data.id = v;
                    return data;
                });
                this.resolved.users = this.resolved.users.concat(users);
            }
            if (r.members) {
                const members = Object.keys(r.members).map(v => {
                    const data = r.members[v];
                    data.id = v;
                    return data;
                });
                this.resolved.members = this.resolved.members.concat(members);
            }
            if (r.channels) {
                const channels = Object.keys(r.channels).map(v => {
                    const data = r.channels[v];
                    data.id = v;
                    return data;
                });
                this.resolved.channels = this.resolved.channels.concat(channels);
            }
            if (r.roles) {
                const roles = Object.keys(r.roles).map(v => {
                    const data = r.roles[v];
                    data.id = v;
                    return data;
                });
                this.resolved.roles = this.resolved.roles.concat(roles);
            }
        }

        /**
         * @type {{everyone: Boolean, users: Discord.Collection<string, Discord.User>, roles: Discord.Collection<string, Discord.Role>, channels: Discord.Collection<string, Discord.TextChannel>}}
         */
        this.mentions = {
            everyone: false,
            users: new Discord.Collection(Object.entries(this.resolved.users)),
            roles: new Discord.Collection(Object.entries(this.resolved.roles)),
            members: new Discord.Collection(Object.entries(this.resolved.users).map(v => [v, this.guild.member(v[0])])),
            channels: new Discord.Collection(Object.entries(this.resolved.channels))
        }

    }

    /**
     * @param {StringResolvable | Discord.APIMessage} [content=''] The content for the message
     * @param {Discord.MessageOptions | Discord.MessageAdditions} [options={}] The options to provide
     * @param {1 | 4 | 5} [type=4]
     * @returns {Discord.Message | Discord.Message[]}
     */
    async reply(content, options, type = 4) {

        var apiMessage;

        if (content instanceof Discord.APIMessage) {
            apiMessage = content.resolveData();
        } else {
            apiMessage = Discord.APIMessage.create(this, content, options).resolveData();
            if (Array.isArray(apiMessage.data.content)) {
                return Promise.all(apiMessage.split().map(this.send.bind(this.interaction)));
            }
        }

        const {
            data,
            files
        } = await apiMessage.resolveFiles();

        const message = this.client.api.interactions(this.interaction.id, this.interaction.token).callback.post({
            data: {
                data,
                type,
                files
            }
        });

        await message.then(d => this.client.actions.MessageCreate.handle(d).message);

        return await message;

    }

}