"use client";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Bot,
  Laptop,
  Lightbulb,
  MessageSquare,
  RotateCcw,
  Send,
  Smartphone,
  User,
  Wrench,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface Suggestion {
  id: string;
  text: string;
}

export default function AIDiagnosisChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId] = useState(
    () => `diag_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  );
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 常见问题快捷按钮
  const quickQuestions = [
    { icon: Smartphone, text: "手机无法开机怎么办？", keyword: "手机无法开 },
    { icon: MessageSquare, text: "屏幕显示异常", keyword: "屏幕显示异常" },
    { icon: Wrench, text: "设备发热严重", keyword: "设备发热严重" },
    { icon: Laptop, text: "无法充电", keyword: "手机充不进电" },
  ];

  // 自动滚动到底
  const scrollToBottom = () => {
    messagesEndRef.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // 发送消
  const sendMessage = async (messageText: any: string) => {
    const textToSend = messageText || inputValue.trim();
    if (!textToSend) return;

    // 添加用户消息
    const userMessage: Message = {
      id: `msg_${Date.now()}`,
      role: "user",
      content: textToSend,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);

    try {
      // 调用新的AI诊断分析API
      const response = await fetch("/api/diagnosis/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          faultDescription: textToSend,
          sessionId: sessionId,
          deviceInfo: {
            brand: "Apple",
            model: "iPhone 15 Pro",
            category: "手机",
          },
        }),
      });

      const result = await response.json();

      if (result.success) {
        // 格式化诊断结果为易读的消
        const formattedResponse = formatDiagnosisResponse(
          result.data.diagnosisResult
        );

        // 添加AI回复
        const aiMessage: Message = {
          id: `msg_${Date.now()}_ai`,
          role: "assistant",
          content: formattedResponse,
          timestamp: new Date(),
        };

        setMessages((prev) => [...prev, aiMessage]);

        // 设置后续问题建议
        const suggestionItems = (
          result.data.diagnosisResult.nextQuestions || []
        ).map((question: string, index: number) => ({
          id: `sug_${index}`,
          text: question,
        }));
        setSuggestions(suggestionItems);
      } else {
        throw new Error(result.error || "诊断服务出错");
      }
    } catch (error) {
      console.error("发送消息失", error);
      // 添加错误消息
      const errorMessage: Message = {
        id: `msg_${Date.now()}_error`,
        role: "assistant",
        content: "抱歉，诊断服务暂时不可用。请稍后再试或联系人工客服,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  // 快捷问题
  const handleQuickQuestion = (question: string) => {
    sendMessage(question);
  };

  // 使用建议
  const handleSuggestionClick = (suggestion: string) => {
    sendMessage(suggestion);
  };

  // 清空对话
  const clearConversation = async () => {
    const confirmed = window.confirm("确定要清空当前对话吗);
    if (!confirmed) return;

    try {
      await fetch(`/api/diagnosis/analyzesessionId=${sessionId}`, {
        method: "DELETE",
      });

      setMessages([]);
      setSuggestions([]);
    } catch (error) {
      console.error("清空对话失败:", error);
    }
  };

  // 获取会话信息
  const getSessionInfo = async () => {
    try {
      const response = await fetch(
        `/api/diagnosis/analyzesessionId=${sessionId}`
      );
      const result = await response.json();

      if (result.success) {
        // TODO: 移除调试日志 - // TODO: 移除调试日志 - console.log("会话信息:", result.data)}
    } catch (error) {
      console.error("获取会话信息失败:", error);
    }
  };

  // 格式化诊断结果为易读文本
  const formatDiagnosisResponse = (diagnosisResult: any): string => {
    let response = "";

    // 添加故障原因分析
    if (diagnosisResult.faultCauses && diagnosisResult.faultCauses.length > 0) {
      response += "🔍 **可能的故障原因：**\n";
      diagnosisResult.faultCauses.forEach((cause: any, index: number) => {
        response += `${index + 1}. ${cause.reason} (${
          cause.probability
        }, 置信 ${(cause.confidence * 100).toFixed(0)}%)\n`;
        if (cause.description) {
          response += `   说明: ${cause.description}\n`;
        }
      });
      response += "\n";
    }

    // 添加解决方案
    if (diagnosisResult.solutions && diagnosisResult.solutions.length > 0) {
      response += "🔧 **建议解决方案*\n";
      diagnosisResult.solutions.forEach((solution: any, index: number) => {
        response += `**${index + 1}. ${solution.title}**\n`;
        response += `难度等级: ${solution.difficulty}/5\n`;
        response += `预计时间: ${solution.estimatedTime}分钟\n`;
        if (solution.toolsRequired && solution.toolsRequired.length > 0) {
          response += `所需工具: ${solution.toolsRequired.join(", ")}\n`;
        }
        response += "操作步骤:\n";
        solution.steps.forEach((step: string, stepIndex: number) => {
          response += `  ${stepIndex + 1}) ${step}\n`;
        });
        response += "\n";
      });
    }

    // 添加配件建议
    if (
      diagnosisResult.recommendedParts &&
      diagnosisResult.recommendedParts.length > 0
    ) {
      response += "📦 **可能需要的配件*\n";
      diagnosisResult.recommendedParts.forEach((part: any) => {
        response += `${part.partName}`;
        if (part.partNumber) {
          response += ` (${part.partNumber})`;
        }
        response += ` - 预估价格: ¥${part.estimatedCost.min}-${part.estimatedCost.max}\n`;
        if (part.description) {
          response += `  说明: ${part.description}\n`;
        }
      });
      response += "\n";
    }

    // 添加总体预估
    response += "📊 **总体预估*\n";
    response += `总耗时: ${diagnosisResult.estimatedTotalTime}分钟\n`;
    response += `总费 ¥${diagnosisResult.estimatedTotalCost.min}-${diagnosisResult.estimatedTotalCost.max}\n`;
    response += `诊断置信 ${diagnosisResult.confidenceLevel}\n`;
    if (diagnosisResult.severityLevel) {
      response += `故障严重程度: ${diagnosisResult.severityLevel}\n`;
    }

    return response;
  };

  return (
    <div className="flex flex-col h-[calc(100vh-2rem)] max-w-4xl mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
      {/* 头部 */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Bot className="h-8 w-8" />
            <div>
              <h1 className="text-xl font-bold">AI智能诊断助手</h1>
              <p className="text-blue-100 text-sm">
                为您提供专业的设备故障诊断服
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={clearConversation}
            className="text-white hover:bg-white hover:bg-opacity-20"
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            清空对话
          </Button>
        </div>
      </div>

      {/* 快捷问题区域 */}
      {messages.length === 0 && (
        <div className="p-4 bg-gray-50 border-b">
          <h3 className="text-sm font-medium text-gray-700 mb-3">
            常见问题快速诊断：
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {quickQuestions.map((question, index) => {
              const IconComponent = question.icon;
              return (
                <Button
                  key={index}
                  variant="outline"
                  className="justify-start h-auto py-3 px-4 text-left"
                  onClick={() => handleQuickQuestion(question.keyword)}
                >
                  <IconComponent className="h-5 w-5 mr-3 text-blue-600 flex-shrink-0" />
                  <span className="text-sm">{question.text}</span>
                </Button>
              );
            })}
          </div>
        </div>
      )}

      {/* 建议区域 */}
      {suggestions.length > 0 && (
        <div className="p-4 bg-yellow-50 border-b">
          <div className="flex items-center mb-2">
            <Lightbulb className="h-5 w-5 text-yellow-600 mr-2" />
            <h3 className="text-sm font-medium text-yellow-800">相关建议/h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {suggestions.map((suggestion) => (
              <button
                key={suggestion.id}
                onClick={() => handleSuggestionClick(suggestion.text)}
                className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm hover:bg-yellow-200 transition-colors"
              >
                {suggestion.text}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 消息区域 */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center py-12">
            <Bot className="h-16 w-16 mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              您好！我是AI诊断助手
            </h3>
            <p className="text-gray-500 max-w-md mx-auto">
              请描述您遇到的设备问题，我会尽力为您提供专业的诊断建议和解决方案
            </p>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${
                message.role === "user"  "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`flex items-start space-x-3 max-w-3xl ${
                  message.role === "user"
                     "flex-row-reverse space-x-reverse"
                    : ""
                }`}
              >
                <div
                  className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                    message.role === "user"
                       "bg-blue-600 text-white"
                      : "bg-gray-200 text-gray-600"
                  }`}
                >
                  {message.role === "user" ? (
                    <User className="h-4 w-4" />
                  ) : (
                    <Bot className="h-4 w-4" />
                  )}
                </div>
                <div
                  className={`rounded-lg p-4 ${
                    message.role === "user"
                       "bg-blue-600 text-white"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  <div className="whitespace-pre-wrap">{message.content}</div>
                  <div
                    className={`text-xs mt-2 ${
                      message.role === "user"
                         "text-blue-200"
                        : "text-gray-500"
                    }`}
                  >
                    {message.timestamp.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}

        {/* 加载指示*/}
        {isLoading && (
          <div className="flex justify-start">
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                <Bot className="h-4 w-4 text-gray-600" />
              </div>
              <div className="bg-gray-100 rounded-lg p-4">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div
                    className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                    style={{ animationDelay: "0.1s" }}
                  ></div>
                  <div
                    className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                    style={{ animationDelay: "0.2s" }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* 输入区域 */}
      <div className="border-t p-4 bg-gray-50">
        <div className="flex space-x-3">
          <Textarea
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
              }
            }}
            placeholder="描述您遇到的问题..."
            className="flex-1 resize-none"
            rows={2}
            disabled={isLoading}
          />
          <Button
            onClick={() => sendMessage()}
            disabled={isLoading || !inputValue.trim()}
            className="self-end h-12"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
        <p className="text-xs text-gray-500 mt-2 text-center">
          Enter 发送，Shift + Enter 换行
        </p>
      </div>
    </div>
  );
}

