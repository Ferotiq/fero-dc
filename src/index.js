const Client = require("./Classes/Client.js"),
    Command = require("./Classes/Command.js"),
    Argument = require("./Classes/Argument.js"),
    Event = require("./Classes/Event.js"),
    InteractionMessage = require("./Classes/InteractionMessage.js"),
    InteractionMember = require("./Classes/InteractionMember.js"),
    Discord = require("discord.js")
module.exports = {
    Client,
    Command,
    Argument,
    Event,
    InteractionMember,
    InteractionMessage,
    Discord
}
// const config = require("./Data/testconfig.json");
// const path = require("path");
// new Client(config, {
//     cmds: path.join(__dirname, "Commands"),
//     args: path.join(__dirname, "Arguments"),
//     events: path.join(__dirname, "Events"),
// }, {
//     cmdLoadedMsg: true,
//     argLoadedMsg: true,
//     eventLoadedMsg: true
// }, {});