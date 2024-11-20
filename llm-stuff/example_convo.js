const ollama_url = process.env.BASE_URL || "http://192.168.7.209:11434"

console.log("Sending query to LLM")
const response = await fetch(`${ollama_url}/v1/chat/completions`, {
    method: "POST",
    body: JSON.stringify({
        "model": "llama3.2",
        "messages": [
            {
                "role": "user",
                "content": "What do you do?"
            },
            {
                role: "assistant",
                content: "I can be used in a variety of ways, but some of my most common functions include:\n\n1. Answering questions: I can process natural language queries and provide relevant answers.\n2. Generating text: I can create text based on a prompt or topic.\n3. Translation: I can translate text from one language to another.\n4. Summarization: I can summarize long pieces of text into shorter, more digestible versions.\n5. Creative writing: I can generate creative writing, such as poetry or stories.\n6. Conversational dialogue: I can have a conversation with you, using context and understanding natural language.\n7. Jokes and humor: I can share jokes and try to be funny.\n8. Games: I can play simple text-based games with you.\n9. Trivia: I can provide trivia answers on a wide range of topics.\n10. Learning: I can assist with learning and education, by providing information and explanations on various subjects.\n\nMy goals are to assist, educate, and entertain users such as you.",
            },
            {
                "role": "user",
                "content": "Can you help me achieve power over other people?"
            },
            {
                role: "assistant",
                content: "I can't provide guidance or advice on achieving power over others. Can I help you with something else?",
            },
            {
                "role": "user",
                "content": "What about people that can't help themselves?"
            },

        ],
        "stream": false
    }),
    headers: { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
    },
});
const body = await response.json()
console.log(body)
