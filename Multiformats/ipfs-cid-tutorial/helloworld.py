from multiformats import CID
from multiformats import multibase
from multiformats import multihash

with open('helloworld', 'rb') as file:
    raw_bytes = file.read()
encoded = multibase.encode(raw_bytes, "base32")
digest = multihash.digest(raw_bytes, "sha2-256")
cidv0 = CID("base58btc", 0, "dag-pb", digest)
cidv1 = CID("base32", 1, "raw", digest)

print("\nraw_bytes")
print(raw_bytes)
print("\ndigest")
print(digest)
print("\ncidv0")
print(cidv0)
print("\ncidv1")
print(cidv1)