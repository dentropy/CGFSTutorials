import { Ollama } from 'ollama'

console.log(`BASE_URL=${process.env.BASE_URL}`);
console.log(`OPENAI_API_KEY=${process.env.OPENAI_API_KEY}`);


const ollama = new Ollama({ host: process.env.BASE_URL })
const response = await ollama.chat({
  model: 'llama3.2:latest',
  messages: [{ role: 'user', content: 'Why is the sky blue?' }],
})
console.log(response)