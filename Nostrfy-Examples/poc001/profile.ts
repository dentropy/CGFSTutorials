import { NRelay1 } from '@nostrify/nostrify';
import { nip19 } from 'nostr-tools';

import { outbox } from './outbox.ts';

export async function handleProfile(nprofile: string, signal?: AbortSignal) {
  const result = nip19.decode(nprofile);

  if (result.type === 'nprofile') {
    const { pubkey, relays = [] } = result.data;

    if (relays[0]) {
      const relay = new NRelay1(relays[0]);

      const [event] = await relay.query(
        [{ kinds: [10002], authors: [pubkey], limit: 1 }],
        { signal },
      );

      // Store the outbox event.
      if (event) {
        await outbox.event(event);
      }

      await relay.close();
    }
  }
}