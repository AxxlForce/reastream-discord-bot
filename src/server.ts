import Discord, {Client, Message, VoiceChannel, VoiceConnection} from "discord.js";
import {CommandHandler} from "./comanndHandler";
import {BotConfig, config} from "./config/config";
import {PassThrough} from "stream";
import {Logger} from "./util/logger";

const dgram = require("dgram");

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
        // this.stream.on("data", (chunk) =>
        // {
        //     console.log(chunk);
        // });

        const udpClient = dgram.createSocket({type: "udp4", reuseAddr: true});

        udpClient.on("listening", function ()
        {
            const address = udpClient.address();
            Logger.log(this, "listening on :" + address.address + ":" + address.port);
        });

        udpClient.on("message", (msg:Uint8Array, info:any) =>
        {
            // console.log("Data received from server : " + msg.toString());
            // console.log("Received %d bytes from %s:%d\n", msg.length, info.address, info.port);

            const packetSize = msg[4] | msg[5] << 8;
            const numberOfChannels = msg[40];
            const frequency = msg[41] | msg[42] << 8;
            const dataSize = msg[45] | msg[46] << 8;
            let offset = 47;
            // console.log("channel " + nbChan + ", frequency " + frequency);

            const amountSamples = dataSize / 4;

            for (let i = 0; i < amountSamples / 2; i++)
            {
                const byte0 = msg[offset];
                const byte1 = msg[offset + 1];
                const byte2 = msg[offset + 2];
                const byte3 = msg[offset + 3];
                offset += 4;

                const sampleArray = new Uint8Array([byte0, byte1, byte2, byte3]);

                // debugging
                // const sample = byte0 | byte1 << 8 | byte2 << 16 | byte3 << 24;

                const dataView = new DataView(sampleArray.buffer);
                const value32Bit:number = dataView.getFloat32(0, true);
                const value16Bit:number = Math.floor(value32Bit > 0 ? value32Bit * 32767 : value32Bit * 32768);

                this.putSample(value16Bit);
            }
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
                Logger.log(this, "successfully joined " + connection);
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

    private putSample(value16Bit:number)
    {
        const hiByte:number = value16Bit >> 8 & 0xff;
        const lowByte:number = value16Bit & 0xff;
        this.stream.write(Buffer.from([lowByte, hiByte]));
    }
}
