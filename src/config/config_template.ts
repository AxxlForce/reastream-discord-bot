/**
 * Discord bot config.
 *
 * Revisions to this file should not be committed to the repository.
 */
export type BotConfig = {

    // the Discord bot token
    token:string;

    // prefix used for bot commands
    prefix:string;

    // the name of the role that gives ultimate power over the bot
    botOwnerRoleName:string;

    // the bot will add reactions to the command messages indicating success or failure
    enableReactions:boolean;
};

export const config:BotConfig = {

    token: "",
    prefix: "!", // Command prefix. ex: !help
    botOwnerRoleName: "bot-owner",
    enableReactions: true
};
