const fs = require('fs'); 
const flaps = require('./FLAPS.json');
const egr = require('./EGR.json');

let answer = [];

// read bin file and return arr of decimal values
function readFile(fileName) {
    // read bin file
    const decryptor  = fs.readFileSync(fileName);
    const binArr = toArrayBuffer(decryptor);
    
    // convert bin buffer to array
    const normalArr = Array.from(binArr);
    return normalArr;
};

// write new hex to bin file
function writeFile(data) {
    fs.writeFileSync('./03G906016B_orig.bin', data, {
        encoding: 'hex',
        flag: 'w'
    }, function(err) {
        if (err) {
            console.error(err);
        };
    });
    console.log("File written successfully\n");
};

let file = readFile('./03G906016B_orig.bin');
let match1 = matchData(file, flaps, 'flaps');
let match2 = matchData(file, egr, 'egr');
console.log(match1, match2);

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

// convert array to hex
function toHex(arr) {
    let ans = [];
    for (let i = 0; i < arr.length; i++) {
        if (arr[i] !== 0) {
            hex = arr[i].toString(16).toUpperCase();
            ans.push(hex);
        } else {
            hex = '00';
            ans.push(hex);
        }
    };
    return ans;
};

// convert array to UnitArray
function toUnitArray() {
    // create new ArrayBuffer and Unit8Array to write to bin
    let newBuff = new ArrayBuffer(answer.length);
    let newArr = new Uint8Array(newBuff);
    
    // add hex to Unit8Array
    for (let i = 0; i < answer.length; i++) {
        newArr[i] = parseInt(answer[i], 16);
    };

    return newArr;
}

// match strings in file to JSON data
function matchData(file, data, type) {
    matchArr = [];
    for (let i = 0; i < data.strings.length; i++) {
        let decArr = toDecimalArray(data.strings[i]);
        let start = 0;
        let end = 0;
        let c = 0;
        for (let j = 0; j < file.length; j++) {
            if (decArr[c] === file[j]) {
                // matches all bytes in a row
                if (c === decArr.length - 1) {
                    end = j;
                    let obj = {
                        // position of matched array in file
                        start: start,
                        end: end,
                        // position in "strings" array
                        index: i,
                        type: type
                    }
                    matchArr.push(obj);
                    break;
                // matches a byte
                } else {
                    if (c === 0) {
                        start = j;
                    };
                    c++;
                }
            } else {
                if (c !== 0) {
                    j = j - c;
                    c = 0;
                };
            };
        };
    };
    return matchArr;
};

// update array based on RPM values
function updateArr(arr) {
    for (let i = 0; i < matchArr.length; i++) {
        let c = 0;
        for (let j = matchArr[i].start; j < matchArr[i].end; j++) {
            if (matchArr[i].type == 'flaps') {
                if (arr[j] != flaps.RPM[matchArr[i].index][c]) {
                    console.log(matchArr[i].type, arr[j], flaps.RPM[matchArr[i].index][c]);
                    arr.splice(j, 1, flaps.RPM[matchArr[i].index][c]);
                }
                c++;
            } else {
                if (arr[j] != egr.RPM[matchArr[i].index][c]) {
                    console.log(matchArr[i].type, arr[j], egr.RPM[matchArr[i].index][c]);
                    arr.splice(j, 1, egr.RPM[matchArr[i].index][c]);
                }
                c++;
            }
        }
    };
};

function run() {
    matchFlaps();
    matchEgrs();
    console.log(matchArr);
    let hexArr = toHex(normalArr);
    updateArr(hexArr);
    console.log(hexArr)
    let newArr = toUnitArray();
    console.log(newArr);
    // writeFile(newArr);
};

// run();
