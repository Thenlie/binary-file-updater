const flaps = require('./json/FLAPS.json');
const egr = require('./json/EGR.json');
const { toDecimalArray, toBuffer, toUnitArray } = require('./utils');
const { readFile, writeFile } = require('./fileSystem');
// set binary file path
const binFile = './bin/sample-binary-bin'

// read file and get as array
let file = readFile(binFile);

// match all applicable JSON files
let match1 = matchData(file, flaps, 'flaps');
let match2 = matchData(file, egr, 'egr');
let matchArr = match1.concat(match2);

// find all bytes that need to be updated
let diffArr = findDiff(matchArr, flaps, egr);

// create array with updated bytes and convert to buffer
let finalArr = updateFile(file, diffArr, matchArr);
let newFile = toUnitArray(finalArr);
let buffer = toBuffer(newFile);

// write back to bin file
writeFile(binFile, buffer);


// match strings in file to JSON data
function matchData(file, data, type) {
    let matchArr = [];
    for (let i = 0; i < data.strings.length; i++) {
        let decArr = toDecimalArray(data.strings[i]);
        let start = 0, end = 0, c = 0;
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
                };
            // byte does not match
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

// find differences between string and RPM
function findDiff(matchArr, flaps, egr) {
    let diffArr = [];
    for (let i = 0; i < matchArr.length; i++) {
        // set current JSON type
        let curr;
        if (matchArr[i].type === 'flaps') {
            curr = flaps;
        } else if (matchArr[i].type === 'egr') {
            curr = egr;
        };
        // populate diffArr
        for (let j = 0; j < curr.strings[matchArr[i].index].length; j++) {
            if (curr.strings[matchArr[i].index][j] !== curr.RPM[matchArr[i].index][j]) {
                diffArr.push({
                    index: j,
                    matchIndex: i,
                    val: curr.RPM[matchArr[i].index][j]
                });
            };
        };
    };
    return diffArr;
};

// update array based on RPM values
function updateFile(file, diffArr, matchArr) {
    let newFile = file;
    for (let i = 0; i < diffArr.length; i++) {
        // find diff position in file, splice
        p = matchArr[diffArr[i].matchIndex].start + diffArr[i].index;
        newFile.splice(p, 1, parseInt(diffArr[i].val));
        // console.log(p, diffArr[i].index, diffArr[i].matchIndex);
    };
    return newFile;
};
