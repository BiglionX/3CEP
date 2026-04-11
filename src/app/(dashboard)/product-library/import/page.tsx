'use client';

import {
  Description as CsvIcon,
  TableChart as ExcelIcon,
  CloudUpload as UploadIcon,
} from '@mui/icons-material';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Container,
  FormControl,
  InputLabel,
  LinearProgress,
  MenuItem,
  Paper,
  Select,
  Step,
  StepLabel,
  Stepper,
  Typography,
} from '@mui/material';
import { useState } from 'react';

type ImportType = 'csv' | 'excel';
type ImportStatus = 'idle' | 'uploading' | 'processing' | 'success' | 'error';

interface ImportResult {
  success: boolean;
  totalRows: number;
  successCount: number;
  errorCount: number;
  errors?: Array<{ row: number; message: string }>;
  message?: string;
}

export default function ImportPage() {
  const [activeStep, setActiveStep] = useState(0);
  const [importType, setImportType] = useState<ImportType>('csv');
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<ImportStatus>('idle');
  const [result, setResult] = useState<ImportResult | null>(null);
  const [errorMessage, setErrorMessage] = useState('');

  const steps = ['选择导入类型', '上传文件', '预览数据', '确认导入'];

  // 处理文件选择
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      // 验证文件类型
      if (importType === 'csv' && !selectedFile.name.endsWith('.csv')) {
        alert('请选择CSV文件');
        return;
      }
      if (importType === 'excel' && !selectedFile.name.match(/\.(xlsx|xls)$/)) {
        alert('请选择Excel文件（.xlsx或.xls）');
        return;
      }
      setFile(selectedFile);
      setActiveStep(2); // 跳到预览步骤
    }
  };

  // 上传并导入
  const handleImport = async () => {
    if (!file) {
      alert('请先选择文件');
      return;
    }

    setStatus('uploading');
    setActiveStep(3);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const endpoint =
        importType === 'csv'
          ? '/api/product-library/import/csv'
          : '/api/product-library/import/excel';

      const response = await fetch(endpoint, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || '导入失败');
      }

      const data = await response.json();
      setResult(data);
      setStatus('success');
    } catch (error: any) {
      console.error('导入失败:', error);
      setErrorMessage(error.message);
      setStatus('error');
    }
  };

  // 重置
  const handleReset = () => {
    setActiveStep(0);
    setImportType('csv');
    setFile(null);
    setStatus('idle');
    setResult(null);
    setErrorMessage('');
  };

  // 下载模板
  const downloadTemplate = (type: ImportType) => {
    // 这里应该提供实际的模板下载
    alert(`下载${type === 'csv' ? 'CSV' : 'Excel'}模板功能待实现`);
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* 页面标题 */}
      <Typography variant="h4" component="h1" gutterBottom>
        数据导入
      </Typography>
      <Typography variant="body1" color="text.secondary" paragraph>
        从CSV或Excel文件批量导入产品数据到产品库
      </Typography>

      {/* 步骤条 */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Stepper activeStep={activeStep} alternativeLabel>
          {steps.map(label => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
      </Paper>

      {/* 步骤1：选择导入类型 */}
      {activeStep === 0 && (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              选择导入类型
            </Typography>
            <FormControl fullWidth sx={{ mb: 3 }}>
              <InputLabel>文件格式</InputLabel>
              <Select
                value={importType}
                onChange={e => setImportType(e.target.value as ImportType)}
                label="文件格式"
              >
                <MenuItem value="csv">
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CsvIcon />
                    CSV文件
                  </Box>
                </MenuItem>
                <MenuItem value="excel">
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <ExcelIcon />
                    Excel文件（.xlsx/.xls）
                  </Box>
                </MenuItem>
              </Select>
            </FormControl>

            <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
              <Button
                variant="outlined"
                startIcon={<CsvIcon />}
                onClick={() => downloadTemplate('csv')}
              >
                下载CSV模板
              </Button>
              <Button
                variant="outlined"
                startIcon={<ExcelIcon />}
                onClick={() => downloadTemplate('excel')}
              >
                下载Excel模板
              </Button>
            </Box>

            <Button
              variant="contained"
              onClick={() => setActiveStep(1)}
              fullWidth
            >
              下一步
            </Button>
          </CardContent>
        </Card>
      )}

      {/* 步骤2：上传文件 */}
      {activeStep === 1 && (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              上传{importType === 'csv' ? 'CSV' : 'Excel'}文件
            </Typography>

            <Box
              sx={{
                border: '2px dashed',
                borderColor: 'divider',
                borderRadius: 2,
                p: 4,
                textAlign: 'center',
                mb: 3,
              }}
            >
              <input
                accept={importType === 'csv' ? '.csv' : '.xlsx,.xls'}
                style={{ display: 'none' }}
                id="raised-button-file"
                type="file"
                onChange={handleFileSelect}
              />
              <label htmlFor="raised-button-file">
                <Button
                  variant="contained"
                  component="span"
                  startIcon={<UploadIcon />}
                  size="large"
                >
                  选择文件
                </Button>
              </label>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                或将文件拖放到此处
              </Typography>
              <Typography variant="caption" color="text.secondary">
                支持的文件格式：
                {importType === 'csv' ? ' .csv' : ' .xlsx, .xls'}
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button onClick={() => setActiveStep(0)}>上一步</Button>
            </Box>
          </CardContent>
        </Card>
      )}

      {/* 步骤3：预览数据 */}
      {activeStep === 2 && file && (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              预览数据
            </Typography>

            <Alert severity="info" sx={{ mb: 3 }}>
              <Typography variant="body2">
                <strong>文件名：</strong>
                {file.name}
              </Typography>
              <Typography variant="body2">
                <strong>文件大小：</strong>
                {(file.size / 1024).toFixed(2)} KB
              </Typography>
            </Alert>

            <Alert severity="warning" sx={{ mb: 3 }}>
              <Typography variant="body2">
                请确保文件格式正确，包含必要的列：
              </Typography>
              <Typography variant="body2" component="ul" sx={{ pl: 2 }}>
                <li>SKU编码（必填）</li>
                <li>产品名称（必填）</li>
                <li>品牌ID（可选）</li>
                <li>描述（可选）</li>
              </Typography>
            </Alert>

            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button onClick={() => setActiveStep(1)}>上一步</Button>
              <Button
                variant="contained"
                onClick={handleImport}
                disabled={status === 'uploading' || status === 'processing'}
              >
                {status === 'uploading' || status === 'processing'
                  ? '处理中...'
                  : '确认导入'}
              </Button>
            </Box>
          </CardContent>
        </Card>
      )}

      {/* 步骤4：导入结果 */}
      {activeStep === 3 && (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              导入结果
            </Typography>

            {status === 'uploading' || status === 'processing' ? (
              <Box sx={{ width: '100%', mb: 3 }}>
                <LinearProgress />
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mt: 1 }}
                >
                  正在处理文件，请稍候...
                </Typography>
              </Box>
            ) : status === 'success' && result ? (
              <Box>
                <Alert severity="success" sx={{ mb: 3 }}>
                  <Typography variant="body1" fontWeight="bold">
                    导入完成！
                  </Typography>
                  <Typography variant="body2">
                    共处理 {result.totalRows} 条记录，成功 {result.successCount}{' '}
                    条， 失败 {result.errorCount} 条
                  </Typography>
                </Alert>

                {result.errors && result.errors.length > 0 && (
                  <Box sx={{ mt: 3 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      错误详情：
                    </Typography>
                    <Paper
                      variant="outlined"
                      sx={{ maxHeight: 300, overflow: 'auto', p: 2 }}
                    >
                      {result.errors.map((error, index) => (
                        <Typography
                          key={index}
                          variant="body2"
                          color="error"
                          sx={{ mb: 1 }}
                        >
                          第 {error.row} 行：{error.message}
                        </Typography>
                      ))}
                    </Paper>
                  </Box>
                )}
              </Box>
            ) : status === 'error' ? (
              <Alert severity="error" sx={{ mb: 3 }}>
                <Typography variant="body1" fontWeight="bold">
                  导入失败
                </Typography>
                <Typography variant="body2">{errorMessage}</Typography>
              </Alert>
            ) : null}

            <Button variant="contained" onClick={handleReset}>
              返回重新开始
            </Button>
          </CardContent>
        </Card>
      )}

      {/* 导入说明 */}
      <Paper sx={{ p: 3, mt: 3 }}>
        <Typography variant="h6" gutterBottom>
          导入说明
        </Typography>
        <Typography variant="body2" paragraph>
          <strong>CSV格式要求：</strong>
        </Typography>
        <Typography variant="body2" component="ul" sx={{ pl: 2, mb: 2 }}>
          <li>第一行为表头</li>
          <li>使用UTF-8编码</li>
          <li>字段之间用逗号分隔</li>
          <li>特殊字符需要用双引号包裹</li>
        </Typography>

        <Typography variant="body2" paragraph>
          <strong>Excel格式要求：</strong>
        </Typography>
        <Typography variant="body2" component="ul" sx={{ pl: 2, mb: 2 }}>
          <li>第一个Sheet为数据</li>
          <li>第一行为表头</li>
          <li>支持.xlsx和.xls格式</li>
        </Typography>

        <Typography variant="body2" paragraph>
          <strong>必填字段：</strong>
        </Typography>
        <Typography variant="body2" component="ul" sx={{ pl: 2 }}>
          <li>sku_code - SKU编码（唯一）</li>
          <li>name - 产品名称</li>
        </Typography>
      </Paper>
    </Container>
  );
}
