import { Base64 } from './base64.js';

export type BytesLike = number[] | Uint8Array;

export function byte2hexStr(byte: number) {
    if (byte < 0 || byte > 255) throw new Error('Input must be a byte');

    const hexByteMap = '0123456789ABCDEF';

    let str = '';
    str += hexByteMap.charAt(byte >> 4);
    str += hexByteMap.charAt(byte & 0x0f);

    return str;
}

export function bytesToString(arr: BytesLike) {
    let str = '';

    for (let i = 0; i < arr.length; i++) {
        const one = arr[i].toString(2);
        const v = one.match(/^1+?(?=0)/);

        if (v && one.length === 8) {
            const bytesLength = v[0].length;
            let store = arr[i].toString(2).slice(7 - bytesLength);

            for (let st = 1; st < bytesLength; st++) store += arr[st + i].toString(2).slice(2);

            str += String.fromCharCode(parseInt(store, 2));
            i += bytesLength - 1;
        } else {
            str += String.fromCharCode(arr[i]);
        }
    }

    return str;
}

export function hextoString(hex: string) {
    const arr = hex.replace(/^0x/, '').split('');
    let out = '';

    for (let i = 0; i < arr.length / 2; i++) {
        let tmp = `0x${arr[i * 2]}${arr[i * 2 + 1]}`;
        out += String.fromCharCode(parseInt(tmp));
    }

    return out;
}

export function byteArray2hexStr(byteArray: BytesLike) {
    let str = '';

    for (let i = 0; i < byteArray.length; i++) str += byte2hexStr(byteArray[i]);

    return str;
}

export function base64DecodeFromString(string64: string) {
    return new Base64().decodeToByteArray(string64);
}

export function base64EncodeToString(bytes: BytesLike) {
    const b = new Base64();
    const string64 = b.encodeIgnoreUtf8(bytes);

    return string64;
}
