/*
export BASE_URL='https://ai.newatlantis.top/api'
export OPENAI_API_KEY="sk-ENTROPY"
*/
import process from "node:process";
import { resourceLimits } from "node:worker_threads";

console.log(`BASE_URL=${process.env.BASE_URL}`);
console.log(`OPENAI_API_KEY=${process.env.OPENAI_API_KEY}`);


async function handleStream() {
    try {
      const response = await fetch(`${process.env.BASE_URL}/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: "llama3.2:latest",
          messages: [
            {
              "role": "user",
              "content": "Hello World",
            },
          ],
        }),
      })
      const reader = response.body.getReader();
  
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
  
        // Process the chunk of data
        console.log(value.toString());
      }
    } catch (error) {
      console.error(error);
    }
  }
  
  handleStream();





// function handleStreamError(err) {
//   if (err.name === "AbortError") {
//     console.log("Fetch aborted");
//   } else {
//     console.error("Fetch error:", err);
//   }
// }

// function handleStreamResponse(response, controller) {
//   const reader = response.body.getReader();
//   const decoder = new TextDecoder();
//   let fullText = "";
//   console.log(response);
// }

// function startStreaming(prompt) {
//   const controller = new AbortController();
//   const signal = controller.signal;
//   fetch(`${process.env.BASE_URL}/chat/completions`, {
//     method: "POST",
//     headers: {
//       "Content-Type": "application/json",
//       "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
//     },
//     body: JSON.stringify({
//       model: "llama3.2:latest",
//       messages: [
//         {
//           "role": "user",
//           "content": prompt,
//         },
//       ],
//     }),
//     signal: signal,
//   })
//     .then((response) => handleStreamResponse(response, controller))
//     .catch(handleStreamError);
//   return controller; // Return the controller for external abort access
// }

// startStreaming("Hi there");

// console.log(`${process.env.BASE_URL}/chat/completions`)
// let result = await fetch(`${process.env.BASE_URL}/chat/completions`, {
//     method: "POST",
//     headers: {
//       "Content-Type": "application/json",
//       "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
//     },
//     body: JSON.stringify({
//       model: "llama3.2:latest",
//       messages: [
//         {
//           "role": "user",
//           "content": "Why is the sky blue?",
//         },
//       ],
//     }),
//   })
// result = await result.json()
// console.log(result)
