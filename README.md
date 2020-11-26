# Quick Description

fero-dc is short for Ferotiq Discord Client

Organize your discord bot quickly and neatly with this package.

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
        ms: require("ms"),
        messages: {
            permission: "You do not have the correct permissions to use that command!"
        }
        // etc
    }

// The paths to your Command and Event files.
const paths = {
        cmds: path.join(__dirname, "Commands"),
        events: path.join(__dirname, "Events")
    }

const client = new Client(config, modules, paths);
```

Command:
```js
// New command file in the commands folder
const { Command } = require("fero-dc");
module.exports = new Command({
    name: "ping",
    desc: "Shows bot ping",
    aliases: ["ping", "p"],
    permission: "SEND_MESSAGES",
    async run(message, args, client) {
        const msg = await message.channel.send("Pinging...");
        msg.edit(`${msg.createdTimestamp} - ${message.createdTimestamp}`);
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
// New argument file in the arguments folder
const { Argument } = require("fero-dc");
module.exports = new Argument({
    name: "real",
    desc: "Shows real websocket bot ping",
    aliases: ["real", "r"],
    parent: "ping",
    permission: "SEND_MESSAGES",
    async run(message, args, client) {
        return message.reply(new client.discord.WebsocketManager(client).ping);
    }
});
```

# License

This project is licensed under the terms of the MIT license.