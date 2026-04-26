Tutorial at https://mememaps.net/100d6889-e83d-4967-bec2-7e9424d8cd24

``` bash
…/Multiformats/ipfs-cid-tutorial master  ? ❯ ipfs-only-hash --cid-version 0 HelloWorld.txt 
QmWATWQ7fVPP2EFGu71UkfnqhYXDYH566qy47CnJDgvs8u

…/Multiformats/ipfs-cid-tutorial master  ? ❯ ipfs add HelloWorld.txt
added QmWATWQ7fVPP2EFGu71UkfnqhYXDYH566qy47CnJDgvs8u HelloWorld.txt
 12 B / 12 B [========] 100.00%
…/Multiformats/ipfs-cid-tutorial master  ? ❯ node HashIt.js 
FILE_PATH=./HelloWorld.txt
DATA <Buffer 48 65 6c 6c 6f 20 57 6f 72 6c 64 0a>
IPFS CID: QmWATWQ7fVPP2EFGu71UkfnqhYXDYH566qy47CnJDgvs8u

```