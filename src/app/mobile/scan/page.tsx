'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  QrCode,
  Camera,
  Image,
  Upload,
  Flashlight,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  X,
} from 'lucide-react';

export default function MobileScanPage() {
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<string | null>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [torchEnabled, setTorchEnabled] = useState(false);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // 请求摄像头权?  const requestCameraPermission = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        setCameraActive(true);
        setPermissionDenied(false);
      }
    } catch (error) {
      console.error('摄像头权限被拒绝:', error);
      setPermissionDenied(true);
    }
  };

  // 开始扫?  const startScan = async () => {
    setIsScanning(true);
    setScanResult(null);
    await requestCameraPermission();
  };

  // 停止扫描
  const stopScan = () => {
    setIsScanning(false);
    setCameraActive(false);

    if (videoRef?.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
  };

  // 切换闪光?  const toggleTorch = () => {
    if (videoRef?.srcObject) {
      const track = (
        videoRef.current.srcObject as MediaStream
      ).getVideoTracks()[0];
      if (track) {
        // 注意：闪光灯API在某些浏览器中可能不可用
        setTorchEnabled(!torchEnabled);
      }
    }
  };

  // 处理图片上传
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = e => {
        // 模拟二维码识?        setTimeout(() => {
          setScanResult('DEV202402001'); // 模拟扫描结果
        }, 1000);
      };
      reader.readAsDataURL(file);
    }
  };

  // 模拟扫描成功
  useEffect(() => {
    if (isScanning && cameraActive) {
      const scanTimer = setTimeout(() => {
        setScanResult('DEV202402001');
        stopScan();
      }, 3000); // 3秒后模拟扫描成功

      return () => clearTimeout(scanTimer);
    }
  }, [isScanning, cameraActive]);

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* 顶部导航?*/}
      <div className="bg-gray-800 px-4 py-3 flex items-center justify-between">
        <button
          onClick={() => window.history.back()}
          className="p-2 rounded-lg hover:bg-gray-700 transition-colors"
        >
          <X className="w-6 h-6" />
        </button>
        <h1 className="text-lg font-semibold">扫码识别</h1>
        <div className="w-10"></div> {/* 占位元素保持居中 */}
      </div>

      {/* 扫描区域 */}
      <div className="flex flex-col items-center justify-center p-4">
        {!isScanning ? (
          /* 准备扫描界面 */
          <div className="w-full max-w-md text-center">
            <div className="w-64 h-64 mx-auto mb-8 relative">
              <div className="absolute inset-0 border-4 border-dashed border-blue-500 rounded-2xl flex items-center justify-center">
                <QrCode className="w-16 h-16 text-blue-500 opacity-50" />
              </div>
            </div>

            <h2 className="text-2xl font-bold mb-4">准备扫描</h2>
            <p className="text-gray-400 mb-8">将二维码放入框内，即可自动扫?/p>

            <div className="space-y-4">
              <Button
                onClick={startScan}
                className="w-full bg-blue-600 hover:bg-blue-700 py-4 text-lg"
              >
                <Camera className="w-5 h-5 mr-2" />
                开始扫?              </Button>

              <div className="relative">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  id="image-upload"
                />
                <Button
                  variant="outline"
                  className="w-full border-gray-600 text-gray-300 py-4"
                  asChild
                >
                  <label htmlFor="image-upload" className="cursor-pointer">
                    <Image className="w-5 h-5 mr-2" />
                    上传图片识别
                  </label>
                </Button>
              </div>
            </div>
          </div>
        ) : (
          /* 扫描进行中界?*/
          <div className="w-full max-w-md">
            <div className="relative bg-black rounded-2xl overflow-hidden mb-6">
              {/* 视频预览 */}
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="w-full aspect-square object-cover"
              />

              {/* 扫描框叠加层 */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-64 h-64 border-4 border-green-500 rounded-xl relative">
                  {/* 扫描线动?*/}
                  <div className="absolute top-0 left-0 right-0 h-1 bg-green-500 animate-pulse"></div>

                  {/* 角标 */}
                  <div className="absolute -top-2 -left-2 w-6 h-6 border-t-4 border-l-4 border-green-500"></div>
                  <div className="absolute -top-2 -right-2 w-6 h-6 border-t-4 border-r-4 border-green-500"></div>
                  <div className="absolute -bottom-2 -left-2 w-6 h-6 border-b-4 border-l-4 border-green-500"></div>
                  <div className="absolute -bottom-2 -right-2 w-6 h-6 border-b-4 border-r-4 border-green-500"></div>
                </div>
              </div>

              {/* 控制按钮 */}
              <div className="absolute bottom-4 left-4 right-4 flex justify-center space-x-4">
                <button
                  onClick={toggleTorch}
                  className={`p-3 rounded-full bg-black/50 backdrop-blur-sm ${
                    torchEnabled ? 'text-yellow-400' : 'text-gray-400'
                  }`}
                >
                  <Flashlight className="w-6 h-6" />
                </button>
                <button
                  onClick={stopScan}
                  className="p-3 rounded-full bg-black/50 backdrop-blur-sm text-gray-400"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="text-center">
              <p className="text-lg font-medium mb-2">正在扫描...</p>
              <p className="text-gray-400">请将二维码对准扫描框</p>
            </div>
          </div>
        )}

        {/* 扫描结果显示 */}
        {scanResult && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
            <div className="bg-gray-800 rounded-2xl p-6 w-full max-w-sm text-center">
              <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-2">扫描成功</h3>
              <p className="text-gray-300 mb-6">识别到设备二维码</p>
              <div className="bg-gray-700 rounded-lg p-4 mb-6">
                <p className="font-mono text-lg break-all">{scanResult}</p>
              </div>
              <div className="space-y-3">
                <Button className="w-full bg-blue-600 hover:bg-blue-700">
                  查看设备详情
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setScanResult(null)}
                  className="w-full border-gray-600 text-gray-300"
                >
                  继续扫描
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* 权限拒绝提示 */}
        {permissionDenied && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
            <div className="bg-gray-800 rounded-2xl p-6 w-full max-w-sm text-center">
              <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-2">需要摄像头权限</h3>
              <p className="text-gray-300 mb-6">
                请在浏览器设置中允许访问摄像头才能使用扫码功?              </p>
              <Button
                onClick={() => setPermissionDenied(false)}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                知道?              </Button>
            </div>
          </div>
        )}
      </div>

      {/* 底部提示 */}
      <div className="px-4 py-6 text-center text-gray-500 text-sm">
        <p>支持二维码和条形码扫?/p>
        <p className="mt-1">确保光线充足以提高识别率</p>
      </div>
    </div>
  );
}

