import fs from 'fs'
import LevelSchemaProvenance from '../../LevelSchemaProvenance.js'
import { Level } from 'level'
import { v4 as uuidv4 } from 'uuid';


let dir = "./CGFS/sublevels"
let files = await fs.readdirSync(dir)
const textEncoder = new TextEncoder();
const textDecoder = new TextDecoder();
let CGFSApp = {
    sublevels : {}
}

for (var fileIndex in files){
    let filePath = dir + "/" + files[fileIndex]
    let fileContents = fs.readFileSync(filePath)
    let sublevelName = files[fileIndex].substring(0, files[fileIndex].length - 5);
    fileContents = textDecoder.decode(fileContents)
    fileContents = JSON.parse(fileContents)
    CGFSApp.sublevels[sublevelName] = fileContents
}


const myLevelDB = new Level(`./mydb/${String(uuidv4())}`, { valueEncoding: 'json' })
const myLSPDB = new LevelSchemaProvenance(myLevelDB)

for (var sublevelName in CGFSApp.sublevels){
    const createLSPDBTest = await myLSPDB.createSchemaSublevel({
        sublevel_name: sublevelName,
        sublevel_settings: CGFSApp.sublevels[sublevelName].sublevel_settings
    })
    console.log(createLSPDBTest)
}

