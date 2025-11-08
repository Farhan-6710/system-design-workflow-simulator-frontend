import { useState, useRef, useEffect } from "react";
import { Send, Bot, User, Loader2, AlertCircle } from "lucide-react";

interface Message {
  role: "user" | "assistant" | "system";
  content: string;
}

export default function ChatBot() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [apiKey, setApiKey] = useState(
    process.env.NEXT_PUBLIC_OPENROUTER_API_KEY || ""
  );
  const [showKeyInput, setShowKeyInput] = useState(true);
  const [showCorsInfo, setShowCorsInfo] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMessage: Message = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const response = await fetch(
        "https://openrouter.ai/api/v1/chat/completions",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${apiKey.trim()}`,
            "Content-Type": "application/json",
            "HTTP-Referer": "https://github.com/yourusername/chatbot",
            "X-Title": "ChatBot",
          },
          body: JSON.stringify({
            model: "deepseek/deepseek-chat",
            messages: [...messages, userMessage],
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          `API Error ${response.status}: ${
            errorData.error?.message || response.statusText
          }`
        );
      }

      const data = await response.json();
      const assistantMessage: Message = {
        role: "assistant",
        content: data.choices[0].message.content,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          role: "system",
          content: `Error: ${
            error instanceof Error ? error.message : "Unknown error"
          }`,
        },
      ]);
      setShowCorsInfo(true);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (showKeyInput) {
        startChat();
      } else {
        sendMessage();
      }
    }
  };

  const startChat = () => {
    if (apiKey.trim()) {
      setShowKeyInput(false);
    }
  };

  if (showKeyInput) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-2xl w-full">
          <div className="text-center mb-6">
            <Bot className="w-16 h-16 mx-auto text-indigo-600 mb-4" />
            <h1 className="text-3xl font-bold text-gray-800 mb-2">ChatBot</h1>
            <p className="text-gray-600">
              Enter your OpenRouter API key to get started
            </p>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
            <div className="flex gap-2">
              <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-yellow-800">
                <p className="font-semibold mb-1">Important: CORS Limitation</p>
                <p className="mb-2">
                  This chatbot may not work directly in Claude artifacts due to
                  browser CORS restrictions. OpenRouter API calls typically need
                  to be made from a backend server.
                </p>
                <p className="font-semibold">To use this code:</p>
                <ul className="list-disc ml-4 mt-1 space-y-1">
                  <li>
                    Copy the code and run it locally (e.g., with Create React
                    App)
                  </li>
                  <li>Or deploy it to a hosting service</li>
                  <li>Or create a backend proxy server to handle API calls</li>
                </ul>
              </div>
            </div>
          </div>

          <input
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="sk-or-v1-..."
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none mb-4"
          />
          <button
            onClick={startChat}
            className="w-full bg-gradient-primary text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition-colors"
          >
            Try Anyway
          </button>
          <p className="text-sm text-gray-500 mt-4 text-center">
            Get a free API key at{" "}
            <a
              href="https://openrouter.ai"
              target="_blank"
              rel="noopener noreferrer"
              className="text-indigo-600 hover:underline"
            >
              openrouter.ai
            </a>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl h-[600px] flex flex-col">
        <div className="bg-gradient-primary text-white p-4 rounded-t-2xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Bot className="w-8 h-8" />
            <div>
              <h1 className="text-xl font-bold">ChatBot</h1>
              <p className="text-sm text-indigo-200">Powered by DeepSeek</p>
            </div>
          </div>
          <button
            onClick={() => setShowKeyInput(true)}
            className="text-sm text-indigo-200 hover:text-white transition-colors"
          >
            Change API Key
          </button>
        </div>

        {showCorsInfo && (
          <div className="bg-red-50 border-b border-red-200 p-3">
            <div className="flex gap-2 items-start">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-red-800">
                <p className="font-semibold">CORS Error Detected</p>
                <p>
                  The browser is blocking the API request. You need to run this
                  code locally or use a backend proxy. Click the button below to
                  see the implementation code.
                </p>
                <button
                  onClick={() => {
                    const codeElement = document.querySelector(
                      "#implementation-code"
                    );
                    const code = codeElement?.textContent;
                    if (code) {
                      navigator.clipboard.writeText(code);
                      alert(
                        "Code copied to clipboard! Run it locally with: npx create-react-app my-chatbot"
                      );
                    }
                  }}
                  className="mt-2 bg-red-600 text-white px-3 py-1 rounded text-xs hover:bg-red-700"
                >
                  Copy Full Code
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 && (
            <div className="text-center text-gray-500 mt-8">
              <Bot className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <p className="text-lg">Start a conversation!</p>
              <p className="text-sm">Ask me anything...</p>
            </div>
          )}
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex gap-3 ${
                msg.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              {msg.role === "assistant" && (
                <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">
                  <Bot className="w-5 h-5 text-indigo-600" />
                </div>
              )}
              {msg.role === "system" && (
                <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                  <AlertCircle className="w-5 h-5 text-red-600" />
                </div>
              )}
              <div
                className={`max-w-[70%] p-3 rounded-2xl ${
                  msg.role === "user"
                    ? "bg-indigo-600 text-white rounded-br-none"
                    : msg.role === "system"
                    ? "bg-red-100 text-red-800 rounded-bl-none"
                    : "bg-gray-100 text-gray-800 rounded-bl-none"
                }`}
              >
                <p className="whitespace-pre-wrap">{msg.content}</p>
              </div>
              {msg.role === "user" && (
                <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center flex-shrink-0">
                  <User className="w-5 h-5 text-white" />
                </div>
              )}
            </div>
          ))}
          {loading && (
            <div className="flex gap-3 justify-start">
              <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">
                <Bot className="w-5 h-5 text-indigo-600" />
              </div>
              <div className="bg-gray-100 p-3 rounded-2xl rounded-bl-none">
                <Loader2 className="w-5 h-5 text-gray-500 animate-spin" />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="p-4 border-t border-gray-200">
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              disabled={loading}
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none disabled:bg-gray-50"
            />
            <button
              onClick={sendMessage}
              disabled={loading || !input.trim()}
              className="bg-indigo-600 text-white p-3 rounded-lg hover:bg-indigo-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      <div id="implementation-code" className="hidden">
        {`// Save this as App.js in a React project
import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Loader2 } from 'lucide-react';

export default function ChatBot() {
  // ... [full component code here] ...
}

// To run:
// 1. npx create-react-app my-chatbot
// 2. cd my-chatbot
// 3. npm install lucide-react
// 4. Replace src/App.js with this code
// 5. npm start`}
      </div>
    </div>
  );
}
