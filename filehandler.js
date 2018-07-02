const args = require('yargs').argv;
const path = require('path');
const fs = require('fs');

var directory = {
    path: '',
    chunks: [],
    compiled_js: {
        'vendor': '',
        'inline': '',
        'main': '',
        'polyfills': ''
    }
};

var source = directory;
var destination = directory;

source.path = args.src;
destination.path = args.dest;

const getJs = (files,dir) => {
    dir.chunks = [];
    files.forEach((file) => {
        if (path.parse(file).ext == '.js') {
            if (!isNaN(parseInt(file.split('.')[0]))) {
                dir.chunks.push(file);
            } else {
                dir.compiled_js[file.split('.')[0]] = file;
            }
        }
    });
    console.log(dir);
    return dir;
};

fs.readdir(destination.path, (err, files) => {
    if(err){
        console.log(`Destination path - ${destination.path} - is invalid`);
    }else{
        this.destination = getJs(files,destination);
    }
});

fs.readdir(source.path, (err, files) => {
    if(err){
        console.log(`Source path - ${source.path} - is invalid`);
    }else{
        source = getJs(files,source);
    }
});
