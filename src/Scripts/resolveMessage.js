"use strict"

module.exports = async (message, string) => {

    const msg = message.channel.messages.cache.find(m => m.id == string || m.url == string);
    return msg ? msgs : null; 

}