module.exports = async (guild, string) => {

    const invite = (await guild.fetchInvites()).find(e => e.code == string || e.url == string);
    return invite ? invite : null; 

}