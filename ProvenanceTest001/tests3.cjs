const { Level } = require('level')
const levelup = require('levelup');
const S3LevelDown = require('s3leveldown');
const { S3Client } = require("@aws-sdk/client-s3");
const encode = require('encoding-down')

const s3 = new S3Client({
  apiVersion: '2006-03-01',
  accessKeyId: 'minioadmin',
  secretAccessKey: 'minioadmin',
  endpoint: 'http://127.0.0.1:9000',
  s3ForcePathStyle: true,
  signatureVersion: 'v4'
});


console.log(Object.keys(s3))
// console.log(Object.keys(s3.endpoint))

const db = levelup(encode(new S3LevelDown('testbucket', s3)), { valueEncoding: 'json' });

async function main() {
  let result = await db.get("the", { valueEncoding: 'json' })

  console.log(result)
  console.log(JSON.stringify(result, null, 2))
  console.log(typeof(result))
}

async function main2(){

  let result = await db.put('name', 'testname')

}

async function main3(){

  let result = await db.put('the', {"your" : "life has value"}, { valueEncoding: 'json' })
  console.log(result)

}

main()