const flaps = require('./FLAPS.json');
const egr = require('./EGR.json');
const { toDecimalArray, toBuffer, toUnitArray } = require('./utils');
const { readFile, writeFile } = require('./fileSystem');

let file = readFile('./03G906016B_orig.bin');
let match1 = matchData(file, flaps, 'flaps');
let match2 = matchData(file, egr, 'egr');
let matchArr = match1.concat(match2);
let diffArr = findDiff(matchArr, flaps, egr);
// console.log(matchArr, diffArr);
let finalArr = updateFile(file, diffArr, matchArr);
let newFile = toUnitArray(finalArr);
let buffer = toBuffer(newFile);
// console.log(buffer);
writeFile(buffer);


// match strings in file to JSON data
function matchData(file, data, type) {
    let matchArr = [];
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

// find differences between string and RPM
function findDiff(matchArr, flaps, egr) {
    let diffArr = [];
    for (let i = 0; i < matchArr.length; i++) {
        switch (matchArr[i].type) {
            case 'flaps':
                for (let j = 0; j < flaps.strings[matchArr[i].index].length; j++) {
                    if (flaps.strings[matchArr[i].index][j] !== flaps.RPM[matchArr[i].index][j]) {
                        diffArr.push({
                            index: j,
                            matchIndex: i,
                            val: flaps.RPM[matchArr[i].index][j]
                        });
                    };
                };
                break;
            case 'egr':
                for (let j = 0; j < egr.strings[matchArr[i].index].length; j++) {
                    if (egr.strings[matchArr[i].index][j] !== egr.RPM[matchArr[i].index][j]) {
                        diffArr.push({
                            index: j,
                            matchIndex: i,
                            val: egr.RPM[matchArr[i].index][j]
                        });
                    };
                };
                break;
        }
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
