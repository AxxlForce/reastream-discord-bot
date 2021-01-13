import {Message} from "discord.js";
import {Command} from "./commands/command";
import {HelpCommand} from "./commands/helpCommand";
import {CommandContext} from "./models/commandContext";
import {reactor} from "./reactions/reactor";
import {GreetCommand} from "./commands/greetCommand";

// handler for bot commands issued by users
export class CommandHandler
{
    private readonly commands:Command[];

    private readonly prefix:string;

    constructor(prefix:string)
    {
        const commandClasses = [
            // TODO: Add more commands here.
            GreetCommand,
        ];

        this.commands = commandClasses.map((CommandClass) => new CommandClass());
        this.commands.push(new HelpCommand(this.commands));
        this.prefix = prefix;
    }

    // executes user commands contained in a message if appropriate
    async handleMessage(message:Message):Promise<void>
    {
        if (message.author.bot || !this.isCommand(message))
        {
            return;
        }

        const commandContext = new CommandContext(message, this.prefix);

        const allowedCommands = this.commands.filter((command) =>
            command.hasPermissionToRun(commandContext),
        );
        const matchedCommand = this.commands.find((command) =>
            command.commandNames.includes(commandContext.parsedCommandName),
        );

        if (!matchedCommand)
        {
            await message.reply("I don't recognize that command. Try !help.");
            await reactor.failure(message);
        } else if (!allowedCommands.includes(matchedCommand))
        {
            await message.reply("you aren't allowed to use that command. Try !help.");
            await reactor.failure(message);
        } else
        {
            await matchedCommand
                .run(commandContext)
                .then(() =>
                {
                    reactor.success(message);
                })
                .catch((reason) =>
                {
                    reactor.failure(message);
                });
        }
    }

    // determines whether or not a message is a user command
    private isCommand(message:Message):boolean
    {
        return message.content.startsWith(this.prefix);
    }
}