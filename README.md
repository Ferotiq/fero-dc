# Quick Description

fero-dc is short for Ferotiq Discord Client

Organize your discord bot quickly and neatly with this package.

Now with slash commands!

# Installation

npm:
`npm i fero-dc --save`

yarn:
`yarn add fero-dc --save`

# Utilization

Client:
```js
const { Client } = require("fero-dc");
const path = require("path");

// Config that stores your bot's token and prefix (optional)
const config = {
        token: "bottoken",
        prefix: "botprefix"
    }

// Anything you want to store (client.fs | client.ms | client.messages)
const modules = {
        fs: require("fs"),
        ms: require("fero-ms"),
        messages: {
            permission: "You do not have the correct permissions to use that command!"
        }
        // etc
    }

// The paths to your Command, Argument, and Event files.
const paths = {
        cmds: path.join(__dirname, "Commands"),
        events: path.join(__dirname, "Events"),
        args: path.join(__dirname, "Arguments")
    }

// Optional values for console messages
const bools = {
    cmdLoadedMsg: true,
    eventLoadedMsg: true,
    argLoadedMsg: true
}

const client = new Client(config, paths, bools, modules);
```

Command:
```js
// New command file in the commands folder
const { Command } = require("fero-dc");
const { Permissions } = require("discord.js");
module.exports = new Command({
    name: "ping",
    desc: "Shows bot ping",
    aliases: ["ping", "p"],
    permissions: [new Permissions("SEND_MESSAGES")] /*This can be a normal string with the permission name in it, a permissions object, a bitfield, an id of a role, an id of a user, or a string flag*/,
    /*optional*/ usage: "!ping",
    slashCommand: {
        bool: true,
        options: [{
            name: "real",
            description: "Shows websocket ping instead of message ping",
            type: 5,
            required: false,
            choices: [{
                name: "True",
                value: true
            }, {
                name: "False",
                value: false
            }]
        }]
    },
    async run(message, args, client) {
        const msg = await message.channel.send("Pinging...");
        msg.edit(`${msg.createdTimestamp - message.createdTimestamp} milliseconds.`);
    }
});
```

Event:
```js
// New event file in the events folder
const { Event } = require("fero-dc");
module.exports = new Event({
    name: "message",
    async run(client, message) {
        message.reply("Hello!");
    }
});
```

Argument:
```js
// New argument file in the arguments/<command name> folder
const { Argument } = require("fero-dc");
const { Permissions } = require("discord.js");
module.exports = new Argument({
    name: "real",
    desc: "Shows real websocket bot ping",
    aliases: ["real", "r"],
    parent: "ping",
    permissions: [ new Permissions("SEND_MESSAGES"), "MOD", "000000000000000000" ] /*This can be a normal string with the permission name in it, a permissions object, a bitfield, an id of a role, an id of a user, or a string flag*/,
    /*optional*/ usage: "!ping real",
    async run(message, args, client) {
        return message.reply(new client.discord.WebsocketManager(client).ping);
    }
});
```

# Slash Commands

Creating the Event:
```js
// New event file in the events folder
const { Event, InteractionMessage } = require("fero-dc");
module.exports = new Event({
    name: "interactionCreate",
    async run(client, interaction) {
        const message = new InteractionMessage(client, interaction);
        message.reply("Hello!");
    }
}); 
```

# License

This project is licensed under the terms of the MIT license. Please visit the LICENSE file for info.