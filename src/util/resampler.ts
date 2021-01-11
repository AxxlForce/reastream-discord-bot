export class Resampler
{
    public static resample32BitTo16Bit(input:Uint8Array):number
    {
        // four bytes to 32bit float
        const dataView = new DataView(input.buffer);
        const value32Bit:number = dataView.getFloat32(0, true);

        // convert 32bit float to 16bit sample
        const value16Bit:number = value32Bit > 0 ? value32Bit * 32767 : value32Bit * 32768;

        return value16Bit;
    }
}