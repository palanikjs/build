const path = require('path');
const fs = require('fs');
const args = require('yargs').argv;
const replace = require('replace');

const getJs = (files,dirName,chunks = 10) => {
    var dir = {
        path: dirName,
        chunks: [],
        compiled_js: {
            'vendor': '',
            'inline': '',
            'main': '',
            'polyfills': ''
        },
        style:'',
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
        }else if(path.parse(file).ext =='.css') {
            dir.style = file;
        }
    });
    if (dir.chunks.length == chunks){
        for (var js in dir.compiled_js){
            if(dir.compiled_js[js].length == 0){
                dir.valid = false;
                dir.error = 'No of compiled files is incorrect';
            }
        }
    }else{
        dir.valid = false;
        dir.error = 'Unmet chunks count';
    }
    dir.valid ? console.log(`${dirName} is valid`):console.log(`${dirName} is invalid`);
    return dir;
};

var source = getJs(fs.readdirSync(args.src),args.src,args.chunks);
var destination = getJs(fs.readdirSync(args.dest),args.dest,args.chunks);

if((source.valid && destination.valid)&&(source.chunks.length == destination.chunks.length)){

    for (var i = 0;i<destination.chunks.length;i++){
        fs.unlinkSync(destination.path+'\\'+destination.chunks[i]);
        fs.createReadStream(source.path+'\\'+source.chunks[i]).pipe(fs.createWriteStream(destination.path+'\\'+source.chunks[i]));
    };

    for (var type in destination.compiled_js){
        fs.unlinkSync(destination.path+'\\'+destination.compiled_js[type]);
        fs.createReadStream(source.path+'\\'+source.compiled_js[type]).pipe(fs.createWriteStream(destination.path+'\\'+source.compiled_js[type]));
    }

    fs.unlinkSync(destination.path+'\\'+destination.style);
    fs.createReadStream(source.path+'\\'+source.style).pipe(fs.createWriteStream(destination.path+'\\'+source.style));
    
    replace({
        regex: destination.style,
        replacement: source.style,
        paths: [destination.path+'\\templates\\production-code.twig'],
        recursive: true,
        silent: true
    });

    for (var type in destination.compiled_js){
        replace({
            regex: destination.compiled_js[type],
            replacement: source.compiled_js[type],
            paths: [destination.path+'\\templates\\production-code.twig'],
            recursive: true,
            silent: true
        });
    }

    if(args.index =='true'){
        fs.unlinkSync(destination.path+'\\index.html');
        fs.createReadStream(source.path+'\\index.html').pipe(fs.createWriteStream(destination.path+'\\index.html'));
    }

}else{
    console.log(`Directory path is invalid or it doesn't met the requirements`);
}
