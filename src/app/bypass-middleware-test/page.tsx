'use client';
'
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function BypassMiddlewareTest() {
  const router = useRouter();
  const [authStatus, setAuthStatus] = useState('检查中...');
  const [canAccess, setCanAccess] = useState(false);

  useEffect(() => {
    const checkAccess = async () => {
      try {
        // 直接检查会话而不依赖中间        const response = await fetch('/api/auth/check-session');
        const data = await response.json();

        if (data.authenticated && data.is_admin) {'
          setAuthStatus('已认证为管理员);
          setCanAccess(true);
        } else {'
          setAuthStatus('未认证或非管理员');
          setCanAccess(false);
        }
      } catch (error) {
        setAuthStatus(`检查失 ${error.message}`);
        setCanAccess(false);
      }
    };

    checkAccess();
  }, []);

  const handleManualAccess = () => {
    // 直接跳转，忽略中间件
    window.location.href = '/admin/dashboard';
  };

  return (
    <div className="min-h-screen bg-gray-100 py-12">"
      <div className="max-w-2xl mx-auto px-4">"
        <div className="bg-white rounded-lg shadow-lg p-8">"
          <h1 className="text-3xl font-bold text-center mb-8 text-gray-900">
            绕过中间件访问测          </h1>
"
          <div className="space-y-6">"
            <div className="bg-blue-50 p-6 rounded-lg">"
              <h2 className="text-xl font-semibold mb-4 text-blue-800">
                认证状              </h2>"
              <p className="text-lg font-mono bg-white p-3 rounded">
                {authStatus}
              </p>
            </div>

            {canAccess  ("
              <div className="bg-green-50 p-6 rounded-lg">"
                <h2 className="text-xl font-semibold mb-4 text-green-800">
                  访问权限
                </h2>"
                <p className="text-green-700 mb-4">您已获得管理员访问权/p>
                <button
                  onClick={handleManualAccess}"
                  className="w-full bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-lg font-medium transition-colors"
                >
                  直接访问管理后台 (绕过中间
                </button>
              </div>
            ) : ("
              <div className="bg-red-50 p-6 rounded-lg">"
                <h2 className="text-xl font-semibold mb-4 text-red-800">
                  访问受限
                </h2>"
                <p className="text-red-700">您没有足够的权限访问管理后台</p>
              </div>
            )}
"
            <div className="bg-yellow-50 p-6 rounded-lg">"
              <h2 className="text-xl font-semibold mb-4 text-yellow-800">
                测试说明
              </h2>"
              <ul className="space-y-2 text-yellow-700">
                <li>此页面绕过了中间件的权限检/li>
                <li>直接使用API检查用户认证状/li>
                <li>如果能正常访问，说明问题在中间件配置</li>
                <li>如果仍然无法访问，说明是路由配置问题</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

'"