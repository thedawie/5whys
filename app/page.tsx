"use client";

import { useState, useEffect } from "react";

export default function Page() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<{ role: string; content: string | { type: string; text: string }[] }[]>([]);
  const [questionCount, setQuestionCount] = useState(0); // Counter for questions
  const [summary, setSummary] = useState(""); // State to store the summary

  useEffect(() => {
    if (questionCount === 5) {
      // Perform API call to generate summary
      const generateSummary = async () => {
        const response = await fetch("/api/summary", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            questions: messages.filter((message) => message.role === "user").map((message) => message.content),
          }),
        });

        const { summary } = await response.json();
        setSummary(summary);
      };

      generateSummary();
    }
  }, [questionCount, messages]);

  return (
    <main className="max-w-lg mx-auto p-6 bg-gray-100 shadow-lg rounded-lg mt-10">
      <div className={questionCount === 5 ? "invisible" : ""} > 
        <h1 className="text-2xl font-bold text-center text-blue-600 mb-4">
          The 5 Whys Conversation
        </h1>
        <p className="text-center text-gray-600 mb-6">
          Dive deeper into understanding your goals by asking "Why?" five times.
        </p>
        <p className="text-center text-gray-800 font-semibold mb-6">
          Questions Asked: {questionCount} / 5
        </p>

        <div className="bg-white p-4 rounded-lg shadow-md mb-4 max-h-96 overflow-y-auto">
          {messages.map((message, index) => (
            <div
              key={`${message.role}-${index}`}
              className={`p-3 rounded-lg mb-3 ${
                message.role === "user"
                  ? "bg-blue-100 text-blue-800 self-end"
                  : "bg-gray-100 text-gray-800"
              }`}
            >
              <p className="font-semibold">
                {message.role === "user" ? "You" : "Assistant"}:
              </p>
              {typeof message.content === "string" ? (
                <p>{message.content}</p>
              ) : (
                message.content
                  .filter((part: { type: string; text: string }) => part.type === "text")
                  .map((part, partIndex) => (
                    <p key={partIndex}>{part.text}</p>
                  ))
              )}
            </div>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <input
            className="flex-1 text-gray-700 border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            placeholder="Type your message here..."
            value={input}
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={async (event) => {
              if (event.key === "Enter" && input.trim() !== "") {
                setMessages((currentMessages) => [
                  ...currentMessages,
                  { role: "user", content: input },
                ]);

                const response = await fetch("/api/chat", {
                  method: "POST",
                  body: JSON.stringify({
                    messages: [...messages, { role: "user", content: input }],
                  }),
                });

                const { messages: newMessages } = await response.json();

                setMessages((currentMessages) => [
                  ...currentMessages,
                  ...newMessages,
                ]);

                setInput("");
              }
            }}
          />
          <button
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition"
            onClick={async () => {
              if (input.trim() !== "") {
                setMessages((currentMessages) => [
                  ...currentMessages,
                  { role: "user", content: input },
                ]);
                setQuestionCount((count) => count + 1); // Increment the counter

                const response = await fetch("/api/chat", {
                  method: "POST",
                  body: JSON.stringify({
                    messages: [...messages, { role: "user", content: input }],
                  }),
                });

                const { messages: newMessages } = await response.json();

                setMessages((currentMessages) => [
                  ...currentMessages,
                  ...newMessages,
                ]);

                setInput("");
              }
            }}
          >
            Send
          </button>
        </div>
      </div>
      <div className={questionCount === 5 ? "" : "invisible"}>
      <p className="text-center text-gray-800 font-semibold mb-6">
          Summary of Questions:
        </p>
        <p className="text-center text-gray-600">{summary}</p>
      </div>
    </main>
  );
}
