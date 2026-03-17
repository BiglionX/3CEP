'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, User, Bot, Sparkles, ShoppingBag, Zap } from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export default function DiagnosisPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: `msg_${Date.now()}_user`,
      role: 'user',
      content: inputValue,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    // 模拟AI响应
    setTimeout(() => {
      const assistantMessage: Message = {
        id: `msg_${Date.now()}_assistant`,
        role: 'assistant',
        content: `根据您描述的"${userMessage.content}"问题，我建议：\n\n1. 首先检查设备是否有物理损坏\n2. 尝试重启设备\n3. 如果问题持续，建议联系专业维修\n\n需要更详细的帮助吗？`,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, assistantMessage]);
      setIsLoading(false);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-4xl mx-auto p-4">
        {/* 页面标题 */}
        <div className="text-center py-8">
          <div className="flex items-center justify-center mb-4">
            <div className="bg-blue-600 p-3 rounded-full">
              <Bot className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">AI 智能诊断</h1>
          <p className="text-gray-600">
            描述您的问题，AI助手将为您提供专业建议
          </p>
        </div>

        {/* 消息列表 */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-4">
          <div className="h-96 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-400">
                <Sparkles className="w-12 h-12 mb-4" />
                <p>开始对话，描述您遇到的问题</p>
              </div>
            ) : (
              messages.map(message => (
                <div
                  key={message.id}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`flex items-start max-w-[80%] ${message.role === 'user' ? 'flex-row-reverse' : ''}`}
                  >
                    <div
                      className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${message.role === 'user' ? 'bg-blue-600 text-white ml-2' : 'bg-indigo-600 text-white mr-2'}`}
                    >
                      {message.role === 'user' ? (
                        <User className="w-5 h-5" />
                      ) : (
                        <Bot className="w-5 h-5" />
                      )}
                    </div>
                    <div
                      className={`rounded-lg p-3 ${message.role === 'user' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-800'}`}
                    >
                      <p className="whitespace-pre-wrap text-sm">
                        {message.content}
                      </p>
                      <p
                        className={`text-xs mt-1 ${message.role === 'user' ? 'text-blue-200' : 'text-gray-500'}`}
                      >
                        {message.timestamp.toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
            {isLoading && (
              <div className="flex justify-start">
                <div className="flex items-start max-w-[80%]">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center mr-2">
                    <Bot className="w-5 h-5" />
                  </div>
                  <div className="bg-gray-100 rounded-lg p-3">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div
                        className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                        style={{ animationDelay: '0.1s' }}
                      ></div>
                      <div
                        className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                        style={{ animationDelay: '0.2s' }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* 输入框 */}
        <div className="bg-white rounded-lg shadow-lg p-4">
          <div className="flex gap-2">
            <input
              type="text"
              value={inputValue}
              onChange={e => setInputValue(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSend()}
              placeholder="描述您遇到的问题..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              disabled={isLoading}
            />
            <button
              onClick={handleSend}
              disabled={isLoading || !inputValue.trim()}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center"
            >
              <Send className="w-4 h-4 mr-2" />
              发送
            </button>
          </div>
        </div>

        {/* 快捷问题 */}
        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-3">
          {['手机无法开机', '屏幕显示异常', '无法充电', '设备发热严重'].map(
            question => (
              <button
                key={question}
                onClick={() => setInputValue(question)}
                className="bg-white rounded-lg shadow p-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              >
                {question}
              </button>
            )
          )}
        </div>

        {/* 商店入口卡片 */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* 智能体商店卡片 */}
          <a
            href="/agent-store"
            className="group bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-all duration-300 cursor-pointer border-2 border-transparent hover:border-blue-500"
          >
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 bg-gradient-to-br from-blue-500 to-blue-600 p-3 rounded-xl group-hover:scale-110 transition-transform">
                <ShoppingBag className="w-8 h-8 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                  智能体商店
                </h3>
                <p className="text-sm text-gray-600">
                  探索和安装各种专业AI智能体,提升工作效率
                </p>
              </div>
            </div>
            <div className="mt-4 flex items-center text-blue-600 text-sm font-medium">
              <span>前往商店</span>
              <svg
                className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </div>
          </a>

          {/* Skills商店卡片 */}
          <a
            href="/skill-store/skills"
            className="group bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-all duration-300 cursor-pointer border-2 border-transparent hover:border-purple-500"
          >
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 bg-gradient-to-br from-purple-500 to-purple-600 p-3 rounded-xl group-hover:scale-110 transition-transform">
                <Zap className="w-8 h-8 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-purple-600 transition-colors">
                  Skills商店
                </h3>
                <p className="text-sm text-gray-600">
                  获取丰富的技能组件,扩展AI助手的能力
                </p>
              </div>
            </div>
            <div className="mt-4 flex items-center text-purple-600 text-sm font-medium">
              <span>前往商店</span>
              <svg
                className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </div>
          </a>
        </div>
      </div>
    </div>
  );
}
