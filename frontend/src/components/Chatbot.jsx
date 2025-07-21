import { useState } from "react";

export default function Chatbot() {
  const [input, setInput] = useState("");
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim()) return;
    const res = await fetch("http://localhost:5000/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: input }),
    });
    const data = await res.json();
    setHistory((prev) => [...prev, { user: input, ai: data.reply }]);
    setInput("");
    setLoading(false);
  };

  return (
    <section className="max-w-xl md:max-w-2xl lg:max-w-3xl mx-auto mt-8 p-4 space-y-6">
      <h2 className="text-xl font-semibold mb-2">🍿 Movie Chat Assistant</h2>
      {!!history && history.length > 0 && (
        <div className="p-4 border border-gray-700 rounded max-h-64 overflow-y-auto mb-4 space-y-4 bg-gray-800 text-sm text-gray-100">
          {history.map((entry, i) => (
            <div className="space-y-1" key={i}>
              <p className="text-md">
                <strong class="text-blue-400">You:</strong> {entry.user}
              </p>
              <p>
                <strong class="text-purple-400">AI:</strong> {entry.ai}
              </p>
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
        {loading ? "Thinking..." : "Send"}
      </button>
    </section>
  );
}
