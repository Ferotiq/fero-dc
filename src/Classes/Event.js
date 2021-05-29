"use strict";

module.exports = class Event {
	/**
	 * @typedef {{name: "channelCreate" | "channelDelete" | "channelPinsUpdate" | "channelUpdate" | "debug" | "emojiCreate" | "emojiDelete" | "emojiUpdate" | "error" | "guildBanAdd" | "guildBanRemove" | "guildCreate" | "guildDelete" | "guildIntegrationsUpdate" | "guildMemberAdd" | "guildMemberRemove" | "guildMembersChunk" | "guildMemberSpeaking" | "guildMemberUpdate" | "guildUnavailable" | "guildUpdate" | "invalidated" | "interactionCreate" | "inviteCreate" | "inviteDelete" | "message" | "messageDelete" | "messageDeleteBulk" | "messageReactionAdd" | "messageReactionRemove" | "messageReactionRemoveAll" | "messageReactionRemoveEmoji" | "messageUpdate" | "presenceUpdate" | "rateLimit" | "ready" | "roleCreate" | "roleDelete" | "roleUpdate" | "shardDisconnect" | "shardError" | "shardReady" | "shardReconnecting" | "shardResume" | "typingStart" | "userUpdate" | "voiceStateUpdate" | "warn" | "webhookUpdate", run: Function}} EventOptions
	 */

	/**
	 * @param {EventOptions} options
	 */
	constructor(options = {}) {
		this.name = options.name;

		if (!this.name) throw Error("Fero-DC: Event has no name");

		const noFunctionSet = () => {};

		this.run = options.run || noFunctionSet;
	}
};
