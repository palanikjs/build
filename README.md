# build
This is a Node module for moving the Angular (2 & 4) compiled files to a D8 theme.

### Command to execute (Example command)
```sh
$ node app.js --src='dirName' --dest='dirName' --chunks='10' --index=true --type='patch'
```

### List of params
| Command | Description | Type | DefaultValue |
|------ | ------ | ------ | ------ |
|--src = 'dirName' |Source directory which contains the dist folder (compiled files). Eg:"~/spa/dist".|mandatory| undefined |
|--dest = 'dirName'|Destination folder path name which contains the sites build theme Eg:"~build/sandbox".|mandatory| undefined |
| --chunks = 'number of chunks'|To check for the number of chunk files generated in both source and destination directories.|optional| 10 |
|--index = 'true/false' |To include the changes in index.html file.|optional| false |
|--type = 'major/minor/patch' |Updating the theme version in the info.yml file which is mandatory to check for the theme change.|optional| patch |
|--angular-version = 'version number' |specify the angular version if the angular version is not 4 |optional| 4 |

### Help
```sh
$ node app.js --help
```
Use help command for more information!!

மகிழ்ச்சி!!
