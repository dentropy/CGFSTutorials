import { pool } from "./pool.ts"

console.log(pool)

let filter = {}
for await (const msg of pool.req([filter])) {
  console.log(msg);
}