import { program } from "commander";

import 'dotenv/config'
import bip39 from "bip39";
import fs from 'node:fs'
import Database from 'libsql';

import generateNostrAccountsFromMnemonic from './lib/accountsGenerate.js'
import { RetriveThread } from "./lib/retriveThread.js";
program
    .name('nostr-cli')
    .description('CLI so you can talk on Nostr')
    .version('0.0.1')

program.command('generate-mnemonic')
    .description('Generate a Mnemonic which is used to generate NOSTR accounts')
    .action((str, options) => {
        console.log(bip39.generateMnemonic())
    })

program.command('generate-accounts-env')
    .description('Input a Mnemonic and outputs a script of your Nostr accounts as ENV variables')
    .option('-m, --mnemonic <string>', 'Your Mnemonic')
    .action((args, options) => {
        let mnemonic = ""
        if (Object.keys(args).length == 0) {
            mnemonic = process.env.MNEMONIC
        } else {
            mnemonic = args.mnemonic
        }
        if (bip39.validateMnemonic(mnemonic)) {
            let accounts = generateNostrAccountsFromMnemonic(mnemonic)
            console.log(`export MNEMONIC='${mnemonic}'`)
            for (let i = 0; i < accounts.length; i++) {
                console.log(`export NSEC${i}='${accounts[0].nsec}'`)
                console.log(`export NPUP${i}='${accounts[0].npub}'`)
            }
        } else {
            console.log('Mnemonic is invalid')
        }
    })

program.command('generate-accounts-json')
    .description('Input a Mnemonic and outputs a script of your Nostr accounts as JSON')
    .option('-m, --mnemonic <string>', 'Your Mnemonic')
    .action((args, options) => {
        console.log(args)
        let mnemonic = ""
        if (Object.keys(args).length == 0) {
            mnemonic = process.env.MNEMONIC
        } else {
            mnemonic = args.mnemonic
        }
        if (bip39.validateMnemonic(mnemonic)) {
            let accounts = generateNostrAccountsFromMnemonic(mnemonic)
            console.log(accounts)
        } else {
            console.log('Mnemonic is invalid')
        }
    })


program.command('load-nosdump-into-sqlite')
    .description('Loads the output of nosdump into a sqlite database for easy querrying')
    .option('-db, --db_path <string>', 'The file path to a sqlite datebase, will create one if it does not exist')
    .option('-f, --nosdump_file <string>', 'The output of a nosdump file')
    .action(async (args, options) => {
        if (!Object.keys(args).includes('db_path')) {
            console.log("ERROR: Missing db_path argument")
            process.exit();
        }
        if (!Object.keys(args).includes('nosdump_file')) {
            console.log("ERROR: Missing nosdump_file argument")
            process.exit();
        }
        let populate_data = `
        CREATE TABLE IF NOT EXISTS events (
            event_id TEXT PRIMARY KEY,
            event TEXT
        );
        `
        const db = new Database(args.db_path);
        try {
            await db.exec(populate_data);
        } catch (error) {
            console.log(`Could not open sqlite datebase at path ${args.db_path} error posted below\n`)
            console.log(error)
            process.exit()
        }

        let file_contents = ''
        try {
            file_contents = await fs.readFileSync(args.nosdump_file, 'utf-8')
        } catch (error) {
            console.log(`Could not read nosdump_file ${args.nosdump_file} error posted below\n`)
            console.log(error)
            process.exit()
        }
        file_contents = file_contents.split("\n")
        for (const line of file_contents) {
            try {
                const event = JSON.parse(line)
                let query = `INSERT INTO events(event_id, event) VALUES ('${event.id}', '${line}');`
                console.log(query)
                await db.exec(query);
                console.log("Added Event")
            } catch (error) {
                console.log(error)
            }
        }
    })

program.command('sql-query')
    .description('Just query a sqlite database')
    .option('-sql, --sql_query <string>', 'The SQL for the query')
    .option('-db, --db_path <string>', 'The file path to a sqlite datebase, will create one if it does not exist')
    .action(async (args, options) => {
        if (!Object.keys(args).includes('db_path')) {
            console.log("ERROR: Missing db_path argument")
            process.exit();
        }
        if (!Object.keys(args).includes('sql_query')) {
            console.log("ERROR: Missing sql_query argument")
            process.exit();
        }
        const db = new Database(args.db_path);
        try {
            console.log(`QUERY:\n${String(args.sql_query)}`)
            let query = await db.prepare(String(args.sql_query)).all();
            console.log(`\nRESULT:\n${JSON.stringify(query, null, 2)}`)
        } catch (error) {
            console.log(`Could not query sqlite datebase at path ${args.db_path} error posted below\n`)
            console.log(error)
            process.exit()
        }
    })

program.command('get-thread-events')
    .description('Downloads all the events from a Nostr thread as jsonl (nosdump Format)')
    .requiredOption('-e, --event_id <string>', 'The id key in the nostr event\'s JSON')
    .requiredOption('-r, --relays <string>', 'A list of nostr relays to query for this thread')
    .action(async (args, options) => {
        console.log("This needs to be rewritten")
        let result = await RetriveThread(args.relays.split(','), args.event_id)
        console.log(result)
        process.exit()
    })
// program.command('download')
//     .description('nostr-cli download -nostr_filter <NOSTR_FILTER> -from_relays <RELAYS> -db_path <SQLITE_PATH>')
//     .option('-nf, --nostr_filter', 'Nostr Filter')
//     .option('-db, --db_path', 'The file path to a sqlite datebase, will create one if it does not exist')
//     .option('-r, --relays', 'A list of nostr relays')
//     .action((str, options) => {
//         console.log('TODO')
//     })

// program.command('rebroadcast')
//     .description('nostr-cli rebroadcast -nostr_filter <NOSTR_FILTER> -from_relays -to_relays')
//     .option('-filter, --nostr_filter', 'A filter to query')
//     .option('-fr, --from_relays', 'A list of nostr relays, can point to local sqlite database')
//     .option('-tr, --to_relays', 'A list of nostr relays')
//     .action((str, options) => {
//         console.log('TODO')
//     })

// program.command('filter-query-download')
//     .description('nostr-cli filter-query-download -nostr_filter -db_path <SQLITE_PATH>')
//     .option('-filter, --nostr_filter', 'The JOSN of a nostr filter')
//     .option('-db, --db_path', 'The file path to a sqlite datebase, will create one if it does not exist')
//     .action((str, options) => {
//         console.log('TODO')
//     })

program.command('get-encrypted-convo')
    .description('Get and decrypted a Direct Message nostr conversation')
    .option('-from, --from_npub', 'Must be public key of account')
    .option('-to, --to_nsec', 'Must include nsec or private key')
    .option('-r, --relays', 'A list of nostr relays')
    .action((str, options) => {
        console.log(bip39.generateMnemonic())
    })

program.command('get-nip65')
    .description('nostr-cli -npub <NPUB> -relays <RELAYS>')
    .option('-npub, --npub', 'npub of the user\'s Relay List Metadata')
    .option('-r, --relays', 'A list of nostr relays')
    .action((str, options) => {
        console.log(bip39.generateMnemonic())
    })

program.command('get-profile')
    .description('nostr-cli create-profile -nsec <NSEC> -profile_json <PROFILE_JSON> -relays <RELAYS>')
    .option('-npub, --npub', 'npub of the user\'s Relay List Metadata')
    .option('-pj, --profile_json', 'The JSON you want to encode into the Nostr accounts profile and publish it')
    .option('-r, --relays', 'A list of nostr relays')
    .action((str, options) => {
        console.log(bip39.generateMnemonic())
    })
program.command('create-profile')
    .description('nostr-cli create-profile -nsec <NSEC> -profile_json <PROFILE_JSON> -relays <RELAYS>')
    .option('-nsec, --nsec', 'nsec of the user\'s Relay List Metadata')
    .option('-pj, --profile_json', 'The JSON you want to encode into the Nostr accounts profile and publish it')
    .option('-r, --relays', 'A list of nostr relays')
    .action((str, options) => {
        console.log(bip39.generateMnemonic())
    })

program.command('test')
    .description('test')
    .option('-p, --p <string...>', 'Can we do this multiple times?')
    .action((args, options) => {
        console.log(args)
    })
program.parse();

// const options = program.opts();

// if(Object.keys(options).length == 0){
//   program.help()
// }
// if(!"input" in Object.keys(options)){
//   console.log("ERROR: Missing input file")
//   process.exit();
// }
// if(!"output" in Object.keys(options)){
//   console.log("ERROR: Missing output file")
//   process.exit();
// }

// console.log(options)