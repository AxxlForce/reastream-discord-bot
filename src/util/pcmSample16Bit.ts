import {Resampler} from "./resampler";

export class PcmSample16Bit
{
    private readonly _hiByte:number;
    private readonly _loByte:number;
    private readonly sample:number;

    private constructor(value16Bit:number)
    {
        this.sample = value16Bit;
        this._hiByte = value16Bit >> 8 & 0xff;
        this._loByte = value16Bit & 0xff;
    }

    public get hiByte():number
    {
        return this._hiByte;
    }

    public get loByte():number
    {
        return this._loByte;
    }

    public static from32BitFloatAsBytes(array:Uint8Array)
    {
        return new PcmSample16Bit(Resampler.resample32BitTo16Bit(array));
    }
}