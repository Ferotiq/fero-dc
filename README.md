# Quick Description

Organize your discord bot quickly and neatly with this package.

# Installation

npm:
`npm i fero-client`

yarn:
`yarn add fero-client`

# Utilization

Client:
```js
const { Client } = require("fero-client");
const path = require("path");
const Discord = require("discord.js");

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

const paths = {
        cmds: path.join(__dirname, "Commands"),
        events: path.join(__dirname, "Events")
    }

/* This is a function that makes a class and is not a direct class,
need to pass in Discord because of npm publish issues
related to dependencies
restricting me from publishing this project.
I will fix asap.
*/
const client = Client(Discord, config, modules, paths);
```

Command:
```js
// New command file in the commands folder
const { Command } = require("fero-client");
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
const { Event } = require("fero-client");
module.exports = new Event({
    name: "message",
    async run(client, message) {
        message.reply("Hello!");
    }
});
```

# License

This project is licensed under the terms of the MIT license.