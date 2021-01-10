export class Resampler
{
    public static resample32BitTo16Bit(input:Uint8Array):number
    {
        const dv = new DataView(input.buffer);

        const value32Bit:number = dv.getFloat32(0, true);
        const value16Bit:number = Math.floor(value32Bit > 0 ? value32Bit * 32767 : value32Bit * 32768);
        return value16Bit;
    }
}