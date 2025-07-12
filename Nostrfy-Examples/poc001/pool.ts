import { NostrFilter, NPool, NRelay1 } from "@nostrify/nostrify";

import { outbox } from "./outbox.ts";

let relay_urls = ["wss://relay.damus.io/", "wss://nos.lol/"]

export let pool = new NPool({
  open(url) {
    return new NRelay1(url);
  },

  // Get the relays to use for making requests.
  async reqRouter(filters) {
    const authors = new Set<string>();
    const routes = new Map<string, NostrFilter[]>();

    // Gather the authors from the filters.
    for (const filter of filters) {
      for (const author of filter.authors ?? []) {
        authors.add(author);
      }
    }

    // Query for outbox events.
    const events = await outbox.query([
      { kinds: [10002], authors: [...authors], limit: authors.size },
    ]);

    // Gather relays from NIP-65 events.
    for (const event of events) {
      for (const [name, value] of event.tags) {
        if (name === "r") {
          try {
            const url = new URL(value).toString(); // Normalize the URL.
            routes.add(url, filters);
          } catch (_e) {
            console.log("Req NIP-65 Lookup Error");
            console.log(_e);
          }
        }
      }
    }

    // Finally, return the relays.
    if (routes.size) {
      return routes;
    } else {
      // Optional: fall back to hardcoded relays.
      return relay_urls
    }
  },

  // Get the relays to use for publishing events.
  async eventRouter(event) {
    const relays = new Set<string>();

    // Get just the current user's relay list.
    const [relayList] = await outbox.query([
      { kinds: [10002], authors: [event.pubkey], limit: 1 },
    ]);

    // Gather relays from NIP-65 events.
    for (const [name, value] of relayList?.tags ?? []) {
      if (name === "r") {
        try {
          const url = new URL(value).toString(); // Normalize the URL.
          relays.add(url);
        } catch (_e) {
          console.log("Event NIP-65 Lookup Error");
          console.log(_e);
        }
      }
    }

    if (relays.size) {
      return [...relays];
    } else {
      return relay_urls
    }
  },
});
pool = pool.group(relay_urls);
