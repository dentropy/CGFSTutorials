import * as NIP05 from "nostr-tools/nip05";

let nip05s = [
    "_@walletofsatoshi.com", // "webmaster@walletofsatoshi.com",
    "sersleepy@primal.net",
    "matthewjablack@atomic.finance",
    "GrapheneOS@grapheneos-social.mostr.pub",
];

// Resolve NIP05's
console.log(
    `\nnostr-tools/nip05 functions include${
        JSON.stringify(Object.keys(NIP05), null, 2)
    }`,
);

// Validate the NIP05 Internet Identifiers are valid
for (const nip05 of nip05s) {
    if (!NIP05.isNip05(nip05)) {
        console.log(`Looks like ${nip05} is not a Internet Identifier`);
        process.exit();
    }
}


// Resolve a NIP05 and save it to database
for (const nip05 of nip05s) {
    const match = nip05.match(NIP05.NIP05_REGEX);
    const [, name = "_", domain] = match;
    let nip05_result
    try {
        nip05_result = await NIP05.queryProfile(nip05);
    } catch (error) {
        console.log(`Unable to get nip05=${nip05}`)
        console.log(error)
    }
    console.log(nip05_result)
}
