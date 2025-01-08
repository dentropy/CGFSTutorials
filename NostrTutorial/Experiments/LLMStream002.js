// Thank you Stack Overflow
// [javascript - How to handle streaming data using fetch? - Stack Overflow](https://stackoverflow.com/questions/62121310/how-to-handle-streaming-data-using-fetch)

console.log(`BASE_URL=${process.env.BASE_URL}`);
console.log(`OPENAI_API_KEY=${process.env.OPENAI_API_KEY}`);

let body = {
  model: "llama3.2:latest",
  messages: [
    {
      "role": "user",
      "content": "Why is the sky blue?",
    },
  ],
  stream: true,
};

async function readAllChunks(readableStream) {
  const reader = readableStream.getReader();
  const chunks = [];
  let done, value;
  const decoder = new TextDecoder();
  while (!done) {
    ({ value, done } = await reader.read());
    if (done) {
      return chunks;
    }
    const decoded_value = decoder.decode(value);
    if (decoded_value.includes("data: [DONE]")) {
      console.log("DONE");
      return chunks.join("");
    } else {
      let mah_result = JSON.parse(decoded_value.slice(6, -1));
      if (mah_result.choices[0].finish_reason == null) {
        chunks.push(mah_result.choices[0].delta.content);
      }
      // console.log("\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n")
      console.clear();
      console.log(chunks.join(""));
    }
  }
}

fetch(process.env.BASE_URL + "/chat/completions", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "Authorization": "Bearer " + process.env.OPENAI_API_KEY,
  },
  body: JSON.stringify(body),
})
  .then(async (response) => {
    // const reader = response.body.getReader();
    readAllChunks(response.body);
  });

// async function createChatCompletion(body) {
//   // Making the request
//   const baseUrl = process.env.BASE_URL;
//   const response = await fetch(baseUrl + "/chat/completions", {
//     method: "POST",
//     headers: {
//       "Content-Type": "application/json",
//       "Authorization": "Bearer " + process.env.OPENAI_API_KEY,
//     },
//     body: JSON.stringify(body),
//   });
//   // Handling errors
//   if (!response.ok) {
//     const error = await response.text();
//     throw new Error(`Failed (${response.status}): ${error}`);
//   }
//   if (!body.stream) { // the non-streaming case
//     console.log("PAUL_WAS_HERE")
//     return response.json();
//   }
//   const stream = response.body;
//   if (!stream) throw new Error("No body in response");
//   // Returning an async iterator
//   return {
//     [Symbol.asyncIterator]: async function* () {
//       for await (const data of splitStream(stream)) {
//         // Handling the OpenAI HTTP streaming protocol
//         if (data.startsWith("data:")) {
//           console.log("TEST")
//           const json = data.substring("data:".length).trimStart();
//           if (json.startsWith("[DONE]")) {
//             return;
//           }
//           yield JSON.parse(json);
//         }
//       }
//     },
//   };
// }

// // Reading the stream
// async function* splitStream(stream) {
//   const reader = stream.getReader();
//   let lastFragment = "";
//   try {
//     while (true) {
//       const { value, done } = await reader.read();
//       if (done) {
//         // Flush the last fragment now that we're done
//         if (lastFragment !== "") {
//           yield lastFragment;
//         }
//         break;
//       }
//       const data = new TextDecoder().decode(value);
//       lastFragment += data;
//       const parts = lastFragment.split("\n\n");
//       // Yield all except for the last part
//       for (let i = 0; i < parts.length - 1; i += 1) {
//         yield parts[i];
//       }
//       // Save the last part as the new last fragment
//       lastFragment = parts[parts.length - 1];
//     }
//   } finally {
//     reader.releaseLock();
//   }
// }

// let result = await createChatCompletion({
//   model: "llama3.2:latest",
//   messages: [
//     {
//       "role": "user",
//       "content": "Hello World",
//     },
//   ],
//   stream: true
// })
// console.log("RESULT")
// console.log(result)
