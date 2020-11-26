# Quick Description

Fec is short for Ferotiq Client

Organize your discord bot quickly and neatly with this package.

# Installation

npm:
`npm i fec`

yarn:
`yarn add fec`

# Utilization

Client:
```js
const { Client } = require("fec");
const path = require("path");

// Config that stores your bot's token and prefix (optional)
const config = {
        token: "bottoken",
        prefix: "botprefix"
    }

// Anything you want to store (client.fs | client.discord | client.ms | client.messages)
const modules = {
        fs: require("fs"),
        discord: Discord,
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
const { Command } = require("fec");
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
const { Event } = require("fec");
module.exports = new Event({
    name: "message",
    async run(client, message) {
        message.reply("Hello!");
    }
});
```

# License

This project is licensed under the terms of the MIT license.