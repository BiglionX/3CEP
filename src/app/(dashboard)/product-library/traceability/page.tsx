'use client';

import {
  createTraceabilityCodes,
  deleteTraceabilityCode,
  getCompleteProducts,
  getTraceabilityCodes,
  TraceabilityCode,
  updateTraceabilityCodeStatus,
} from '@/lib/api/product-library';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Download as DownloadIcon,
  QrCode as QrCodeIcon,
} from '@mui/icons-material';
import {
  Box,
  Button,
  Chip,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import { useEffect, useState } from 'react';

export default function TraceabilityPage() {
  // 状态管理
  const [codes, setCodes] = useState<TraceabilityCode[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(0);
  const [limit, setLimit] = useState(20);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [codeTypeFilter, setCodeTypeFilter] = useState('');
  const [loading, setLoading] = useState(false);

  // 对话框状态
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    product_library_id: '',
    sku: '',
    product_name: '',
    quantity: 10,
    code_type: 'qr' as 'qr' | 'rfid' | 'nfc',
  });

  // 加载产品列表
  useEffect(() => {
    loadProducts();
  }, []);

  // 加载溯源码列表
  useEffect(() => {
    loadCodes();
  }, [page, limit, search, statusFilter, codeTypeFilter]);

  const loadProducts = async () => {
    try {
      const result = await getCompleteProducts({ limit: 100 });
      setProducts(result.data);
    } catch (error) {
      console.error('加载产品失败:', error);
    }
  };

  const loadCodes = async () => {
    setLoading(true);
    try {
      const result = await getTraceabilityCodes({
        page,
        limit,
        search,
        status: statusFilter || undefined,
        code_type: codeTypeFilter || undefined,
      });
      setCodes(result.data);
      setTotalCount(result.count);
    } catch (error) {
      console.error('加载溯源码失败:', error);
    } finally {
      setLoading(false);
    }
  };

  // 打开创建对话框
  const handleOpenDialog = () => {
    setFormData({
      product_library_id: '',
      sku: '',
      product_name: '',
      quantity: 10,
      code_type: 'qr',
    });
    setDialogOpen(true);
  };

  // 关闭对话框
  const handleCloseDialog = () => {
    setDialogOpen(false);
  };

  // 选择产品时自动填充SKU和名称
  const handleProductChange = (productId: string) => {
    const product = products.find(p => p.id === productId);
    if (product) {
      setFormData({
        ...formData,
        product_library_id: productId,
        sku: product.sku_code,
        product_name: product.name,
      });
    }
  };

  // 生成溯源码
  const handleGenerate = async () => {
    if (!formData.sku || !formData.product_name || formData.quantity <= 0) {
      alert('请填写完整信息');
      return;
    }

    try {
      const result = await createTraceabilityCodes(formData);
      alert(`成功生成 ${result.count} 个溯源码`);
      handleCloseDialog();
      loadCodes();
    } catch (error: any) {
      alert(`生成失败: ${error.message}`);
    }
  };

  // 更新状态
  const _handleStatusChange = async (
    id: string,
    status: 'active' | 'inactive' | 'expired'
  ) => {
    try {
      await updateTraceabilityCodeStatus(id, status);
      loadCodes();
    } catch (error: any) {
      alert(`更新失败: ${error.message}`);
    }
  };

  // 删除溯源码
  const handleDelete = async (id: string) => {
    if (!confirm('确定要删除这个溯源码吗？')) return;

    try {
      await deleteTraceabilityCode(id);
      loadCodes();
    } catch (error: any) {
      alert(`删除失败: ${error.message}`);
    }
  };

  // 分页变化
  const handleChangePage = (_: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setLimit(parseInt(event.target.value, 10));
    setPage(0);
  };

  // 获取状态标签颜色
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'inactive':
        return 'warning';
      case 'expired':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return '激活';
      case 'inactive':
        return '未激活';
      case 'expired':
        return '已过期';
      default:
        return status;
    }
  };

  const getCodeTypeText = (type: string) => {
    switch (type) {
      case 'qr':
        return '二维码';
      case 'rfid':
        return 'RFID';
      case 'nfc':
        return 'NFC';
      default:
        return type;
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* 页面标题 */}
      <Box
        sx={{
          mb: 3,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Typography variant="h4" component="h1">
          溯源码管理
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleOpenDialog}
        >
          生成溯源码
        </Button>
      </Box>

      {/* 筛选器 */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <TextField
            label="搜索"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="溯源码、SKU或产品名称"
            size="small"
            sx={{ minWidth: 200 }}
          />
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>状态</InputLabel>
            <Select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              label="状态"
            >
              <MenuItem value="">全部</MenuItem>
              <MenuItem value="active">激活</MenuItem>
              <MenuItem value="inactive">未激活</MenuItem>
              <MenuItem value="expired">已过期</MenuItem>
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>码类型</InputLabel>
            <Select
              value={codeTypeFilter}
              onChange={e => setCodeTypeFilter(e.target.value)}
              label="码类型"
            >
              <MenuItem value="">全部</MenuItem>
              <MenuItem value="qr">二维码</MenuItem>
              <MenuItem value="rfid">RFID</MenuItem>
              <MenuItem value="nfc">NFC</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Paper>

      {/* 溯源码表格 */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>溯源码</TableCell>
              <TableCell>SKU</TableCell>
              <TableCell>产品名称</TableCell>
              <TableCell>码类型</TableCell>
              <TableCell>状态</TableCell>
              <TableCell>生成时间</TableCell>
              <TableCell align="right">操作</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {codes.map(code => (
              <TableRow key={code.id}>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <QrCodeIcon fontSize="small" color="action" />
                    <Typography
                      variant="body2"
                      sx={{ fontFamily: 'monospace' }}
                    >
                      {code.code.substring(0, 20)}...
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell>{code.sku}</TableCell>
                <TableCell>{code.product_name}</TableCell>
                <TableCell>{getCodeTypeText(code.code_type)}</TableCell>
                <TableCell>
                  <Chip
                    label={getStatusText(code.status)}
                    color={getStatusColor(code.status) as any}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  {new Date(code.created_at).toLocaleDateString('zh-CN')}
                </TableCell>
                <TableCell align="right">
                  <IconButton size="small" title="下载二维码">
                    <DownloadIcon />
                  </IconButton>
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => handleDelete(code.id)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
            {codes.length === 0 && !loading && (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  暂无数据
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        <TablePagination
          rowsPerPageOptions={[10, 20, 50]}
          component="div"
          count={totalCount}
          rowsPerPage={limit}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="每页条数"
          labelDisplayedRows={({ from, to, count }) =>
            `${from}-${to} / ${count !== -1 ? count : `超过 ${to}`}`
          }
        />
      </TableContainer>

      {/* 生成溯源码对话框 */}
      <Dialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>批量生成溯源码</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <FormControl fullWidth>
              <InputLabel>选择产品（可选）</InputLabel>
              <Select
                value={formData.product_library_id}
                onChange={e => handleProductChange(e.target.value)}
                label="选择产品（可选）"
              >
                <MenuItem value="">手动输入</MenuItem>
                {products.map(product => (
                  <MenuItem key={product.id} value={product.id}>
                    {product.name} ({product.sku_code})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              label="SKU编码"
              value={formData.sku}
              onChange={e => setFormData({ ...formData, sku: e.target.value })}
              required
              fullWidth
            />
            <TextField
              label="产品名称"
              value={formData.product_name}
              onChange={e =>
                setFormData({ ...formData, product_name: e.target.value })
              }
              required
              fullWidth
            />
            <TextField
              label="生成数量"
              type="number"
              value={formData.quantity}
              onChange={e =>
                setFormData({
                  ...formData,
                  quantity: parseInt(e.target.value) || 0,
                })
              }
              inputProps={{ min: 1, max: 1000 }}
              required
              fullWidth
            />
            <FormControl fullWidth>
              <InputLabel>码类型</InputLabel>
              <Select
                value={formData.code_type}
                onChange={e =>
                  setFormData({ ...formData, code_type: e.target.value as any })
                }
                label="码类型"
              >
                <MenuItem value="qr">二维码</MenuItem>
                <MenuItem value="rfid">RFID</MenuItem>
                <MenuItem value="nfc">NFC</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>取消</Button>
          <Button onClick={handleGenerate} variant="contained">
            生成
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
