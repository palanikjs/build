const path = require('path');
const fs = require('fs');
const args = require('yargs').argv;
const replace = require('replace');

const getJs = (files, dirName, chunks = 10) => {
    var dir = {
        path: path.resolve(dirName),
        chunks: [],
        compiled_files: {
            'inline':'',
            'vendor':'',
            'main':'',
            'polyfills':'',
            'styles':''
        },
        valid: true,
        error: ''
    };
    files.forEach((file) => {
        if (path.parse(file).ext == '.js') {
            if (!isNaN(parseInt(file.split('.')[0]))) {
                dir.chunks.push(file);
            } else {
                dir.compiled_files[file.split('.')[0]] = file;
            }
        } else if (path.parse(file).ext == '.css') {
            dir.compiled_files[file.split('.')[0]] = file;
        }
    });
    if (dir.chunks.length == chunks) {
        for (var js in dir.compiled_files) {
            if (dir.compiled_files[js].length == 0) {
                dir.valid = false;
                dir.error = 'incorrect number of compiled files';
            }
        }
    } else {
        dir.valid = false;
        dir.error = `invalid number of chunk files - required(${chunks})`;
    }
    return dir;
};

try {
    var source = getJs(fs.readdirSync(args.src), args.src, args.chunks);
    var destination = getJs(fs.readdirSync(args.dest), args.dest, args.chunks);
    if (source.valid && destination.valid) {
        for (var i = 0; i < destination.chunks.length; i++) {
            fs.unlinkSync(path.join(destination.path, destination.chunks[i]));
            fs.createReadStream(path.join(source.path, source.chunks[i])).pipe(fs.createWriteStream(path.join(destination.path, source.chunks[i])));
        };

        for (var type in destination.compiled_files) {
            fs.unlinkSync(path.join(destination.path, destination.compiled_files[type]));
            fs.createReadStream(path.join(source.path, source.compiled_files[type])).pipe(fs.createWriteStream(path.join(destination.path, source.compiled_files[type])));
        }

        for (var type in destination.compiled_files) {
            replace({
                regex: destination.compiled_files[type],
                replacement: source.compiled_files[type],
                paths: [path.join(destination.path, 'templates', 'production-code.twig')],
                recursive: true,
                silent: true
            });
        }

        if (args.index == 'true') {
            fs.unlinkSync(path.join(destination.path, 'index.html'));
            fs.createReadStream(path.join(source.path, 'index.html')).pipe(fs.createWriteStream(path.join(destination.path, 'index.html')));
        }

        console.log('Build files are transferred succesfully!!!');

    } else {
        var dirs = [source, destination];
        for (var dir in dirs) {
            if (!dirs[dir].valid) {
                console.log(`${dirs[dir].path} directory has ${dirs[dir].error}`);
            }
        }
    }
}catch(err){
    console.log(`please provide correct directory`);
}
