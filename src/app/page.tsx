"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Cpu, Copy, Check, Search, Code, CheckCircle, TerminalSquare } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import { motion } from "framer-motion";

const EXAMPLE_PROMPTS = [
  "How do I create a GPU Droplet on AMD Developer Cloud?",
  "Set up Llama 3.1 on ROCm",
  "Fix this ROCm import error: cannot import name 'hip'",
  "Compare AMD MI300X vs NVIDIA H100 for LLM inference",
];

export default function Home() {
  const [input, setInput] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [messages, setMessages] = useState<{ id: string; role: "user" | "assistant"; content: string; agents?: Record<string, any> }[]>([]);
  const [currentResponse, setCurrentResponse] = useState<{
    agent1: { status: string; text: string; done: boolean };
    agent2: { status: string; text: string; done: boolean };
    agent3: { status: string; text: string; done: boolean };
  } | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, currentResponse]);

  const handleSend = async (text: string) => {
    if (!text.trim() || isProcessing) return;

    const userMessage = { id: Date.now().toString(), role: "user" as const, content: text };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsProcessing(true);

    setCurrentResponse({
      agent1: { status: "", text: "", done: false },
      agent2: { status: "", text: "", done: false },
      agent3: { status: "", text: "", done: false },
    });

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text }),
      });

      if (!response.body) throw new Error("No response body");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let done = false;

      while (!done) {
        const { value, done: readerDone } = await reader.read();
        done = readerDone;
        if (value) {
          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split("\n\n");
          for (const line of lines) {
            if (line.startsWith("data: ")) {
              try {
                const data = JSON.parse(line.slice(6));
                setCurrentResponse((prev) => {
                  if (!prev) return prev;
                  const newRes = { ...prev };
                  const agentKey = `agent${data.agent}` as keyof typeof newRes;
                  newRes[agentKey] = { ...prev[agentKey] };
                  if (data.type === "status") {
                    newRes[agentKey].status = data.content;
                  } else if (data.type === "chunk") {
                    newRes[agentKey].text += data.content;
                  } else if (data.type === "done") {
                    newRes[agentKey].done = true;
                  }
                  return newRes;
                });
              } catch (e) {
                console.error("Error parsing chunk", e);
              }
            }
          }
        }
      }

      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: "",
        },
      ]);
      
      // Keep agents data attached to the last assistant message
      setCurrentResponse((prev) => {
        setMessages((msgs) => {
          const newMsgs = [...msgs];
          newMsgs[newMsgs.length - 1].agents = prev;
          return newMsgs;
        });
        return null;
      });

    } catch (error) {
      console.error(error);
    } finally {
      setIsProcessing(false);
    }
  };

  const CopyButton = ({ text }: { text: string }) => {
    const [copied, setCopied] = useState(false);
    const handleCopy = () => {
      navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    };
    return (
      <button onClick={handleCopy} className="absolute top-2 right-2 p-2 bg-amd-card rounded-md border border-zinc-700 hover:bg-zinc-800 transition-colors">
        {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4 text-zinc-400" />}
      </button>
    );
  };

  const renderAgentCard = (agentNum: number, title: string, icon: React.ReactNode, bgColor: string, textColor: string, data: { status: string; text: string; done: boolean }) => {
    if (!data.status && !data.text) return null;
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className={`p-4 rounded-xl border mb-4 ${bgColor}`}
      >
        <div className="flex items-center space-x-2 mb-3">
          <div className={`p-1.5 rounded-md ${textColor} bg-opacity-20`}>{icon}</div>
          <h3 className={`font-semibold ${textColor}`}>{title}</h3>
          {!data.done && <span className="ml-auto flex h-3 w-3 relative">
            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${textColor} opacity-75`}></span>
            <span className={`relative inline-flex rounded-full h-3 w-3 ${textColor}`}></span>
          </span>}
        </div>
        {data.status && !data.done && <p className="text-sm opacity-80 mb-2 animate-pulse">{data.status}</p>}
        {data.text && (
          <div className="text-sm prose prose-invert max-w-none">
            <ReactMarkdown
              components={{
                code({ inline, className, children, ...props }: React.ComponentPropsWithoutRef<"code"> & { inline?: boolean }) {
                  const match = /language-(\w+)/.exec(className || "");
                  return !inline && match ? (
                    <div className="relative group mt-4">
                      <CopyButton text={String(children).replace(/\n$/, "")} />
                      <SyntaxHighlighter
                        {...props}
                        style={vscDarkPlus}
                        language={match[1]}
                        PreTag="div"
                        className="rounded-lg !mt-0 border border-zinc-800"
                      >
                        {String(children).replace(/\n$/, "")}
                      </SyntaxHighlighter>
                    </div>
                  ) : (
                    <code {...props} className="bg-zinc-800 px-1 py-0.5 rounded text-amd-red">
                      {children}
                    </code>
                  );
                },
              }}
            >
              {data.text}
            </ReactMarkdown>
          </div>
        )}
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen bg-amd-bg flex flex-col text-white font-sans selection:bg-amd-red selection:text-white">
      {/* Header */}
      <header className="border-b border-zinc-800 bg-amd-bg/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-amd-red rounded-lg flex items-center justify-center shadow-[0_0_15px_rgba(237,28,36,0.5)]">
              <Cpu className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-xl tracking-tight">AMD DevAssist</h1>
              <p className="text-xs text-zinc-400 font-medium tracking-wide">Powered by AMD Developer Cloud</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Chat Area */}
      <main className="flex-1 overflow-y-auto w-full relative">
        <div className="max-w-4xl mx-auto p-4 md:p-6 pb-32">
          {messages.length === 0 && !currentResponse ? (
            <div className="h-full flex flex-col items-center justify-center mt-20 md:mt-32">
              <div className="w-20 h-20 bg-gradient-to-br from-amd-red to-orange-600 rounded-full flex items-center justify-center mb-8 shadow-[0_0_30px_rgba(237,28,36,0.3)]">
                <Cpu className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-3xl font-bold mb-2 text-center bg-clip-text text-transparent bg-gradient-to-r from-white to-zinc-400">
                How can I help you build on AMD today?
              </h2>
              <p className="text-zinc-400 mb-10 text-center max-w-md">
                Ask anything about ROCm, GPU Droplets, or deploying AI models on AMD hardware.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-3xl">
                {EXAMPLE_PROMPTS.map((prompt, i) => (
                  <button
                    key={i}
                    onClick={() => handleSend(prompt)}
                    className="p-4 rounded-xl border border-zinc-800 bg-amd-card hover:bg-zinc-800 hover:border-zinc-700 transition-all text-left flex items-start space-x-3 group"
                  >
                    <TerminalSquare className="w-5 h-5 text-amd-red shrink-0 group-hover:scale-110 transition-transform" />
                    <span className="text-sm text-zinc-300">{prompt}</span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-8">
              {messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                  {msg.role === "user" ? (
                    <div className="bg-zinc-800 text-white px-5 py-3 rounded-2xl max-w-[80%] rounded-tr-sm shadow-md border border-zinc-700/50">
                      {msg.content}
                    </div>
                  ) : (
                    <div className="w-full">
                      {msg.agents && (
                        <div className="space-y-4">
                          {renderAgentCard(1, "Search Agent", <Search className="w-4 h-4" />, "bg-blue-950/30 border-blue-900/50", "text-blue-400", msg.agents.agent1)}
                          {renderAgentCard(2, "Code Agent", <Code className="w-4 h-4" />, "bg-amd-card border-zinc-800", "text-zinc-300", msg.agents.agent2)}
                          {renderAgentCard(3, "Review Agent", <CheckCircle className="w-4 h-4" />, "bg-green-950/30 border-green-900/50", "text-green-400", msg.agents.agent3)}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}

              {currentResponse && (
                <div className="w-full space-y-4">
                  {renderAgentCard(1, "Search Agent", <Search className="w-4 h-4" />, "bg-blue-950/30 border-blue-900/50", "text-blue-400", currentResponse.agent1)}
                  {renderAgentCard(2, "Code Agent", <Code className="w-4 h-4" />, "bg-amd-card border-zinc-800", "text-zinc-300", currentResponse.agent2)}
                  {renderAgentCard(3, "Review Agent", <CheckCircle className="w-4 h-4" />, "bg-green-950/30 border-green-900/50", "text-green-400", currentResponse.agent3)}
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>
      </main>

      {/* Input Area */}
      <div className="fixed bottom-0 left-0 w-full bg-gradient-to-t from-amd-bg via-amd-bg to-transparent pb-6 pt-10 px-4">
        <div className="max-w-4xl mx-auto relative">
          <div className="relative flex items-center bg-amd-card border border-zinc-800 rounded-2xl shadow-xl overflow-hidden focus-within:border-amd-red focus-within:ring-1 focus-within:ring-amd-red transition-all">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend(input);
                }
              }}
              placeholder="Ask anything about AMD Developer Cloud..."
              className="w-full bg-transparent text-white px-6 py-4 outline-none placeholder:text-zinc-500"
              disabled={isProcessing}
            />
            <button
              onClick={() => handleSend(input)}
              disabled={!input.trim() || isProcessing}
              className="absolute right-2 p-2.5 bg-amd-red hover:bg-red-600 disabled:bg-zinc-800 disabled:text-zinc-500 text-white rounded-xl transition-colors"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
          <p className="text-center text-xs text-zinc-500 mt-3">
            AI agents can make mistakes. Verify code before executing.
          </p>
        </div>
      </div>
    </div>
  );
}
