const Discord = require("discord.js");

module.exports = class InteractionMember {
    /**
     * @param {Discord.Client} client 
     * @param {*} member 
     * @param {Discord.Guild} guild 
     */
    constructor(client, member, guild) {
        this.client = client;
        this.guild = guild;
        this.id = member.user.id;
        this.roles = {
            cache: new Discord.Collection(member.roles.map(v => [v, guild.roles.cache.get(v)]))
        }
        this.bits = member.permissions;
        this.permissions = new Discord.Permissions(parseInt(this.bits));
        this.user = member.user;
        this.nickname = member.nick;
        this.premiumSince = member.premium_since;
        this.pending = member.pending;
        this.mute = member.mute;
        this.joinedAt = member.joined_at;
        this.isPending = member.is_pending;
        this.deaf = member.deaf;
    }

    /**
     * Checks if any of this member's roles have a permission.
     * @param {Discord.PermissionResolvable} permission Permission(s) to check for
     * @param {Object} [options] Options
     * @param {boolean} [options.checkAdmin=true] Whether to allow the administrator permission to override
     * @param {boolean} [options.checkOwner=true] Whether to allow being the guild's owner to override
     * @returns {boolean}
     */
    async hasPermission(permission, {
        checkAdmin = true,
        checkOwner = true
    } = {}) {
        if (checkOwner && this.user.id === this.guild.ownerID) return true;
        const permissions = new Discord.Permissions(this.roles.cache.map(role => role.permissions) || 0);
        return permissions.has(permission, checkAdmin);
    }

}