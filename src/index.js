const Client = require("./Classes/Client.js"),
    Command = require("./Classes/Command.js"),
    Subcommand = require("./Classes/Subcommand.js"),
    Event = require("./Classes/Event.js"),
    InteractionMessage = require("./Classes/InteractionMessage.js"),
    Discord = require("discord.js");


module.exports = {
    Client,
    Command,
    Subcommand,
    Event,
    InteractionMessage,
    Discord
}

// const config = require("./Data/testconfig.json");
// const path = require("path");
// new Client(config, {
//     cmds: path.join(__dirname, "Commands"),
//     subs: path.join(__dirname, "Subcommands"),
//     events: path.join(__dirname, "Events"),
// }, {
//     cmdLoadedMsg: true,
//     subLoadedMsg: true,
//     eventLoadedMsg: true,
//     emitMessageOnInteraction: true,
//     builtInHelpCommand: {
//         color: "#FF0000",
//         footer: { text: "This is some footer text" },
//         slashCommand: true
//     },
//     debug: true
// }, {});