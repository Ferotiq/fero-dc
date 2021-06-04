<!-- @format -->

# Quick Description

fero-dc is short for Ferotiq Discord Client

Organize your discord bot quickly and neatly with this package.

# Features

-   Command Handler
-   Subcommand Handler
-   Event Handler
-   Slash Commands
-   Built-in Help Command
-   Parameter Conversions
-   Complex Permission Checker
-   Debug Logger
-   More coming soon!

# Installation

npm: `npm i --save fero-dc`

yarn: `yarn add fero-dc`

# Utilization

For more help visit [my YouTube](https://youtube.ferotiq.dev/) or
[my website](https://www.ferotiq.dev) (In dev)

Client:

```js
const { Client } = require("fero-dc");
const path = require("path");

// Config that stores your bot's token and prefix (optional)
const config = {
	token: "bottoken",
	prefix: "botprefix",
	cmdLoadedMsg: true,
	eventLoadedMsg: true,
	subLoadedMsg: true,
	emitMessageOnInteraction: true, // Will trigger the message event when the interactionCreate event is triggered
	builtInHelpCommand: { color: "#FF0000", slashCommand: true }, // Built in help command excepts a MessageEmbed and then the slashCommand property
	debug: true // Adds colorful debugger,
	// Normal discord.js client options
	partials: [],
	disableMentions: "everyone"
};

// The paths to your Command, Subcommand, and Event files.
const paths = {
	cmds: path.join(__dirname, "Commands"),
	events: path.join(__dirname, "Events"),
	subs: path.join(__dirname, "Subcommands")
};

// Anything you want to store (client.fs | client.ms | client.messages)
const modules = {
	fs: require("fs"),
	ms: require("fero-ms"),
	messages: {
		permission:
			"You do not have the correct permissions to use that command!"
	}
	// etc
};

const client = new Client(config, paths, modules);
```

Command:

```js
// New command file in the commands folder
const { Command, Discord } = require("fero-dc");

module.exports = new Command({
	name: "ping",
	desc: "Shows bot ping",
	aliases: ["ping", "p"],
	permissions: [new Discord.Permissions("SEND_MESSAGES")], // Permission name, permissions object, bitfield, id of role, id of user, or string flag
	category: "other",
	usage: "!ping <real>?", // Optional
	argumentDescriptions: [
		{
			argument: "booleanReal",
			desc: "Whether to get real ping or not",
			optional: true
		}
	], // Parameter conversions
	slashCommand: {
		bool: true,
		options: [
			{
				name: "real",
				description: "Shows websocket ping instead of message ping",
				type: "BOOLEAN",
				required: false
			}
		]
	},

	async run(message, args, client, booleanReal /*Param Conversions*/) {
		if (booleanReal) message.channel.send(`Ping: ${client.ws.ping} ms.`);
		else {
			const msg = await message.channel.send("Pinging...");
			msg.edit(
				`${
					msg.createdTimestamp - message.createdTimestamp
				} milliseconds.`
			);
		}
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

Subcommand:

```js
// New Subcommand file in the Subcommands/<command name> folder
const { Subcommand, Discord } = require("fero-dc");

module.exports = new Subcommand({
	name: "real",
	desc: "Shows real websocket bot ping",
	aliases: ["real", "r"],
	parent: "ping",
	permissions: [new Discord.Permissions("SEND_MESSAGES")], // Permission name, permissions object, bitfield, id of role, id of user, or string flag
	usage: "!ping real", // Optional

	async run(message, args, client) {
		message.reply(client.ws.ping);
	}
});
```

# Slash Commands

Creating the Event:

```js
// New event file in the events folder
const { Event, Interaction } = require("fero-dc");

module.exports = new Event({
	name: "interactionCreate",

	async run(client, interaction) {
		const message = await new Interaction(
			client,
			interaction
		).fetchMember();
		message.reply("Hello!");
	}
});
```

# License

This project is licensed under the terms of the MIT license. Please visit the
LICENSE file for info.
