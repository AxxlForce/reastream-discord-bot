import {Message} from "discord.js";

// a user-given command extracted from a message
export class CommandContext
{
    // command name in all lowercase
    readonly parsedCommandName:string;

    // arguments (split by space)
    readonly args:string[];

    // original Message the command was extracted from
    readonly originalMessage:Message;

    readonly commandPrefix:string;

    constructor(message:Message, prefix:string)
    {
        this.commandPrefix = prefix;
        const splitMessage = message.content
            .slice(prefix.length)
            .trim()
            .split(/ +/g);

        this.parsedCommandName = splitMessage.shift()!.toLowerCase();
        this.args = splitMessage;
        this.originalMessage = message;
    }
}
