'use client';

import {
  CompleteProduct,
  createCompleteProduct,
  deleteCompleteProduct,
  getBrands,
  getCompleteProducts,
  updateCompleteProduct,
} from '@/lib/api/product-library';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
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

export default function ProductsPage() {
  // 状态管理
  const [products, setProducts] = useState<CompleteProduct[]>([]);
  const [brands, setBrands] = useState<any[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(0);
  const [limit, setLimit] = useState(20);
  const [search, setSearch] = useState('');
  const [brandFilter, setBrandFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(false);

  // 对话框状态
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<CompleteProduct | null>(
    null
  );
  const [formData, setFormData] = useState({
    sku_code: '',
    brand_id: '',
    name: '',
    description: '',
    status: 'draft' as 'draft' | 'published' | 'deprecated',
    data_source: 'official' as 'official' | 'imported' | 'user_contributed',
  });

  // 加载品牌列表
  useEffect(() => {
    loadBrands();
  }, []);

  // 加载产品列表
  useEffect(() => {
    loadProducts();
  }, [page, limit, search, brandFilter, statusFilter]);

  const loadBrands = async () => {
    try {
      const result = await getBrands({ limit: 100 });
      setBrands(result.data);
    } catch (error) {
      console.error('加载品牌失败:', error);
    }
  };

  const loadProducts = async () => {
    setLoading(true);
    try {
      const result = await getCompleteProducts({
        page,
        limit,
        search,
        brand_id: brandFilter || undefined,
        status: statusFilter || undefined,
      });
      setProducts(result.data);
      setTotalCount(result.count);
    } catch (error) {
      console.error('加载产品失败:', error);
    } finally {
      setLoading(false);
    }
  };

  // 打开创建/编辑对话框
  const handleOpenDialog = (product?: CompleteProduct) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        sku_code: product.sku_code,
        brand_id: product.brand_id,
        name: product.name,
        description: product.description || '',
        status: product.status,
        data_source: product.data_source,
      });
    } else {
      setEditingProduct(null);
      setFormData({
        sku_code: '',
        brand_id: '',
        name: '',
        description: '',
        status: 'draft',
        data_source: 'official',
      });
    }
    setDialogOpen(true);
  };

  // 关闭对话框
  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingProduct(null);
  };

  // 保存产品
  const handleSave = async () => {
    try {
      if (editingProduct) {
        await updateCompleteProduct(editingProduct.id, formData);
      } else {
        await createCompleteProduct(formData as any);
      }
      handleCloseDialog();
      loadProducts();
    } catch (error: any) {
      alert(`保存失败: ${error.message}`);
    }
  };

  // 删除产品
  const handleDelete = async (id: string) => {
    if (!confirm('确定要删除这个产品吗？')) return;

    try {
      await deleteCompleteProduct(id);
      loadProducts();
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
      case 'published':
        return 'success';
      case 'draft':
        return 'warning';
      case 'deprecated':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'published':
        return '已发布';
      case 'draft':
        return '草稿';
      case 'deprecated':
        return '已弃用';
      default:
        return status;
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
          整机产品管理
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          新建产品
        </Button>
      </Box>

      {/* 筛选器 */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <TextField
            label="搜索"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="产品名称或SKU"
            size="small"
            sx={{ minWidth: 200 }}
          />
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>品牌</InputLabel>
            <Select
              value={brandFilter}
              onChange={e => setBrandFilter(e.target.value)}
              label="品牌"
            >
              <MenuItem value="">全部</MenuItem>
              {brands.map(brand => (
                <MenuItem key={brand.id} value={brand.id}>
                  {brand.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>状态</InputLabel>
            <Select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              label="状态"
            >
              <MenuItem value="">全部</MenuItem>
              <MenuItem value="draft">草稿</MenuItem>
              <MenuItem value="published">已发布</MenuItem>
              <MenuItem value="deprecated">已弃用</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Paper>

      {/* 产品表格 */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>SKU</TableCell>
              <TableCell>产品名称</TableCell>
              <TableCell>品牌</TableCell>
              <TableCell>状态</TableCell>
              <TableCell>数据来源</TableCell>
              <TableCell>版本</TableCell>
              <TableCell align="right">操作</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {products.map(product => (
              <TableRow key={product.id}>
                <TableCell>{product.sku_code}</TableCell>
                <TableCell>{product.name}</TableCell>
                <TableCell>{product.brand?.name || '-'}</TableCell>
                <TableCell>
                  <Chip
                    label={getStatusText(product.status)}
                    color={getStatusColor(product.status) as any}
                    size="small"
                  />
                </TableCell>
                <TableCell>{product.data_source}</TableCell>
                <TableCell>v{product.version}</TableCell>
                <TableCell align="right">
                  <IconButton
                    size="small"
                    onClick={() => handleOpenDialog(product)}
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => handleDelete(product.id)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
            {products.length === 0 && !loading && (
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

      {/* 创建/编辑对话框 */}
      <Dialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>{editingProduct ? '编辑产品' : '新建产品'}</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="SKU编码"
              value={formData.sku_code}
              onChange={e =>
                setFormData({ ...formData, sku_code: e.target.value })
              }
              required
              fullWidth
            />
            <FormControl fullWidth required>
              <InputLabel>品牌</InputLabel>
              <Select
                value={formData.brand_id}
                onChange={e =>
                  setFormData({ ...formData, brand_id: e.target.value })
                }
                label="品牌"
              >
                {brands.map(brand => (
                  <MenuItem key={brand.id} value={brand.id}>
                    {brand.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              label="产品名称"
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              required
              fullWidth
            />
            <TextField
              label="描述"
              value={formData.description}
              onChange={e =>
                setFormData({ ...formData, description: e.target.value })
              }
              multiline
              rows={3}
              fullWidth
            />
            <FormControl fullWidth>
              <InputLabel>状态</InputLabel>
              <Select
                value={formData.status}
                onChange={e =>
                  setFormData({
                    ...formData,
                    status: e.target.value as any,
                  })
                }
                label="状态"
              >
                <MenuItem value="draft">草稿</MenuItem>
                <MenuItem value="published">已发布</MenuItem>
                <MenuItem value="deprecated">已弃用</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>取消</Button>
          <Button onClick={handleSave} variant="contained">
            保存
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
