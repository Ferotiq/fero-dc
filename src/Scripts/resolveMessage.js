module.exports = async (channel, string) => {

    const message = channel.messages.cache.find(m => m.id == string || m.url == string);
    return message ? message : null; 

}