import fs from 'fs'

let nostr_events = []
let file_contents = await fs.readFileSync('./event0.jsonnl', 'utf-8')
file_contents = file_contents.split("\n")
for( const line of file_contents){
    try {
        nostr_events.push(JSON.parse(line))   
    } catch (error) {
        console.log(error)
    }
}


let profile_content = []
let keys = {}
for( const event of nostr_events){
    profile_content.push(JSON.parse(event.content))
    for( const key of Object.keys(JSON.parse(event.content)) ) {
        keys[key] = true
    }
}

console.log(JSON.stringify(Object.keys(keys).sort(), null, 2))
