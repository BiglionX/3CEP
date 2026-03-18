'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
} from '@/components/ui/dialog';
import QRCode from 'qrcode';
import { 
  BarChart3, 
  Blockchain, 
  QrCode, 
  RefreshCw, 
  Download, 
  Printer,
  Copy,
  Search,
  Loader2,
  ExternalLink,
  Hash,
  Package,
  CheckCircle,
  XCircle,
  ZoomIn,
  ZoomOut,
  RotateCw,
} from 'lucide-react';

interface QrCodeRecord {
  id: string;
  blockchainCode: string;
  productName: string;
  createdAt: string;
  qrCodeDataUrl: string;
  scanned: number;
}

export default function QrCodeGenerationPage() {
  const [blockchainCode, setBlockchainCode] = useState('');
  const [productName, setProductName] = useState('');
  const [generating, setGenerating] = useState(false);
  const [generatedCode, setGeneratedCode] = useState<string | null>(null);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string | null>(null);
  const [records, setRecords] = useState<QrCodeRecord[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [previewOpen, setPreviewOpen] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // 模拟历史记录
  const mockRecords: QrCodeRecord[] = [
    {
      id: '1',
      blockchainCode: 'BC00001001',
      productName: '智能产品A',
      createdAt: '2024-03-15 10:30:00',
      qrCodeDataUrl: '',
      scanned: 15,
    },
    {
      id: '2',
      blockchainCode: 'BC00001002',
      productName: '智能产品B',
      createdAt: '2024-03-16 14:20:00',
      qrCodeDataUrl: '',
      scanned: 8,
    },
    {
      id: '3',
      blockchainCode: 'BC00001003',
      productName: '智能产品C',
      createdAt: '2024-03-17 09:15:00',
      qrCodeDataUrl: '',
      scanned: 23,
    },
  ];

  useEffect(() => {
    setRecords(mockRecords);
  }, []);

  // 生成二维码
  const handleGenerate = async () => {
    if (!blockchainCode) return;

    setGenerating(true);
    try {
      // 构建二维码内容（包含区块链码和产品信息）
      const qrContent = JSON.stringify({
        code: blockchainCode,
        product: productName,
        verify: `https://verify.3cep.com/${blockchainCode}`,
        timestamp: Date.now(),
      });

      // 生成二维码
      const dataUrl = await QRCode.toDataURL(qrContent, {
        width: 300,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#ffffff',
        },
        errorCorrectionLevel: 'H',
      });

      setQrCodeDataUrl(dataUrl);
      setGeneratedCode(blockchainCode);

      // 添加到记录
      const newRecord: QrCodeRecord = {
        id: String(records.length + 1),
        blockchainCode,
        productName: productName || '未命名产品',
        createdAt: new Date().toLocaleString('zh-CN'),
        qrCodeDataUrl: dataUrl,
        scanned: 0,
      };

      setRecords([newRecord, ...records]);
    } catch (error) {
      console.error('Failed to generate QR code:', error);
    } finally {
      setGenerating(false);
    }
  };

  // 下载二维码
  const handleDownload = async (format: 'png' | 'svg') => {
    if (!generatedCode) return;

    try {
      const qrContent = JSON.stringify({
        code: generatedCode,
        product: productName,
        verify: `https://verify.3cep.com/${generatedCode}`,
      });

      let dataUrl: string;
      let filename: string;

      if (format === 'png') {
        dataUrl = await QRCode.toDataURL(qrContent, {
          width: 500,
          margin: 2,
          errorCorrectionLevel: 'H',
        });
        filename = `qrcode-${generatedCode}.png`;
      } else {
        dataUrl = await QRCode.toString(qrContent, {
          type: 'svg',
          width: 500,
          margin: 2,
          errorCorrectionLevel: 'H',
        });
        // 转换为blob
        const blob = new Blob([dataUrl], { type: 'image/svg+xml' });
        dataUrl = URL.createObjectURL(blob);
        filename = `qrcode-${generatedCode}.svg`;
      }

      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = filename;
      link.click();
    } catch (error) {
      console.error('Failed to download QR code:', error);
    }
  };

  // 打印二维码
  const handlePrint = () => {
    if (!qrCodeDataUrl) return;
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>打印二维码 - ${generatedCode}</title>
            <style>
              body { 
                display: flex; 
                flex-direction: column; 
                align-items: center; 
                justify-content: center; 
                height: 100vh; 
                margin: 0;
                font-family: Arial, sans-serif;
              }
              img { width: 200px; height: 200px; }
              .code { margin-top: 20px; font-size: 18px; font-weight: bold; }
              .product { font-size: 14px; color: #666; }
            </style>
          </head>
          <body>
            <img src="${qrCodeDataUrl}" />
            <div class="code">${generatedCode}</div>
            <div class="product">${productName}</div>
            <script>window.print(); window.close();</script>
          </body>
        </html>
      `);
    }
  };

  const filteredRecords = records.filter(r => 
    r.blockchainCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.productName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="p-4 lg:p-8">
          <div className="max-w-7xl mx-auto">
            <div className="mb-8">
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">
                区块链码生成二维码
              </h1>
              <p className="text-gray-500 mt-1">
                为区块链产品码生成可扫描的二维码
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* 生成二维码 */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <QrCode className="h-5 w-5 text-purple-600" />
                    生成二维码
                  </CardTitle>
                  <CardDescription>
                    输入区块链码生成对应的二维码
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>区块链码</Label>
                    <Input
                      placeholder="例如：BC00001001"
                      value={blockchainCode}
                      onChange={(e) => setBlockchainCode(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>产品名称（可选）</Label>
                    <Input
                      placeholder="输入产品名称"
                      value={productName}
                      onChange={(e) => setProductName(e.target.value)}
                    />
                  </div>
                  <Button 
                    className="w-full bg-purple-600 hover:bg-purple-700"
                    onClick={handleGenerate}
                    disabled={generating || !blockchainCode}
                  >
                    {generating ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        生成中...
                      </>
                    ) : (
                      <>
                        <QrCode className="h-4 w-4 mr-2" />
                        生成二维码
                      </>
                    )}
                  </Button>

                  {/* 生成的二维码预览 */}
                  {qrCodeDataUrl && (
                    <div className="mt-6 p-4 border rounded-lg bg-white">
                      <div className="flex justify-center mb-4">
                        <div 
                          className="relative"
                          style={{ 
                            transform: `scale(${zoom}) rotate(${rotation}deg)`,
                            transition: 'transform 0.3s ease'
                          }}
                        >
                          <img 
                            src={qrCodeDataUrl} 
                            alt="Generated QR Code"
                            className="w-48 h-48"
                          />
                        </div>
                      </div>
                      <div className="text-center mb-4">
                        <p className="font-mono font-bold">{generatedCode}</p>
                        {productName && (
                          <p className="text-sm text-gray-500">{productName}</p>
                        )}
                      </div>
                      
                      {/* 调整工具 */}
                      <div className="flex justify-center gap-2 mb-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setZoom(z => Math.max(0.5, z - 0.1))}
                        >
                          <ZoomOut className="h-4 w-4" />
                        </Button>
                        <span className="flex items-center px-2 text-sm">
                          {Math.round(zoom * 100)}%
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setZoom(z => Math.min(2, z + 0.1))}
                        >
                          <ZoomIn className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setRotation(r => (r + 90) % 360)}
                        >
                          <RotateCw className="h-4 w-4" />
                        </Button>
                      </div>

                      {/* 操作按钮 */}
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          className="flex-1"
                          onClick={() => handleDownload('png')}
                        >
                          <Download className="h-4 w-4 mr-2" />
                          下载PNG
                        </Button>
                        <Button
                          variant="outline"
                          className="flex-1"
                          onClick={() => handleDownload('svg')}
                        >
                          <Download className="h-4 w-4 mr-2" />
                          下载SVG
                        </Button>
                        <Button
                          variant="outline"
                          className="flex-1"
                          onClick={handlePrint}
                        >
                          <Printer className="h-4 w-4 mr-2" />
                          打印
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* 历史记录 */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Hash className="h-5 w-5 text-purple-600" />
                    生成历史
                  </CardTitle>
                  <CardDescription>
                    之前生成的二维码记录
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* 搜索 */}
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="搜索区块链码或产品名称..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>

                  {/* 记录列表 */}
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {filteredRecords.map((record) => (
                      <div
                        key={record.id}
                        className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-gray-100 rounded flex items-center justify-center">
                            <QrCode className="h-6 w-6 text-gray-400" />
                          </div>
                          <div>
                            <p className="font-mono font-medium">{record.blockchainCode}</p>
                            <p className="text-xs text-gray-500">{record.productName}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="text-right mr-2">
                            <p className="text-xs text-gray-500">{record.createdAt}</p>
                            <p className="text-xs text-purple-600">{record.scanned}次扫描</p>
                          </div>
                          <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
                            <DialogTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <ExternalLink className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>二维码预览</DialogTitle>
                              </DialogHeader>
                              <div className="flex flex-col items-center py-4">
                                <img 
                                  src={record.qrCodeDataUrl || qrCodeDataUrl} 
                                  alt="QR Code"
                                  className="w-64 h-64"
                                />
                                <p className="mt-4 font-mono font-bold">{record.blockchainCode}</p>
                                <p className="text-sm text-gray-500">{record.productName}</p>
                              </div>
                            </DialogContent>
                          </Dialog>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => navigator.clipboard.writeText(record.blockchainCode)}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                    {filteredRecords.length === 0 && (
                      <div className="text-center py-8 text-gray-500">
                        暂无生成记录
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* 使用说明 */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>使用说明</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-blue-600 font-bold">1</span>
                      </div>
                      <h3 className="font-semibold">输入区块链码</h3>
                    </div>
                    <p className="text-sm text-gray-600">
                      在左侧输入您要生成二维码的区块链码
                    </p>
                  </div>
                  <div className="p-4 bg-green-50 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                        <span className="text-green-600 font-bold">2</span>
                      </div>
                      <h3 className="font-semibold">生成并下载</h3>
                    </div>
                    <p className="text-sm text-gray-600">
                      点击生成按钮，支持PNG和SVG格式下载
                    </p>
                  </div>
                  <div className="p-4 bg-purple-50 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                        <span className="text-purple-600 font-bold">3</span>
                      </div>
                      <h3 className="font-semibold">打印使用</h3>
                    </div>
                    <p className="text-sm text-gray-600">
                      可直接打印或导出用于产品包装
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}
