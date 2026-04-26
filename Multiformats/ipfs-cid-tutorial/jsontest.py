from multiformats import CID
from dag_json import decode, encode
from multiformats import multihash

obj = {
  "x": 1,
  # CID instances are encoded as links 
  "y": [2, 3, CID.decode('QmaozNR7DZHQK1ZcU9p7QdrshMvXqWK6gpu5rmrkPdT3L4')],
  "z": {
    "a": CID.decode('QmaozNR7DZHQK1ZcU9p7QdrshMvXqWK6gpu5rmrkPdT3L4'),
    "b": None,
    "c": 'string'
  }
}

encoded = encode(obj)
digest = multihash.digest(encoded, "sha2-256")
cidv0 = CID("base58btc", 0, "dag-pb", digest)
cidv1 = CID("base32", 1, "raw", digest)

print("obj")
print(obj)
print("\ndigest")
print(digest)
print("\ncidv0")
print(cidv0)
print("\ncidv1")
print(cidv1)