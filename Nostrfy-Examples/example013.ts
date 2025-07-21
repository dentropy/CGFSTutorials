import { nip19, nip44 } from "nostr-tools"



let nsec = ""
let privkey = nip19.decode(nsec).data
console.log(privkey)

let content = {
  "content": "Ak8EvMq8zfdZ3qNWY/MiGIEzYcmTSd8HxitDzQqdR/ggVzMosRtdiYiUTOdy9l4drGXHa5aNx+juj4P1wCCJ07W4pIT+/aQ2K2J4oQ5kh4zp9RnvKypXNf8He4/K54+bJq7pTtRlYKM/AqmhVlJfwE5whOmrF5l1oBxnJZWFh06C5yEoA8zjhPYWBeIfLfuue5WNSiWw4AKOzfT4Onzt/kp6PKAZbTEYdyw7eQ/Hh834pM2AGE6K3ehWmtbPlciKg7t6Lr5kUPiSTLDnobHSqsk02VZqrHwcXJPvSEosTxh9iblL9Yc96l8V+yLEqPovfDQVvPRwu/G+zvX1Y0Hnz57CUXc7DGnYosc0RyMbsq6CeUR5kbtnhEfSTcCxEMaxJ7JJBCZj6WjONSnZkBLfGq2gxtuVzdauFgDV/MfpB6lgqJZ3vUoXSgB31rd0blbSErJalnhEMA2yO3goshpG1gi5F/xB3eewktdxv2gbmclFl3obIvgIlG0QuNqNsqk7uN9Ssa2rBdyoO5sk0sK+6ZiiSmf9LR4NmEGBojaLqpyOuPxdElILV7Saeb1Uksa6nQ1Qt8L85oZR3atUjGUtXs40fEZH3/8Brai21fw0+qdroE3K51DShn0Ih4p6KFHPAV2TiaZ3u+9HD+X/ThYagzMcHuRMWr1hqXNcePrQE+qjda9CMRCNFD0QPZqHzbPopmtBZwrp7511iQLrYQvUxLFl7nFdAKijlaIHeqpRjssZYz43N5vBLE8V/WfyMFtgFh+sw3Bzp/6O1MB1GajbA/RXuVgcTEwhI6N0kvEFa0czlmgTrBKgJL/ED0rcJ1mg3SD6czTH1TwWd/QqwYsFz9VziSLtrc46nJjIb2TeNl0T+IYzYu3qRdSkJmQ0NWLCyZn6wPDRrOtTnnn8+lINkcHViozB8U/UVKxwtt4YT2o/p2wdzt/HoARFvQBEWQK3kWpspXY5X/NpMrFzkM2q4r+JOn24noRCIz+NqYfcbXE0Qo3hFYZw1stqmSczfsJjRkNPIsczzbDp6odo9WmnlmqNB1GS/j+RaYhCaOUfyS78ERWOIJPOhAQl/lNQ7szLdfiKpBD6cfVkWwJxCH4QfSIVDnAlPMe/QPGBKTYFLR+0Q/OXOBTof6H8ew7jtuXA+bAuD+WBtv7pirbJM+IFrjLEavC+hmOVe5gNJ3yY05ITaCeiq3vbvYWIQW0X10Ogs23jJY7JlcSjx+eLOF4iocLyHxJKixEwr2f3joo9KrOQWagIwqHTLSKlxla7DCbIuFqZ",
  "created_at": 1753045586,
  "id": "f7072d131e3b8aa27c1b96d8ce65fc96d27967ffb1f989e34d584c1b6005e602",
  "kind": 1059,
  "pubkey": "38953f422c3514d5f635c07fd67d5268df6df59852b8efbad18c8a28ae8a6fa9",
  "sig": "9848b8875e24b237592dce395181285f467bf0ec546cea2af032e505b78055e921225448367cc7ae7c2e758974cfd2a0bd67e7129aee52b80fc4794ae990907a",
  "tags": [
    [
      "p",
      "d35259105cf117e0e174c4d4077ff49fe9520f79851801d72a85c0b34c56d6ff"
    ]
  ]
}

const key = nip44.getConversationKey(privkey, content.pubkey)
let event13 = JSON.parse(nip44.decrypt(content.content, key))

console.log(content)

console.log("\n\n\n")
console.log(event13)


const event13Key = nip44.getConversationKey(privkey, event13.pubkey)
let result2 = nip44.decrypt(event13.content, event13Key)

console.log("\n\nResult2\n")
console.log(result2)