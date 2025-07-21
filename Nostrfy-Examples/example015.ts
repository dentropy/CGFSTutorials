import { generateSecretKey, getPublicKey, nip19, nip04 } from "nostr-tools";
// let sk1 = nip19.decode("").data
let sk1 = nip19.decode("").data
let event = {
    "id": "986afa40fabb201b6f45b2f0ae19e927a609ec770deb7388e4166303eb0a66ea",
    "kind": 4,
    "pubkey": "d35259105cf117e0e174c4d4077ff49fe9520f79851801d72a85c0b34c56d6ff",
    "tags": [
        [
            "p",
            "d582ea4464058383af89dbc571f72aaaaffd103aab3bbc8ddd2342e66d7e6b56"
        ]
    ],
    "content": "sqRUromTJH+81INPO15uPQ==?iv=zQ4ymD9ljytm/qfCypM+2g==",
    "created_at": 1753058758,
    "sig": "ae79ba55d933d91d77828b40adf56f275adb4631a895d55355a530c08f7b29af9e6f2481b396000f875070e8d83ddc0d43ac83831dcae0cb7e6ab9df8624e527"
}
let content = await nip04.decrypt(
    sk1,
    event.pubkey,
    "sqRUromTJH+81INPO15uPQ==?iv=zQ4ymD9ljytm/qfCypM+2g=="
)

console.log("PAUL_WAS_HERE")
console.log(content)