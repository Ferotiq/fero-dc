"use strict"

const Discord = require("discord.js"),
    Client = require("./Client.js");

module.exports = class InteractionMessage {

    /**
     * @type {Discord.User}
     */
    author;
    /**
     * @type {Discord.GuildMember}
     */
    member;

    /**
     * @param {Client} client 
     */
    constructor(client, interaction) {
        this.createdTimestamp = Date.now();
        this.createdAt = Date(this.createdTimestamp);
        this.client = client;
        this.isInteraction = true;
        this.interaction = interaction;
        this.command = interaction.data.name;
        this.commandID = interaction.data.id;
        this.commandOptions = interaction.data.options ?? new Array();
        this.id = interaction.id;
        this.guild = client.guilds.cache.get(interaction.guild_id);
        /**
         * @type {Discord.TextChannel | Discord.DMChannel}
         */
        this.channel = this.client.channels.cache.get(interaction.channel_id);
        this.rawAuthor = interaction.member.user;
        this.rawMember = interaction.member;
        this.args = [this.command];
        this.args = this.args.concat(this.commandOptions.map(v => {
            if (v.value) return v.value;
            else if (v.options || v.type == 1 || v.type == 2) {
                this.args.push(v.name);
                if (v.options) v.options.forEach(o => this.args.push(o.type == 1 ? o.name : o.value));
            } else return "undefined";
        }).join(" ").split(" "));
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
         * @type {{everyone: Boolean, guild: Discord.Guild, users: Discord.Collection<string, Discord.User>, roles: Discord.Collection<string, Discord.Role>, members: Discord.Collection<string, Discord.GuildMember>, channels: Discord.Collection<string, Discord.TextChannel>}}
         */
        this.mentions = {
            everyone: false,
            guild: this.guild,
            users: new Discord.Collection(this.resolved.users.map(v => [v.id, v])),
            roles: new Discord.Collection(this.resolved.roles.map(v => [v.id, v])),
            members: new Discord.Collection(this.resolved.users.map(v => [v.id, this.guild.member(v.id)])),
            channels: new Discord.Collection(this.resolved.channels.map(v => [v.id, v]))
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
                return Promise.all(apiMessage.split().map(this.reply.bind(this.interaction)));
            }
        }

        const {
            data,
            files
        } = await apiMessage.resolveFiles();

        try {
            this.client.api.interactions(this.interaction.id, this.interaction.token).callback.post({
                data: {
                    data,
                    type,
                    files
                }
            });
            return this.interaction.token;
        } catch {
            const message = await this.channel.send(`${this.author}, ${data.content}`);
            return message; 
        };

    }

    async fetchMember() {
        await this.fetchAuthor();
        const member = await this.guild.members.fetch({
            force: true,
            cache: true,
            user: this.author.id
        });
        this.member = member;
        return this;
    }

    async fetchAuthor() {
        const author = await this.client.users.fetch(this.rawAuthor.id, true, true);
        this.author = author;
        return this;
    }

}