import { useState } from "react";

export default function Chatbot() {
  const [input, setInput] = useState("");
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    const baseUrl = import.meta.env.VITE_API_URL;

    if (!input.trim()) return;
    const res = await fetch(`${baseUrl}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: input }),
    });

    if (res.status === 429) {
      setError("Too many requests—try again soon.");
      return;
    }

    if (!res.ok) {
      const errorData = await res.json();
      setError(errorData.error || "Something went wrong.");
      setLoading(false);
      return;
    }

    const data = await res.json();
    setHistory((prev) => [...prev, { user: input, ai: data.reply }]);
    setInput("");
    setLoading(false);
  };

  return (
    <section className="max-w-xl md:max-w-2xl lg:max-w-3xl mx-auto mt-8 p-4 space-y-6">
      <h2 className="text-xl font-semibold mb-2">🍿 Movie Chat Assistant</h2>
      {!!history && history.length > 0 && (
        <div
          id="chat-history"
          className="p-4 border border-gray-700 rounded max-h-96 overflow-y-auto mb-4 bg-gray-800 text-sm text-gray-100 flex flex-col gap-4"
        >
          {history.map((entry, i) => (
            <div key={i}>
              <div className="flex justify-end">
                <div className="max-w-[70%] bg-blue-600 text-white px-4 py-2 rounded-xl rounded-br-none shadow-md whitespace-pre-wrap">
                  {entry.user}
                </div>
              </div>

              <div className="flex justify-start">
                <div className="max-w-[70%] bg-[#70264b] text-white px-4 py-2 rounded-xl rounded-bl-none shadow-md whitespace-pre-wrap">
                  {entry.ai}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      <textarea
        className="border p-2 w-full mb-2"
        value={input}
        rows={4}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && sendMessage()}
        placeholder="Ask about any movie or actor..."
      />
      <button
        onClick={sendMessage}
        disabled={loading}
        className="bg-blue-500 text-white px-4 py-2 rounded"
      >
        {loading ? "Thinking..." : "Send (⏎)"}
      </button>
    </section>
  );
}
