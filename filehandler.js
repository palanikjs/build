const args = require('yargs').argv;
const path = require('path');
const fs = require('fs');


const getJs = (files) => {
    var dir = {
        path: '',
        chunks: [],
        compiled_js: {
            'vendor': '',
            'inline': '',
            'main': '',
            'polyfills': ''
        },
        valid:true,
        error:'No Errors'
    };
    files.forEach((file) => {
        if (path.parse(file).ext == '.js') {
            if (!isNaN(parseInt(file.split('.')[0]))) {
                dir.chunks.push(file);
            } else {
                dir.compiled_js[file.split('.')[0]] = file;
            }
        }
    });
    if (dir.chunks.length > 0){
        for (var js in dir.compiled_js){
            if(dir.compiled_js[js].length == 0){
                dir.valid = false;
                dir.error = 'No of compiled files in incorrect';
            }
        }
    }else{
        dir.valid = false;
        dir.error = 'Unmet chunks count';
    }
    module.exports = dir;
    return dir;
};
fs.readdir(args.dest, (err, files) => {
    if(err){
        console.log(`Destination path - ${args.dest} - is invalid`);
    }else{
        console.log(getJs(files,'destination').error);
    }
});
fs.readdir(args.src, (err, files) => {
    if(err){
        console.log(`Source path - ${args.src} - is invalid`);
    }else{
        console.log(getJs(files,'source').error);
    }
});