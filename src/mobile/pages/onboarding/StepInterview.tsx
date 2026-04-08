import { useState, useRef, useEffect } from "react";
import { Mic, Send, Eye, ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import mobileBg from "@/assets/mobile-bg.jpg";

interface StepInterviewProps {
  onComplete: (interviewData: any) => void;
  onSkip?: () => void;
}

const STAGES = [
  { title: "基础认知", questions: ["请简单介绍一下你自己，你的职业角色和日常工作是什么？", "你最近在思考什么重要的事情？"] },
  { title: "决策风格", questions: ["当面对一个重要决策时，你通常会怎么做？是快速决断还是反复权衡？", "你最近做过的最难的一个决定是什么？"] },
  { title: "思维模式", questions: ["你认为自己最擅长的能力是什么？", "你如何看待风险和不确定性？"] },
  { title: "价值观", questions: ["什么事情会让你感到真正的满足？", "你希望在未来3年达成什么目标？"] },
];

const MEMORY_LABELS = ["决策风格", "思维模式", "核心价值", "目标导向"];

interface ChatMessage {
  role: "ai" | "user";
  content: string;
  memoryCard?: { label: string };
}

export default function StepInterview({ onComplete }: StepInterviewProps) {
  const [phase, setPhase] = useState<"intro" | "chat">("intro");
  const [stage, setStage] = useState(0);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [cognition, setCognition] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const { user } = useAuth();

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const startChat = () => {
    setPhase("chat");
    const firstQ = STAGES[0].questions[0];
    setMessages([{ role: "ai", content: firstQ }]);
    setCognition(5);
  };

  const sendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;
    const userMsg: ChatMessage = { role: "user", content: text.trim() };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    try {
      const systemPrompt = `你是一位专业的AI访谈师，正在进行深度认知访谈。当前阶段：${STAGES[stage].title}。
请根据用户的回答进行简短的分析反馈（2-3句话），然后提出下一个相关问题。
保持温和、专业的语气。不要使用Markdown格式。`;

      const chatMessages = [
        { role: "system", content: systemPrompt },
        ...messages.map((m) => ({ role: m.role === "ai" ? "assistant" : "user", content: m.content })),
        { role: "user", content: text.trim() },
      ];

      const response = await supabase.functions.invoke("chat", {
        body: { messages: chatMessages },
      });

      let aiText = "";
      if (response.data) {
        if (typeof response.data === "string") {
          // Parse SSE
          const lines = response.data.split("\n");
          for (const line of lines) {
            if (line.startsWith("data: ") && line !== "data: [DONE]") {
              try {
                const parsed = JSON.parse(line.slice(6));
                const delta = parsed.choices?.[0]?.delta?.content;
                if (delta) aiText += delta;
              } catch {}
            }
          }
        } else if (response.data.choices) {
          aiText = response.data.choices[0]?.message?.content || response.data.choices[0]?.delta?.content || "";
        }
      }

      if (!aiText) aiText = "谢谢你的分享，让我更了解你了。";

      // Determine if we should show a memory card and advance
      const currentStageQuestions = STAGES[stage].questions;
      const nextQIndex = questionIndex + 1;
      let showMemory = false;
      let nextStage = stage;
      let nextQuestionIdx = nextQIndex;

      if (nextQIndex >= currentStageQuestions.length) {
        showMemory = true;
        nextStage = stage + 1;
        nextQuestionIdx = 0;
      }

      const aiMsg: ChatMessage = {
        role: "ai",
        content: aiText,
        memoryCard: showMemory ? { label: MEMORY_LABELS[stage] || "记忆" } : undefined,
      };
      setMessages((prev) => [...prev, aiMsg]);

      if (showMemory) {
        const newCognition = Math.min(100, (nextStage / STAGES.length) * 100);
        setCognition(newCognition);
      }

      if (nextStage >= STAGES.length) {
        // Interview complete
        setTimeout(() => {
          const interviewData = {
            messages: [...messages, userMsg, aiMsg].map((m) => ({ role: m.role, content: m.content })),
            completedAt: new Date().toISOString(),
            stages: STAGES.map((s) => s.title),
          };
          onComplete(interviewData);
        }, 1500);
      } else {
        setStage(nextStage);
        setQuestionIndex(nextQuestionIdx);

        // If we advanced to a new stage, ask the first question of that stage
        if (showMemory && nextStage < STAGES.length) {
          setTimeout(() => {
            setMessages((prev) => [
              ...prev,
              { role: "ai", content: STAGES[nextStage].questions[0] },
            ]);
          }, 2000);
        }
      }
    } catch (e) {
      setMessages((prev) => [...prev, { role: "ai", content: "抱歉，暂时无法连接，请重试。" }]);
    } finally {
      setIsLoading(false);
    }
  };

  // Voice recording
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      chunksRef.current = [];
      recorder.ondataavailable = (e) => chunksRef.current.push(e.data);
      recorder.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        // For now, just transcribe as placeholder
        setInput("[语音消息]");
        setIsRecording(false);
      };
      recorder.start();
      mediaRecorderRef.current = recorder;
      setIsRecording(true);
    } catch {
      setIsRecording(false);
    }
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
  };

  if (phase === "intro") {
    return (
      <div className="min-h-[100dvh] flex flex-col relative overflow-hidden">
        <img src={mobileBg} alt="" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/60" />

        <div className="relative z-10 flex flex-col flex-1 px-8">
          {/* Step indicator */}
          <div className="pt-16 pb-6">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-amber-400 text-lg font-bold">❸</span>
              <span className="text-white text-lg font-medium">深度访谈采集</span>
            </div>
            <div className="flex gap-1.5">
              {[0, 1, 2, 3].map((i) => (
                <div
                  key={i}
                  className={`h-1 flex-1 rounded-full ${i <= 2 ? "bg-amber-400" : "bg-white/20"}`}
                />
              ))}
            </div>
          </div>

          <div className="flex flex-col pt-10">
            <h2 className="text-[28px] font-bold text-white leading-snug">
              形象和声音，
              <br />
              只是开始。
            </h2>
            <p className="text-white/60 text-base mt-4 leading-relaxed">
              真正的你，藏在接下来的回答里。
            </p>
          </div>

          <div className="flex-1" />

          <div className="pb-10">
            <button
              onClick={startChat}
              className="w-full h-[52px] rounded-full text-black text-base font-medium active:scale-[0.98] transition-all"
              style={{ background: "linear-gradient(135deg, #c9a84c, #a08633)" }}
            >
              下一步
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] flex flex-col bg-black relative">
      {/* Header */}
      <div className="px-5 pt-14 pb-3">
        <div className="flex items-center justify-between mb-2">
          <span className="text-white/60 text-sm">阶段 {stage + 1}/4</span>
          <span className="text-teal-400 text-sm font-medium">认知 {Math.round(cognition)}%</span>
        </div>
        <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{
              width: `${cognition}%`,
              background: "linear-gradient(90deg, #2dd4bf, #14b8a6)",
            }}
          />
        </div>
        <p className="text-white/40 text-xs mt-2">它会越来越懂你，越用越像你</p>
      </div>

      {/* Chat area */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-5 pb-4 space-y-4">
        {messages.map((msg, i) => (
          <div key={i}>
            {msg.role === "ai" ? (
              <div className="flex gap-3 items-start">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-500 to-teal-700 flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-white text-xs font-bold">AI</span>
                </div>
                <div className="flex-1">
                  <div className="bg-white/[0.06] rounded-2xl rounded-tl-md px-4 py-3 text-white/90 text-sm leading-relaxed">
                    {msg.content}
                  </div>
                  {msg.memoryCard && (
                    <div className="mt-3 bg-white/[0.04] border border-white/10 rounded-xl px-4 py-3 flex items-center gap-3">
                      <Eye size={16} className="text-teal-400 flex-shrink-0" />
                      <span className="text-white/60 text-xs">记忆已生成</span>
                      <span className="ml-auto text-xs px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-400">
                        {msg.memoryCard.label}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex justify-end">
                <div className="bg-amber-600/20 border border-amber-500/20 rounded-2xl rounded-tr-md px-4 py-3 text-white text-sm max-w-[80%]">
                  {msg.content}
                </div>
              </div>
            )}
          </div>
        ))}
        {isLoading && (
          <div className="flex gap-3 items-start">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-500 to-teal-700 flex items-center justify-center flex-shrink-0">
              <span className="text-white text-xs font-bold">AI</span>
            </div>
            <div className="bg-white/[0.06] rounded-2xl rounded-tl-md px-4 py-3">
              <div className="flex gap-1">
                <div className="w-2 h-2 rounded-full bg-white/30 animate-bounce" style={{ animationDelay: "0ms" }} />
                <div className="w-2 h-2 rounded-full bg-white/30 animate-bounce" style={{ animationDelay: "150ms" }} />
                <div className="w-2 h-2 rounded-full bg-white/30 animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input area */}
      <div className="px-4 pb-8 pt-2 border-t border-white/5">
        {isRecording ? (
          <div className="flex flex-col items-center py-4">
            <div className="w-16 h-16 rounded-full bg-red-500/20 border-2 border-red-500 flex items-center justify-center animate-pulse mb-3">
              <Mic size={24} className="text-red-500" />
            </div>
            <p className="text-white/60 text-sm mb-3">松手发送，上移取消</p>
            <button
              onClick={stopRecording}
              className="text-red-400 text-sm underline"
            >
              取消发送
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <div className="flex-1 relative">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMessage(input)}
                placeholder="输入你的回答..."
                className="w-full bg-white/[0.06] border border-white/10 rounded-full pl-4 pr-12 py-3 text-white text-sm placeholder:text-white/30 focus:outline-none focus:border-white/20"
              />
              <button
                onTouchStart={startRecording}
                onMouseDown={startRecording}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/10 flex items-center justify-center"
              >
                <Mic size={14} className="text-white/50" />
              </button>
            </div>
            <button
              onClick={() => sendMessage(input)}
              disabled={!input.trim() || isLoading}
              className="w-10 h-10 rounded-full flex items-center justify-center disabled:opacity-30 transition-all"
              style={{ background: "linear-gradient(135deg, #c9a84c, #a08633)" }}
            >
              <Send size={16} className="text-black" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
