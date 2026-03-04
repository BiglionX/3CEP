'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Settings,
  Clock,
  Mail,
  RefreshCw,
  Bell,
  Calendar,
  AlertTriangle,
  Phone,
} from 'lucide-react';

export default function MaintenancePage() {
  const [countdown, setCountdown] = useState({
    hours: 2,
    minutes: 30,
    seconds: 45,
  });
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [email, setEmail] = useState('');

  // 倒计时逻辑
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(prev => {
        let { hours, minutes, seconds } = prev;

        if (seconds > 0) {
          seconds--;
        } else if (minutes > 0) {
          minutes--;
          seconds = 59;
        } else if (hours > 0) {
          hours--;
          minutes = 59;
          seconds = 59;
        }

        return { hours, minutes, seconds };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (time: number) => time.toString().padStart(2, '0');

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email && /\S+@\S+\.\S+/.test(email)) {
      // 模拟订阅API调用
      setTimeout(() => {
        setIsSubscribed(true);
        setEmail('');
      }, 500);
    }
  };

  const maintenanceInfo = {
    startTime: '2024�?�?5�?02:00',
    endTime: '2024�?�?5�?06:00',
    reason: '系统升级维护',
    impact: '部分功能暂时不可?,
    status: '进行?,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full text-center text-white">
        {/* 维护图标 */}
        <div className="inline-flex items-center justify-center w-24 h-24 bg-blue-500 rounded-full mb-8 animate-pulse">
          <Settings className="w-12 h-12 text-white" />
        </div>

        {/* 主要信息 */}
        <div className="mb-12">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            系统维护?          </h1>
          <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-2xl mx-auto">
            我们正在进行系统升级维护，以提供更好的服务体?          </p>
        </div>

        {/* 维护详情卡片 */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 mb-12 border border-white/20">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="text-center">
              <Calendar className="w-8 h-8 text-blue-400 mx-auto mb-3" />
              <h3 className="font-semibold text-lg mb-2">开始时?/h3>
              <p className="text-gray-300">{maintenanceInfo.startTime}</p>
            </div>
            <div className="text-center">
              <Clock className="w-8 h-8 text-purple-400 mx-auto mb-3" />
              <h3 className="font-semibold text-lg mb-2">预计完成</h3>
              <p className="text-gray-300">{maintenanceInfo.endTime}</p>
            </div>
            <div className="text-center">
              <AlertTriangle className="w-8 h-8 text-yellow-400 mx-auto mb-3" />
              <h3 className="font-semibold text-lg mb-2">维护原因</h3>
              <p className="text-gray-300">{maintenanceInfo.reason}</p>
            </div>
          </div>

          {/* 影响范围 */}
          <div className="bg-black/20 rounded-lg p-4">
            <h4 className="font-semibold mb-2 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 mr-2 text-yellow-400" />
              影响范围
            </h4>
            <p className="text-gray-300">{maintenanceInfo.impact}</p>
          </div>
        </div>

        {/* 倒计?*/}
        <div className="mb-12">
          <h2 className="text-2xl font-semibold mb-6 flex items-center justify-center">
            <Clock className="w-6 h-6 mr-2" />
            距离恢复还有
          </h2>
          <div className="flex justify-center space-x-4 md:space-x-8">
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 min-w-[100px]">
              <div className="text-4xl md:text-5xl font-bold text-blue-400">
                {formatTime(countdown.hours)}
              </div>
              <div className="text-gray-300 mt-2">小时</div>
            </div>
            <div className="text-4xl md:text-5xl font-bold text-white self-center">
              :
            </div>
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 min-w-[100px]">
              <div className="text-4xl md:text-5xl font-bold text-purple-400">
                {formatTime(countdown.minutes)}
              </div>
              <div className="text-gray-300 mt-2">分钟</div>
            </div>
            <div className="text-4xl md:text-5xl font-bold text-white self-center">
              :
            </div>
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 min-w-[100px]">
              <div className="text-4xl md:text-5xl font-bold text-pink-400">
                {formatTime(countdown.seconds)}
              </div>
              <div className="text-gray-300 mt-2">�?/div>
            </div>
          </div>
        </div>

        {/* 订阅通知 */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 mb-8 border border-white/20">
          <h3 className="text-2xl font-semibold mb-4 flex items-center justify-center">
            <Bell className="w-6 h-6 mr-2 text-yellow-400" />
            服务恢复通知
          </h3>
          <p className="text-gray-300 mb-6">
            留下您的邮箱，我们将在服务恢复后第一时间通知?          </p>

          {isSubscribed ? (
            <div className="text-center py-4">
              <div className="inline-flex items-center px-4 py-2 bg-green-500/20 text-green-400 rounded-lg">
                <Bell className="w-5 h-5 mr-2" />
                订阅成功！我们会在服务恢复后通知?              </div>
            </div>
          ) : (
            <form onSubmit={handleSubscribe} className="max-w-md mx-auto">
              <div className="flex gap-3">
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="输入您的邮箱地址"
                  className="flex-1 px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
                <Button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 px-6"
                >
                  <Mail className="w-4 h-4 mr-2" />
                  订阅
                </Button>
              </div>
            </form>
          )}
        </div>

        {/* 联系信息 */}
        <div className="bg-white/5 backdrop-blur-lg rounded-xl p-6 border border-white/10">
          <h4 className="font-semibold mb-3">紧急联?/h4>
          <div className="flex flex-col sm:flex-row gap-4 justify-center text-gray-300">
            <div className="flex items-center">
              <Phone className="w-4 h-4 mr-2" />
              <span>客服热线: 400-888-9999</span>
            </div>
            <div className="flex items-center">
              <Mail className="w-4 h-4 mr-2" />
              <span>邮箱: support@fixcycle.com</span>
            </div>
          </div>
        </div>

        {/* 刷新按钮 */}
        <div className="mt-8">
          <Button
            variant="outline"
            onClick={() => window.location.reload()}
            className="border-white/30 text-white hover:bg-white/10"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            刷新页面
          </Button>
        </div>
      </div>
    </div>
  );
}

