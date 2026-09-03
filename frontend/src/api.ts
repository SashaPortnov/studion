export interface Message {
    id: number
    text: string
    created_at: string
}

const API_URL = import.meta.env.VITE_API_URL

export async function getMessages(): Promise<Message[]> {
    const response = await fetch(`${API_URL}/messages`)

    if (!response.ok) {
        throw new Error("Failed to load messages")
    }
    return response.json()
}

export async function createMessage(text: string): Promise<Message> {
    const response = await fetch(`${API_URL}/messages`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({text})
    })

    if (!response.ok) {
        throw new Error("Failed to create message")
    }
    return response.json()
}