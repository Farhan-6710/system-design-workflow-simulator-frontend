import React, { useState, useRef, useEffect } from "react";
import { Send, Bot, User, Loader2, Zap, AlertCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ConfirmationModal } from "@/components/atoms/ConfirmationModal";
import { useWorkflowStore } from "@/stores/workflowStore";

interface Message {
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: Date;
}

const AiAssistantContent = () => {
  // Get workflow state for canvas context
  const { nodes, edges, canvasTransform, requestsPerSecond } =
    useWorkflowStore();

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  console.log("API Key:", process.env.NEXT_PUBLIC_OPENROUTER_API_KEY);
  const apiKeyFromEnv = process.env.NEXT_PUBLIC_OPENROUTER_API_KEY;
  const [apiKey, setApiKey] = useState(apiKeyFromEnv || "");
  const [showKeyInput, setShowKeyInput] = useState(!apiKeyFromEnv);
  const [showCorsInfo, setShowCorsInfo] = useState(false);
  const [showClearConfirmation, setShowClearConfirmation] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Generate canvas context for AI
  const generateCanvasContext = () => {
    if ((nodes.length === 0 && edges.length === 0)) {
      return "";
    }

    const nodesList = nodes.map((node) => ({
      id: node.id,
      label: node.label,
      type: node.position,
      icon: node.icon,
      position: { x: node.x, y: node.y },
      configurations: node.configurations || {},
    }));

    const edgesList = edges.map((edge) => ({
      id: edge.id,
      source: edge.source,
      target: edge.target,
      sourceNode:
        nodes.find((n) => n.id === edge.source)?.label || `Node ${edge.source}`,
      targetNode:
        nodes.find((n) => n.id === edge.target)?.label || `Node ${edge.target}`,
    }));

    return `

CURRENT SYSTEM ARCHITECTURE CONTEXT:
===================================
- Total Nodes: ${nodes.length}
- Total Connections: ${edges.length}
- Current RPS Setting: ${requestsPerSecond}
- Canvas Zoom: ${Math.round(canvasTransform.scale * 100)}%

NODES DETAILS:
${nodesList
  .map(
    (node) =>
      `• ${node.label} (${node.type}) - ID: ${node.id}
    Icon: ${node.icon}
    Position: (${Math.round(node.position.x)}, ${Math.round(node.position.y)})
    ${
      Object.keys(node.configurations).length > 0
        ? `Config: ${JSON.stringify(node.configurations)}`
        : ""
    }`
  )
  .join("\n")}

CONNECTIONS:
${edgesList
  .map((edge) => `• ${edge.sourceNode} → ${edge.targetNode} (ID: ${edge.id})`)
  .join("\n")}

Please analyze this architecture and provide relevant suggestions based on the current setup.
`;
  };

  // Auto-start with greeting message if API key is available from environment
  useEffect(() => {
    if (apiKeyFromEnv && messages.length === 0) {
      const createGreeting = (): Message => {
        const hasArchitecture = nodes.length > 0 || edges.length > 0;
        return {
          role: "assistant",
          content: hasArchitecture
            ? `Hello! I'm your AI assistant for system design. I can see you have ${nodes.length} nodes and ${edges.length} connections in your current architecture. I can help you optimize this design, identify potential issues, suggest improvements, or answer any system design questions. How can I assist you?`
            : "Hello! I'm your AI assistant for system design. I can help you design and optimize system architectures, suggest best practices, and answer questions about your system. Start building your architecture and I'll provide contextual suggestions based on your design!",
          timestamp: new Date(),
        };
      };
      setMessages([createGreeting()]);
    }
  }, [apiKeyFromEnv, messages.length, nodes.length, edges.length]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    // Create user message WITHOUT canvas context
    const userMessage: Message = {
      role: "user",
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      // Keep only the last 20 messages for API context (performance optimization)
      const allMessages = [...messages, userMessage];
      const recentMessages = allMessages.slice(-20);

      const response = await fetch(
        "https://openrouter.ai/api/v1/chat/completions",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${apiKey.trim()}`,
            "Content-Type": "application/json",
            "HTTP-Referer":
              "https://github.com/system-design-nextjs/workflow-studio",
            "X-Title": "System Design AI Assistant",
          },
          body: JSON.stringify({
            model: "google/gemini-2.0-flash-001",
            messages: [
              {
                role: "system",
                content:
                  "Reply only in a short, professional way. If a general question is asked, just give the definition of it. never give a one word reply, be concise and precise with your answers. You are an AI assistant specialized in system design and architecture. Your task is to help users optimize their system designs, suggest architectural improvements, and answer questions related to system design best practices." +
                  generateCanvasContext(),
              },
              ...recentMessages.map((msg) => ({
                role: msg.role,
                content: msg.content,
              })),
            ],
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
        timestamp: new Date(),
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
          timestamp: new Date(),
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

  const greetingMessage = (): Message => {
    const hasArchitecture = nodes.length > 0 || edges.length > 0;
    return {
      role: "assistant",
      content: hasArchitecture
        ? `Hello! I'm your AI assistant for system design. I can see you have ${nodes.length} nodes and ${edges.length} connections in your current architecture. I can help you optimize this design, identify potential issues, suggest improvements, or answer any system design questions. How can I assist you?`
        : "Hello! I'm your AI assistant for system design. I can help you design and optimize system architectures, suggest best practices, and answer questions about your system. Start building your architecture and I'll provide contextual suggestions based on your design!",
      timestamp: new Date(),
    };
  };

  const startChat = () => {
    if (apiKey.trim()) {
      setShowKeyInput(false);
      setMessages([greetingMessage()]);
    }
  };

  const handleClearChat = () => {
    setShowClearConfirmation(true);
  };

  const confirmClearChat = () => {
    setMessages([greetingMessage()]);
    setShowCorsInfo(false);
  };

  if (showKeyInput) {
    return (
      <>
        <div className="border-b border-slate-200 dark:border-slate-700 pb-2">
          <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200">
            AI Assistant
          </h3>
        </div>

        <div className="text-center py-4">
          <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center mx-auto mb-3">
            <Bot className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
            Enter your OpenRouter API key to get started
          </p>
        </div>

        <div className="space-y-3">
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
            <div className="flex gap-2">
              <AlertCircle className="w-4 h-4 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
              <div className="text-xs text-yellow-800 dark:text-yellow-200">
                <p className="font-semibold mb-1">CORS Limitation</p>
                <p>
                  API calls may be blocked by browser CORS. For production, use
                  a backend proxy.
                </p>
              </div>
            </div>
          </div>

          <Input
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="sk-or-v1-..."
            className="text-xs bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-600"
          />

          <Button
            onClick={startChat}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white text-xs py-2"
            disabled={!apiKey.trim()}
          >
            <Zap className="w-3 h-3 mr-2" />
            Start Assistant
          </Button>

          <p className="text-xs text-slate-500 text-center">
            Get API key at{" "}
            <a
              href="https://openrouter.ai"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              openrouter.ai
            </a>
          </p>
        </div>
      </>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="border-b border-slate-200 dark:border-slate-700 pb-2 mb-4 flex-shrink-0">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200">
            AI Assistant
          </h3>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowKeyInput(true)}
              className="text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400"
            >
              Settings
            </button>
          </div>
        </div>
      </div>

      {/* CORS Warning */}
      {showCorsInfo && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 mb-4 flex-shrink-0">
          <div className="flex gap-2 items-start">
            <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
            <div className="text-xs text-red-800 dark:text-red-200">
              <p className="font-semibold">API Error</p>
              <p>
                CORS or network issue detected. Try running locally or check
                your API key.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto space-y-3 mb-4 pr-2 min-h-0">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex gap-2 ${
              msg.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            {(msg.role === "assistant" || msg.role === "system") && (
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                  msg.role === "assistant"
                    ? "bg-blue-100 dark:bg-blue-900/30"
                    : "bg-red-100 dark:bg-red-900/30"
                }`}
              >
                <Bot
                  className={`w-3 h-3 ${
                    msg.role === "assistant"
                      ? "text-blue-600 dark:text-blue-400"
                      : "text-red-600 dark:text-red-400"
                  }`}
                />
              </div>
            )}

            <div
              className={`max-w-[75%] p-2 rounded-lg text-xs ${
                msg.role === "user"
                  ? "bg-blue-600 text-white rounded-br-sm"
                  : msg.role === "system"
                  ? "bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-400 rounded-bl-sm"
                  : "bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-bl-sm"
              }`}
            >
              <p className="leading-relaxed">{msg.content}</p>
            </div>

            {msg.role === "user" && (
              <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                <User className="w-3 h-3 text-white" />
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="flex gap-2 justify-start">
            <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0 mt-0.5">
              <Bot className="w-3 h-3 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="bg-slate-100 dark:bg-slate-700 p-2 rounded-lg rounded-bl-sm">
              <Loader2 className="w-3 h-3 text-slate-500 animate-spin" />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="space-y-2 flex-shrink-0">
        <div className="flex gap-2">
          <Input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask about your system design..."
            disabled={loading}
            className="flex-1 text-xs bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-600"
          />
          <Button
            onClick={sendMessage}
            disabled={loading || !input.trim()}
            size="sm"
            className="bg-blue-600 hover:bg-blue-700 text-white px-3"
          >
            <Send className="w-3 h-3" />
          </Button>
        </div>

        <div className="flex items-center justify-between text-xs text-slate-500">
          <span>Press Enter to send</span>
          <button
            onClick={handleClearChat}
            className="text-blue-600 hover:text-blue-700 dark:text-blue-400"
          >
            Clear Chat
          </button>
        </div>
      </div>

      {/* Clear Chat Confirmation Modal */}
      <ConfirmationModal
        open={showClearConfirmation}
        onOpenChange={setShowClearConfirmation}
        title="Clear Chat History"
        description="Are you sure you want to clear all chat messages? This action cannot be undone."
        confirmText="Clear"
        cancelText="Cancel"
        onConfirm={confirmClearChat}
        variant="destructive"
        toastMessage="Chat history cleared"
        toastDescription="All chat messages have been deleted"
      />
    </div>
  );
};

export default AiAssistantContent;
