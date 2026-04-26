import fs from 'fs'
import Hash from 'ipfs-only-hash'
async function ipfsHashFile(filePath) {
  console.log('FILE_PATH=' + filePath)
  const data = await fs.readFileSync(filePath);   // Buffer / Uint8Array
  console.log('DATA', data)
  const cid = await Hash.of(data);            // returns the CID string (e.g. Qm...)
  return cid;
}

// Usage
ipfsHashFile('./HelloWorld.txt')
  .then(cid => console.log('IPFS CID:', cid))
  .catch(console.error);