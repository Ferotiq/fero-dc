module.exports = async (guild, string) => {

    const role = guild.roles.cache.find(r => r.id == string || r.name == string);
    return role ? role : null; 

}