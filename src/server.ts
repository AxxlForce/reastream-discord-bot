import Discord, {Client, Message, VoiceChannel, VoiceConnection} from "discord.js";
import {PassThrough} from "stream";
import {Logger} from "./util/logger";
import {Reastream} from "./reastream/reastream";
import {ReastreamChannelIdentifier} from "./reastream/reastreamChannelIdentifier";
import {PcmSample16Bit} from "./util/pcmSample16Bit";
import {SamplingRate} from "./util/samplingRate";
import * as fs from "fs";

class BotConfig
{
    private static readonly RECEIVING_ADDRESS_DEFAULT:string = "127.0.0.1";
    private static readonly RECEIVING_PORT_DEFAULT:number = 58710;

    private readonly parsed:any;

    constructor()
    {
        const file = fs.readFileSync("bot_config.json");
        this.parsed = JSON.parse(file.toString());

        this.validate();
    }

    public get receivingPort():number
    {
        const port = this.parsed["port"]

        if (port)
            return port;

        return BotConfig.RECEIVING_PORT_DEFAULT;
    }

    public get token():string
    {
        return this.parsed["token"];
    }

    public get channel():string
    {
        return this.parsed["channel"];
    }

    public get receivingAddress():string
    {
        const address = this.parsed["receiving_address"]

        if (address)
            return address;

        return BotConfig.RECEIVING_ADDRESS_DEFAULT;
    }

    private validate()
    {
        if (!this.token || !this.channel)
            throw new Error("bot_config.json not configured properly");
    }
}

export class Server
{
    private userConfig:BotConfig = new BotConfig();
    private discordClient:Client;
    private audioStream = new PassThrough();
    private voiceConnection:VoiceConnection;

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
            Reastream.parse(data, (sampleBytes:Uint8Array, channel:ReastreamChannelIdentifier, frequency:number) =>
            {
                // convert 32bit Reastream float sample to 16bit
                const convertedSample = PcmSample16Bit.from32BitFloatAsBytes(sampleBytes);

                // write converted sample of channel 1 to mono discord stream
                if (channel === ReastreamChannelIdentifier.AUDIO_CHANNEL_1)
                {
                    this.audioStream.write(Buffer.from([convertedSample.loByte, convertedSample.hiByte]));

                    // TODO this is hack as resampling is not yet implemented
                    if (frequency === SamplingRate.HZ_480000)
                        this.audioStream.write(Buffer.from([convertedSample.loByte, convertedSample.hiByte]));
                }
            });
        });

        this.initDiscordConnection();

        udpClient.bind(this.userConfig.receivingPort, this.userConfig.receivingAddress);
    }

    private joinChannel()
    {
        const channel:VoiceChannel = this.discordClient.channels.cache.find((ch:VoiceChannel) => ch.name === this.userConfig.channel) as VoiceChannel;

        if (!channel) return Logger.error(this, "the channel does not exist");

        channel.join()
            .then((connection:VoiceConnection) =>
            {
                Logger.log(this, "successfully joined channel \"" + channel.name + "\", bitrate " + channel.bitrate);
                this.voiceConnection = connection;

                if (this.voiceConnection)
                    this.voiceConnection.play(this.audioStream, {type: "converted"});

            })
            .catch((e:Error) =>
            {
                Logger.error(this, "unable to join channel", e);
            });
    }

    private initDiscordConnection()
    {
        this.discordClient = new Discord.Client();

        this.discordClient.on("ready", () =>
        {
            Logger.log(this, "bot is ready");
        });

        this.discordClient.on("message", (message:Message) =>
        {
        });

        this.discordClient.on("error", (e) =>
        {
            Logger.error(this, "Discord client error", e);
        });

        this.discordClient.login(this.userConfig.token)
            .then((result:string) =>
            {
                Logger.log(this, "logged in with token " + result);

                // give some time before logging in
                setTimeout(() => this.joinChannel(), 100);
            })
            .catch((e:Error) =>
            {
                Logger.error(this, "unable to log into server", e);
            });
    }
}
