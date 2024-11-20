// const { Level } = require('level')
// const levelup = require('levelup');
// const S3LevelDown = require('s3leveldown');
// const { S3Client } = require("@aws-sdk/client-s3");
// const encode = require('encoding-down')

import { Level } from 'level'
import levelup from 'levelup'
import S3LevelDown from 's3leveldown'
import { S3Client, CreateBucketCommand, DeleteBucketCommand } from '@aws-sdk/client-s3'
import encode from 'encoding-down'
import * as AWS from "@aws-sdk/client-s3";
import { v4 as uuidv4 } from 'uuid';
const s3conf = {
  apiVersion: '2006-03-01',
  accessKeyId: 'minioadmin',
  secretAccessKey: 'minioadmin',
  endpoint: 'http://127.0.0.1:9000',
  s3ForcePathStyle: true,
  signatureVersion: 'v4'
}
const s3 = new S3Client(s3conf);
const client = new AWS.S3({ region: "REGION" });

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


async function main4(){
  console.log(s3)
}

async function main5(){
  let listBuckets = await client.listBuckets()
  console.log(listBuckets)
}

async function main6(){
  const createBucketParams = {
    Bucket: String(uuidv4()),
  };
  const data = await s3.send(new CreateBucketCommand(createBucketParams));
  console.log(`Bucket "${createBucketParams.Bucket}" created successfully.`);
  console.log("Response:", data);
  let listBuckets = await client.listBuckets()
  console.log(listBuckets)
  await s3.send(new DeleteBucketCommand(createBucketParams));
}

main6()