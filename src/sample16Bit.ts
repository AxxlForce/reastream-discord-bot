export class Sample16Bit
{
    private readonly _hiByte:number;
    private readonly _loByte:number;
    private readonly sample:number;

    constructor(value16Bit:number)
    {
        this.sample = value16Bit;
        this._hiByte = value16Bit >> 8 & 0xff;
        this._loByte = value16Bit & 0xff;
    }

    get hiByte():number
    {
        return this._hiByte;
    }

    get loByte():number
    {
        return this._loByte;
    }

    static from32BitFloatAsBytes(array:Uint8Array)
    {
        // four bytes to 32bit float
        const dataView = new DataView(array.buffer);
        const value32Bit:number = dataView.getFloat32(0, true);

        // convert 32bit float to 16bit sample
        const value16Bit:number = Math.floor(value32Bit > 0 ? value32Bit * 32767 : value32Bit * 32768);

        return new Sample16Bit(value16Bit);
    }
}