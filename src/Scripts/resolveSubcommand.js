"use strict"

module.exports = (client, string, cmd, type) => {
    if (type == "cmd") {
        const command = client.commands.find(c => c.aliases.includes(string));
        return command;
    } else {
        const subcommand = client.subcommands.find(sc => ((sc.aliases.includes(string) || sc.name == string) && sc.parent.startsWith(cmd?.name) || sc.parent == string))
        return subcommand ? subcommand : null;
    }
}