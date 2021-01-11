export function twoBytesToNumber(data:Uint8Array, startIndex:number)
{
    if (startIndex + 2 > data.length)
        throw Error("start index for given array doesn't point to four valid bytes. start index " + startIndex + ", array length " + data.length);

    return data[startIndex] | data[startIndex + 1] << 8;
}

export function fourBytesToNumber(data:Uint8Array, startIndex:number)
{
    if (startIndex + 4 > data.length)
        throw Error("start index for given array doesn't point to four valid bytes. start index " + startIndex + ", array length " + data.length);

    return data[startIndex] | data[startIndex + 1] << 8 | data[startIndex + 2] << 16 | data[startIndex + 3] << 24;
}