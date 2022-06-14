// convert buffer to ArrayBuffer
function toArrayBuffer(buf) {
    const ab = new ArrayBuffer(buf.length);
    const view = new Uint8Array(ab);
    for (let i = 0; i < buf.length; ++i) {
        view[i] = buf[i];
    };
    return view;
};

// convert hex to decimal
function toDecimalArray(hexArr) {
    let decArr = [];
    for (let i = 0; i < hexArr.length; i++) {
        decArr.push(parseInt(hexArr[i], 16));
    };
    return decArr;
};

// convert ArrayBuffer to buffer
function toBuffer(ab) {
    const buf = Buffer.alloc(ab.byteLength);
    const view = new Uint8Array(ab);
    for (let i = 0; i < buf.length; ++i) {
        buf[i] = view[i];
    }
    return buf;
};

// convert array to UnitArray
function toUnitArray(file) {
    // create new ArrayBuffer and Unit8Array to write to bin
    let newBuff = new ArrayBuffer(file.length);
    let newArr = new Uint8Array(newBuff);
    
    // add hex to Unit8Array
    for (let i = 0; i < file.length; i++) {
        newArr[i] = file[i];
    };

    return newArr.buffer;
};

module.exports = { toArrayBuffer, toDecimalArray, toBuffer, toUnitArray };