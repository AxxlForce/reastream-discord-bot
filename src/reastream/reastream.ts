import {ReastreamChannelIdentifier} from "./reastreamChannelIdentifier";
import {fourBytesToNumber, twoBytesToNumber} from "../util/convert";

export class Reastream
{
    static readonly SAMPLE_SIZE_32_BIT_FLOAT = 4;

    public static parse(data:Uint8Array, putSample:(sample:Uint8Array, channel:ReastreamChannelIdentifier, frequency:number) => void)
    {
        const totalChannels = data[40];

        if (totalChannels < 1)
            return;

        const packetSize = fourBytesToNumber(data, 4);
        const frequency = fourBytesToNumber(data, 41);
        const dataSize = twoBytesToNumber(data, 45);
        let offset = 47;

        const totalSamples = dataSize / Reastream.SAMPLE_SIZE_32_BIT_FLOAT;
        const samplesPerChannel = totalSamples / totalChannels;

        for (let channelNumber = 1; channelNumber <= totalChannels; channelNumber++)
        {
            for (let i = 0; i < samplesPerChannel; i++)
            {
                const byte0 = data[offset];
                const byte1 = data[offset + 1];
                const byte2 = data[offset + 2];
                const byte3 = data[offset + 3];
                const sampleBytes = new Uint8Array([byte0, byte1, byte2, byte3]);

                putSample(sampleBytes, Reastream.indexToChannel(channelNumber), frequency);

                // move offset
                offset += Reastream.SAMPLE_SIZE_32_BIT_FLOAT;
            }
        }
    }

    private static indexToChannel(index:number):ReastreamChannelIdentifier
    {
        switch (index)
        {
            case 0:
                return ReastreamChannelIdentifier.NO_CHANNEL;
            case 1:
                return ReastreamChannelIdentifier.AUDIO_CHANNEL_1;
            case 2:
                return ReastreamChannelIdentifier.AUDIO_CHANNEL_2;
            case 3:
                return ReastreamChannelIdentifier.AUDIO_CHANNEL_3;
            case 4:
                return ReastreamChannelIdentifier.AUDIO_CHANNEL_4;
            case 5:
                return ReastreamChannelIdentifier.AUDIO_CHANNEL_5;
            case 6:
                return ReastreamChannelIdentifier.AUDIO_CHANNEL_6;
            case 7:
                return ReastreamChannelIdentifier.AUDIO_CHANNEL_7;
            case 8:
                return ReastreamChannelIdentifier.AUDIO_CHANNEL_8;
        }

        throw new Error("audio channel must be between 0 and 8 but is " + index + 1);
    }
}
