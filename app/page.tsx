"use client";

import { useState, useEffect, useRef } from "react";

// Constants
const MAX_QUESTIONS = 5;

// Helper function for API calls
const fetchSummary = async (questions: string[]) => {
  const response = await fetch("/api/summary", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ questions }),
  });
  const { summary } = await response.json();
  return summary;
};

const fetchChatResponse = async (messages: any[]) => {
  const response = await fetch("/api/chat", {
    method: "POST",
    body: JSON.stringify({ messages }),
  });
  const { messages: newMessages } = await response.json();
  return newMessages;
};

// MessageList Component
const MessageList = ({ messages }: { messages: any[] }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Scroll to the bottom whenever messages change
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div
      ref={containerRef}
      className="bg-white p-4 rounded-lg shadow-md mb-4 max-h-96 overflow-y-auto"
    >
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
            (message.content as { type: string; text: string }[])
              .filter((part) => part.type === "text")
              .map((part, partIndex) => <p key={partIndex}>{part.text}</p>)
          )}
        </div>
      ))}
    </div>
  );
};

// InputBox Component
const InputBox = ({
  input,
  setInput,
  onSend,
  disabled,
}: {
  input: string;
  setInput: (value: string) => void;
  onSend: () => void;
  disabled: boolean; // New prop to disable input and button
}) => (
  <div className="flex items-center gap-2">
    <input
      className="flex-1 text-gray-700 border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
      placeholder="Type your message here..."
      value={input}
      onChange={(event) => setInput(event.target.value)}
      onKeyDown={(event) => {
        if (event.key === "Enter" && input.trim() !== "" && !disabled) onSend();
      }}
      disabled={disabled} // Disable input when loading
    />
    <button
      className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition"
      onClick={onSend}
      disabled={disabled} // Disable button when loading
    >
      {disabled ? "Loading..." : "Send"} {/* Show loading text when disabled */}
    </button>
  </div>
);

// Summary Component
const Summary = ({ summary }: { summary: string }) => (
  <div>
    <p className="text-center text-gray-800 font-semibold mb-6">
      Summary of Questions:
    </p>
    <p className="text-center text-gray-600">{summary}</p>
  </div>
);

// Main Page Component
export default function Page() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<
    { role: string; content: string | { type: string; text: string }[] }[]
  >([]);
  const [questionCount, setQuestionCount] = useState(0);
  const [summary, setSummary] = useState("");
  const [loading, setLoading] = useState(false); // State to track API request status

  useEffect(() => {
    if (questionCount === MAX_QUESTIONS) {
      const generateSummary = async () => {
        const userQuestions = messages
          .filter((message) => message.role === "user")
          .map((message) => message.content as string);
        const summary = await fetchSummary(userQuestions);
        setSummary(summary);
      };
      generateSummary();
    }
  }, [questionCount, messages]);

  const handleSend = async () => {
    if (input.trim() === "") return;

    setLoading(true); // Set loading to true before starting the API request
    setMessages((currentMessages) => [
      ...currentMessages,
      { role: "user", content: input },
    ]);
    setQuestionCount((count) => count + 1);

    const newMessages = await fetchChatResponse([
      ...messages,
      { role: "user", content: input },
    ]);
    setMessages((currentMessages) => [...currentMessages, ...newMessages]);
    setInput("");
    setLoading(false); // Set loading to false after the API request completes
  };

  return (
    <main className="max-w-lg mx-auto p-6 bg-gray-100 shadow-lg rounded-lg mt-10">
      {questionCount !== MAX_QUESTIONS && (
        <div>
          <h1 className="text-2xl font-bold text-center text-blue-600 mb-4">
            The 5 Whys Conversation
          </h1>
          <p className="text-center text-gray-600 mb-6">
            Dive deeper into understanding your goals by asking "Why?" five times.
          </p>
          <p className="text-center text-gray-800 font-semibold mb-6">
            Questions Asked: {questionCount} / {MAX_QUESTIONS}
          </p>
          <MessageList messages={messages} />
          <InputBox
            input={input}
            setInput={setInput}
            onSend={handleSend}
            disabled={loading} // Pass loading state to disable input and button
          />
        </div>
      )}
      {questionCount === MAX_QUESTIONS && <Summary summary={summary} />}
    </main>
  );
}
