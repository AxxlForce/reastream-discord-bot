import Discord, {Client, Message, VoiceChannel, VoiceConnection} from "discord.js";
import {CommandHandler} from "./comanndHandler";
import {BotConfig, config} from "./config/config";
import {PassThrough} from "stream";
import {Logger} from "./util/logger";
import {Reastream} from "./reastream/reastream";
import {ReastreamChannelIdentifier} from "./reastream/reastreamChannelIdentifier";
import {Sample16Bit} from "./sample16Bit";

export class Server
{
    private discordClient:Client;
    private commandHandler:CommandHandler;
    private stream = new PassThrough();
    private voiceConnection:VoiceConnection;

    private static validateConfig(botConf:BotConfig)
    {
        if (!botConf.token)
        {
            throw new Error("You need to specify your Discord bot token!");
        }
    }

    public run():void
    {
        const udpClient = require("dgram").createSocket({type: "udp4", reuseAddr: true});

        udpClient.on("listening", () =>
        {
            const address = udpClient.address();
            Logger.log(this, "listening on :" + address.address + ":" + address.port);
        });

        udpClient.on("message", (data:Uint8Array, info:any) =>
        {
            Reastream.parse(data, (sampleBytes, channel) =>
            {
                // convert 32bit Reastream float sample to 16bit
                const convertedSample = Sample16Bit.from32BitFloatAsBytes(sampleBytes);

                // write converted sample of channel 1 to mono discord stream
                if (channel === ReastreamChannelIdentifier.AUDIO_CHANNEL_1)
                    this.stream.write(Buffer.from([convertedSample.loByte, convertedSample.hiByte]));
            });
        });

        this.initDiscordConnection();

        udpClient.bind(58710, "127.0.0.1");
    }

    private joinChannel()
    {
        const channel:VoiceChannel = this.discordClient.channels.cache.find((ch:VoiceChannel) => ch.name === "Stallion Nightmare") as VoiceChannel;

        if (!channel) return Logger.error(this, "the channel does not exist");

        channel.join()
            .then((connection:VoiceConnection) =>
            {
                Logger.log(this, "successfully joined channel \"" + channel.name + "\"");
                this.voiceConnection = connection;

                if (this.voiceConnection)
                    this.voiceConnection.play(this.stream, {type: "converted"});

            })
            .catch((e:Error) =>
            {
                Logger.error(this, "unable to join channel", e);
            });
    }

    private initDiscordConnection()
    {
        Server.validateConfig(config);

        // const guild = this.discordClient.guilds;

        this.discordClient = new Discord.Client();
        this.commandHandler = new CommandHandler(config.prefix);

        this.discordClient.on("ready", () =>
        {
            Logger.log(this, "bot is ready");
        });

        this.discordClient.on("message", (message:Message) =>
            {
            }
        );

        this.discordClient.on("error", (e) =>
        {
            Logger.error(this, "Discord client error", e);
        });

        this.discordClient.login(config.token)
            .then((result:string) =>
            {
                Logger.log(this, "logged in with token " + result);
                this.joinChannel();
            })
            .catch((e:Error) =>
            {
                Logger.error(this, "unable to log into server", e);
            });
    }
}
