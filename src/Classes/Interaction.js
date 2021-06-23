/** @format */

//"use strict"

const Discord = require("discord.js"),
	Client = require("./Client.js"),
	https = require("https");

class Interaction {
	/**
	 * @type {Discord.User}
	 */
	author;
	/**
	 * @type {Discord.GuildMember}
	 */
	member;
	/**
	 * @type {Discord.Message}
	 */
	originalReply;

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
		this.token = interaction.token;
		/**
		 * @protected
		 */
		this._originalReplyUrl = `https://discord.com/api/v8/webhooks/${this.client.user.id}/${this.token}/messages/@original`;
		this.rawAuthor = interaction.member.user;
		this.rawMember = interaction.member;
		this.guild = client.guilds.cache.get(interaction.guild_id);
		/**
		 * @type {Discord.TextChannel | Discord.DMChannel}
		 */
		this.channel = this.client.channels.cache.get(interaction.channel_id);
		this.args = [this.command];
		this.args = this.args.concat(
			this.commandOptions
				.map(v => {
					if (v.value) return v.value;
					else if (v.options || v.type == 1 || v.type == 2) {
						this.args.push(v.name);
						if (v.options)
							v.options.forEach(o =>
								this.args.push(o.type == 1 ? o.name : o.value)
							);
					} else return "undefined";
				})
				.join(" ")
				.split(" ")
		);
		if (this.args[this.args.length - 1] == "") this.args.pop();
		this.content = `/${this.args.join(" ")}`;
		this.subCommands = new Array();
		this.subCommands.concat(
			this.commandOptions.filter(option => {
				if (option.options) return true;
			})
		);
		/**
		 * @type {Discord.Collection<String, Discord.MessageAttachment}
		 */
		this.attachments = new Discord.Collection();
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
				this.resolved.channels =
					this.resolved.channels.concat(channels);
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
			users: new Discord.Collection(
				this.resolved.users.map(v => [v.id, v])
			),
			roles: new Discord.Collection(
				this.resolved.roles.map(v => [v.id, v])
			),
			members: new Discord.Collection(
				this.resolved.users.map(v => [v.id, this.guild.member(v.id)])
			),
			channels: new Discord.Collection(
				this.resolved.channels.map(v => [v.id, v])
			)
		};
	}

	/**
	 * Replies to the interaction, or if already replied, sends a followup message, returns the message
	 * @param {Discord.APIMessageContentResolvable} content The content for the message
	 * @returns {Promise<Discord.Message>} The response
	 */
	async reply(content) {
		const apiMessage =
			content instanceof Discord.APIMessage
				? content
				: Discord.APIMessage.create(this.channel, content);

		const { data, files } = await apiMessage.resolveData().resolveFiles();

		const msg = (await this.originalReply)
			? this.followUp(data, files)
			: this.respond(data, files);

		return msg;
	}

	/**
	 * Pend a response to then edit later
	 * @param {String} pendingResponse
	 */
	async pend(pendingResponse = "Pending...") {
		if (this.originalReply) return this.originalReply;
		await this.client.api.interactions(this.id, this.token).callback.post({
			data: {
				data: {
					content: pendingResponse
				},
				type: 5,
				query: {
					wait: true
				},
				auth: false
			}
		});
		return await oR(this);
	}

	/**
	 * @typedef {{timeout?: Number, reason?: String}} InteractionDeleteOptions
	 */

	/**
	 * Delete the original reply, or make a reply then delete it, which deletes the interaction itself
	 * @param {InteractionDeleteOptions} options
	 */
	delete(options = {}) {
		if (!this.originalReply) {
			this.reply("_ _").then(m => m.delete(options));
		} else {
			this.originalReply.delete(options);
		}
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
		const author = await this.client.users.fetch(
			this.rawAuthor.id,
			true,
			true
		);
		this.author = author;
		return this;
	}

	/**
	 * @private
	 */
	async followUp(data, files) {
		const message = await this.client.api
			.webhooks(this.client.user.id, this.token)
			.post({
				data,
				files
			});
		return new Discord.Message(
			this.client,
			message,
			this.client.channels.cache.get(message.channel_id)
		);
	}

	/**
	 * @private
	 */
	async respond(data, files) {
		this.client.api.interactions(this.id, this.token).callback.post({
			data: {
				data,
				type: 4,
				files
			}
		});
		return await oR(this);
	}
}

function oR(t) {
	if (t.originalReply) return t.originalReply;
	return new Promise(resolve =>
		https.get(t._originalReplyUrl, res => {
			var data = "";
			res.on("data", d => (data += d));
			res.on("end", () => {
				const jsonData = JSON.parse(data);
				const message = new Discord.Message(
					t.client,
					jsonData,
					t.client.channels.cache.get(jsonData.channel_id)
				);
				t.originalReply = message;
				resolve(t.originalReply);
			});
		})
	);
}

module.exports = Interaction;
