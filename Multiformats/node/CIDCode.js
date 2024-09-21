
import { CID } from 'multiformats'

let myCID = CID.parse('bafkreiffsgtnic7uebaeuaixgph3pmmq2ywglpylzwrswv5so7m23hyuny')

console.log(`CID             = ${myCID}`)
console.log(`CID to JSON     = ${JSON.stringify(myCID)}`)
console.log(`CID.code        = ${myCID.code}`)
console.log(`CID.code in hex = ${myCID.code.toString(16)}`)
