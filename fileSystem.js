const fs = require('fs'); 
const { toArrayBuffer } = require('./utils');

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
function writeFile(fileName, data) {
    fs.writeFileSync(fileName, data, {
        encoding: 'hex',
        flag: 'w'
    }, function(err) {
        if (err) {
            console.error(err);
        };
    });
    console.log("File written successfully!\n");
};

module.exports = { readFile, writeFile };