
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
        valid:false,
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
    return dir;
};
var readJs = (path,type)=>{
    // const files = fs.readdirSync(path);
    // files.forEach((file)=>{
    //     console.log(file);
    // });

    return getJs(fs.readdirSync(path));



    // fs.readdir(path, (err, files) => {
    //     if(err){
    //         console.log(`${type} path - ${path} - is invalid`);
    //     }else{
    //         module.exports.type = getJs(files);
    //         console.log(module.exports);
    //     }
    // });
};
module.exports.readJs = readJs;