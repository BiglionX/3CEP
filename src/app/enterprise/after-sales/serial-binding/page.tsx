'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import {
  QrCode,
  Link,
  Upload,
  Download,
  Search,
  CheckCircle,
  RefreshCw,
  Loader2,
  FileSpreadsheet,
} from 'lucide-react';

interface QrCode {
  id: string;
  batch_id: string;
  product_id: string;
  internal_code: string;
  serial_number: string | null;
  is_active: boolean;
  scanned_count: number;
  created_at: string;
}

export default function SerialBindingPage() {
  const [loading, setLoading] = useState(true);
  const [codes, setCodes] = useState<QrCode[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [bindDialogOpen, setBindDialogOpen] = useState(false);
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [selectedCode, setSelectedCode] = useState<QrCode | null>(null);
  const [serialNumber, setSerialNumber] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [importData, setImportData] = useState('');

  const fetchCodes = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/enterprise/traceability/purchase?type=codes');
      const data = await res.json();
      if (data.success) {
        setCodes(data.codes);
      }
    } catch (error) {
      console.error('Failed to fetch codes:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCodes();
  }, []);

  const handleBind = async () => {
    if (!selectedCode || !serialNumber) return;

    setSubmitting(true);
    try {
      const res = await fetch('/api/enterprise/traceability/bind', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          qrCodeId: selectedCode.id,
          serialNumber: serialNumber
        })
      });

      const data = await res.json();
      if (data.success) {
        alert('绑定成功！');
        setBindDialogOpen(false);
        setSerialNumber('');
        setSelectedCode(null);
        fetchCodes();
      } else {
        alert(data.error || '绑定失败');
      }
    } catch (error) {
      console.error('Bind error:', error);
      alert('绑定失败');
    } finally {
      setSubmitting(false);
    }
  };

  const handleImport = async () => {
    if (!importData.trim()) {
      alert('请输入导入数据');
      return;
    }

    setSubmitting(true);
    try {
      // 解析CSV数据
      const lines = importData.trim().split('\n');
      const mappings = [];

      for (const line of lines) {
        const [qrCodeId, serialNumber] = line.split(',').map(s => s.trim());
        if (qrCodeId && serialNumber) {
          mappings.push({ qrCodeId, serialNumber });
        }
      }

      if (mappings.length === 0) {
        alert('数据格式错误，请使用: qrCodeId,serialNumber 格式');
        return;
      }

      const res = await fetch('/api/enterprise/traceability/bind', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mappings })
      });

      const data = await res.json();
      if (data.success) {
        alert(`导入成功！成功: ${data.summary.success}, 失败: ${data.summary.failed}`);
        setImportDialogOpen(false);
        setImportData('');
        fetchCodes();
      } else {
        alert(data.error || '导入失败');
      }
    } catch (error) {
      console.error('Import error:', error);
      alert('导入失败');
    } finally {
      setSubmitting(false);
    }
  };

  const handleExport = async () => {
    try {
      const res = await fetch('/api/enterprise/traceability/export');
      if (res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `序列号绑定_${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error('Export error:', error);
    }
  };

  const openBindDialog = (code: QrCode) => {
    setSelectedCode(code);
    setSerialNumber(code.serial_number || '');
    setBindDialogOpen(true);
  };

  const filteredCodes = codes.filter(code => {
    const search = searchTerm.toLowerCase();
    return (
      code.product_id?.toLowerCase().includes(search) ||
      code.serial_number?.toLowerCase().includes(search) ||
      code.internal_code?.toLowerCase().includes(search) ||
      code.batch_id?.toLowerCase().includes(search)
    );
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 头部 */}
      <div className="bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center">
                <Link className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">序列号绑定</h1>
                <p className="text-sm text-gray-500">绑定企业内部序列号与溯源码对应关系</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleExport}>
                <Download className="h-4 w-4 mr-2" />
                导出
              </Button>
              <Button variant="outline" onClick={() => setImportDialogOpen(true)}>
                <Upload className="h-4 w-4 mr-2" />
                批量导入
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* 搜索栏 */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="搜索产品ID、序列号、内部编码、批次ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button variant="outline" onClick={fetchCodes}>
                <RefreshCw className="h-4 w-4 mr-2" />
                刷新
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* 统计 */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="text-sm">总溯源码</CardDescription>
            </CardHeader>
            <CardContent>
              <span className="text-2xl font-bold">{codes.length}</span>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="text-sm">已绑定序列号</CardDescription>
            </CardHeader>
            <CardContent>
              <span className="text-2xl font-bold text-green-600">
                {codes.filter(c => c.serial_number).length}
              </span>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="text-sm">未绑定序列号</CardDescription>
            </CardHeader>
            <CardContent>
              <span className="text-2xl font-bold text-orange-600">
                {codes.filter(c => !c.serial_number).length}
              </span>
            </CardContent>
          </Card>
        </div>

        {/* 溯源码列表 */}
        <Card>
          <CardHeader>
            <CardTitle>溯源码列表</CardTitle>
            <CardDescription>点击操作列可绑定或修改序列号</CardDescription>
          </CardHeader>
          <CardContent>
            {filteredCodes.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <QrCode className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>暂无数据</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>产品ID</TableHead>
                    <TableHead>企业内部编码</TableHead>
                    <TableHead>序列号</TableHead>
                    <TableHead>批次ID</TableHead>
                    <TableHead>扫描次数</TableHead>
                    <TableHead>状态</TableHead>
                    <TableHead>操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCodes.map((code) => (
                    <TableRow key={code.id}>
                      <TableCell className="font-mono text-sm">{code.product_id}</TableCell>
                      <TableCell>{code.internal_code}</TableCell>
                      <TableCell>
                        {code.serial_number ? (
                          <Badge className="bg-green-100 text-green-700">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            {code.serial_number}
                          </Badge>
                        ) : (
                          <Badge variant="outline">未绑定</Badge>
                        )}
                      </TableCell>
                      <TableCell className="font-mono text-xs text-gray-500">
                        {code.batch_id}
                      </TableCell>
                      <TableCell>{code.scanned_count}</TableCell>
                      <TableCell>
                        {code.is_active ? (
                          <Badge className="bg-green-100 text-green-700">激活</Badge>
                        ) : (
                          <Badge variant="destructive">停用</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openBindDialog(code)}
                        >
                          <Link className="h-3 w-3 mr-1" />
                          {code.serial_number ? '修改' : '绑定'}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      {/* 绑定对话框 */}
      <Dialog open={bindDialogOpen} onOpenChange={setBindDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>绑定序列号</DialogTitle>
            <DialogDescription>
              为溯源码 {selectedCode?.product_id} 绑定企业内部序列号
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>溯源码ID</Label>
              <Input value={selectedCode?.product_id || ''} disabled />
            </div>
            <div className="space-y-2">
              <Label>企业内部编码</Label>
              <Input value={selectedCode?.internal_code || ''} disabled />
            </div>
            <div className="space-y-2">
              <Label>序列号 *</Label>
              <Input
                value={serialNumber}
                onChange={(e) => setSerialNumber(e.target.value)}
                placeholder="请输入企业内部序列号"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBindDialogOpen(false)}>取消</Button>
            <Button onClick={handleBind} disabled={submitting}>
              {submitting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
              确认绑定
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 批量导入对话框 */}
      <Dialog open={importDialogOpen} onOpenChange={setImportDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>批量导入序列号</DialogTitle>
            <DialogDescription>
              导入CSV格式数据，格式：qrCodeId,serialNumber（每行一条）
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>导入数据</Label>
              <textarea
                className="w-full h-48 p-3 border rounded-md font-mono text-sm"
                value={importData}
                onChange={(e) => setImportData(e.target.value)}
                placeholder="qrCodeId1,SN001
qrCodeId2,SN002
qrCodeId3,SN003"
              />
            </div>
            <div className="text-sm text-gray-500">
              <FileSpreadsheet className="h-4 w-4 inline mr-1" />
              提示：首行为表头时请删除，格式应为：qrCodeId,serialNumber
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setImportDialogOpen(false)}>取消</Button>
            <Button onClick={handleImport} disabled={submitting}>
              {submitting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
              开始导入
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
