import { type FormEvent, useEffect, useState } from "react";
import { createMessage, getMessages, type Message } from "./api";
import "./index.css";

function App() {
    const [messages, setMessages] = useState<Message[]>([])
    const [text, setText] = useState("")
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        getMessages().then(setMessages).catch(() => setError("Failed to load messages")).finally(() => setLoading(false))
    }, [])

    async function handleSubmit(event: FormEvent) {
        event.preventDefault()
        const trimmed = text.trim()
        if (!trimmed || saving) {
            return
        }
        setSaving(true)
        setError(null)

        try {
            const message = await createMessage(trimmed)
            setMessages((current) => [message, ...current])
            setText("")
        } catch {
            setError("Failed to save the message")
        } finally {
            setSaving(false)
        }
    }

    return (
        <main className="page">
            <div className="container">
                <h1>MessageVault</h1>
                <form onSubmit={handleSubmit} className="form">
                    <input type="text" value={text} onChange={(event) => setText(event.target.value)} placeholder="Введите сообщение..." maxLength={1000}/>
                    <button type="submit" disabled={saving || !text.trim()}>{saving ? "Сохранение..." : "Сохранить"}</button>
                </form>
                {error && <p className="error">{error}</p>}
                <section className="messages">
                    {loading ? (<p className="empty">Загрузка...</p>) : messages.length === 0 ? (<p className="empty">Сообщений пока нет</p>) : (messages.map((message) => (<article key={message.id} className="message">
                        <p>{message.text}</p>
                        <time>{new Date(message.created_at).toLocaleString()}</time>
                    </article>)))}
                </section>
            </div>
        </main>
    )
}

export default App