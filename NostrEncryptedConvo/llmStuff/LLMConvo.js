import { nip19 } from "nostr-tools";

export default async function LLMConvo(messages, nsec) {
    let ai_assistent_account = nip19.decode(nsec).data
    let llm_messages = []
    for (let message of messages) {
        if (message.pubkey == ai_assistent_account) {
            llm_messages.push({
                role: "assistant",
                content: message.decrypted_content
            })
        }
        else {
            llm_messages.push({
                role: "user",
                content: message.decrypted_content
            })
        }
    }
    let llm_response = await fetch(`${process.env.BASE_URL}/v1/chat/completions`, {
        method: "POST",
        body: JSON.stringify({
            "model": "llama3.2",
            "messages": llm_messages,
            "stream": false
        }),
        headers: { 
            "Content-Type": "application/json",
            "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
        },
    });
    llm_response = await llm_response.json()
    return llm_response.choices[0].message.content
}