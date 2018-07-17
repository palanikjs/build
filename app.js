const path = require('path');
const fs = require('fs');
const readYaml = require('read-yaml');
const writeYaml = require('write-yaml');
const replace = require('replace');
const args = require('yargs')
    .usage('node $0 [args]')
    .option('source',{
        alias:['src','s'],
        describe:'Folder which contains the compiled files. like /spa/dist',
        demand:true,
        demand:'Source directory is required see --help for Usage'
    })
    .option('destination',{
        alias:['dest','d'],
        describe:'Directory to which the compiled files to be moved.',
        demand:true,
        demand:'Destination directory is required see --help for Usage'
    })
    .option('chunks',{
        alias:'c',
        describe:'Number of chunk files to be validated'
    })
    .option('index',{
        alias:'i',
        describe:'Changing the contents of index.html file',
        default:false
    })
    .option('type',{
        alias:'t',
        describe:'For theme version update in *.info.yml file',
        default:'patch'
    })
    .option('angular-version',{
        alias:['a','v'],
        describe:'Specify the angular version',
        default:4
    })
    .help('help')
    .alias('h','help')
    .argv;
    
const getJs = (files, dirName, chunks=10) => {
    var dir = {
        path: path.resolve(dirName),
        chunks: [],
        compiled_files: {
            'inline': '',
            'vendor': '',
            'main': '',
            'polyfills': '',
            'styles': ''
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
    if(args.a == 2){
        if(args.chunks == undefined){
            throw new Error('CHNK_ERR');
        }
    }
    var source = getJs(fs.readdirSync(args.source), args.source, args.chunks);
    var destination = getJs(fs.readdirSync(args.destination), args.destination, args.chunks);

    if (source.valid && destination.valid) {
        console.log(`Transferring files from [ ${source.path} ] to [ ${destination.path} ].`);
        
        //copying chunk files.
        for (var i = 0; i < parseInt(args.chunks); i++) {
            fs.unlinkSync(path.join(destination.path, destination.chunks[i]));
            fs.createReadStream(path.join(source.path, source.chunks[i])).pipe(fs.createWriteStream(path.join(destination.path, source.chunks[i])));
        };
        //copying compiled files.
        for (var type in destination.compiled_files) {
            fs.unlinkSync(path.join(destination.path, destination.compiled_files[type]));
            fs.createReadStream(path.join(source.path, source.compiled_files[type])).pipe(fs.createWriteStream(path.join(destination.path, source.compiled_files[type])));
        }
        //replacing the file names in production-code.twig.
        var twig = args.a == 4 ? 'production-code.twig':'html.html.twig';
        for (var type in destination.compiled_files) {
            replace({
                regex: destination.compiled_files[type],
                replacement: source.compiled_files[type],
                paths: [path.join(destination.path, 'templates', twig)],
                recursive: true,
                silent: true
            });
        }
        console.log(`File names updated in [ ${twig} ] file.`);
        
        //replacing the index.html file incase of any addition or deletion of cdn files.
        if (args.index == 'true') {
            fs.unlinkSync(path.join(destination.path, 'index.html'));
            fs.createReadStream(path.join(source.path, 'index.html')).pipe(fs.createWriteStream(path.join(destination.path, 'index.html')));
            console.log('index.html modified');
        }

        console.log('Files transferred succesfully!!!');

        try {
            var yaml = readYaml.sync(path.join(destination.path, 'sandbox.info.yml'));
            var version = yaml.version.split('.');
            var type = args.type == undefined ? 'patch' : args.type;
            switch (type) {
                case 'major':
                    version[0] = (parseInt(version[0])+1).toString();
                    break;
                case 'minor':
                    version[1] = (parseInt(version[1])+1).toString();
                    break;
                case 'patch':
                    version[2] = (parseInt(version[2])+1).toString();
                    break;
            }
            yaml.version = version.join('.');
            writeYaml.sync(path.join(destination.path,'sandbox.info.yml'),yaml);
            console.log(`${type} update done and version updated to ${yaml.version}`);
        } catch (err) {
            console.log('Invalid sandbox.info.yml file found');
        }

    } else {
        var dirs = [source, destination];
        for (var dir in dirs) {
            if (!dirs[dir].valid) {
                console.log(`${dirs[dir].path} directory has ${dirs[dir].error}`);
            }
        }
    }
} catch (err) {
    if(err.message == 'CHNK_ERR'){
        console.log(`You've selected angular version ${args.a} - please provide chunk count for versions other than 4`);
    }else{
        console.log(`please provide correct directory path for source and destination!`);
    }
}
