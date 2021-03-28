const Discord = require("discord.js"),
    InteractionMember = require("./InteractionMember.js");

module.exports = class InteractionMessage {

    /**
     * @param {Discord.Client} client 
     */
    constructor(client, interaction) {
        this.client = client;
        this.interaction = interaction;
        this.command = interaction.data.name;
        this.commandID = interaction.data.id;
        this.commandOptions = interaction.data.options;
        this.id = interaction.id;
        this.guild = client.guilds.cache.get(interaction.guild_id);
        this.channel = this.guild.channels.cache.get(interaction.channel_id);
        this.user = interaction.member.user;
        this.rawMember = interaction.member;
        this.member = new InteractionMember(client, this.rawMember, this.guild);
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