'use client';

import {
  Accessory,
  createAccessory,
  deleteAccessory,
  getAccessories,
  getBrands,
  updateAccessory,
} from '@/lib/api/product-library';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
} from '@mui/icons-material';
import {
  Box,
  Button,
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

export default function AccessoriesPage() {
  // 状态管理
  const [accessories, setAccessories] = useState<Accessory[]>([]);
  const [brands, setBrands] = useState<any[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(0);
  const [limit, setLimit] = useState(20);
  const [search, setSearch] = useState('');
  const [brandFilter, setBrandFilter] = useState('');
  const [loading, setLoading] = useState(false);

  // 对话框状态
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingAccessory, setEditingAccessory] = useState<Accessory | null>(
    null
  );
  const [formData, setFormData] = useState({
    sku_code: '',
    brand_id: '',
    name: '',
    description: '',
  });

  // 加载品牌列表
  useEffect(() => {
    loadBrands();
  }, []);

  // 加载配件列表
  useEffect(() => {
    loadAccessories();
  }, [page, limit, search, brandFilter]);

  const loadBrands = async () => {
    try {
      const result = await getBrands({ limit: 100 });
      setBrands(result.data);
    } catch (error) {
      console.error('加载品牌失败:', error);
    }
  };

  const loadAccessories = async () => {
    setLoading(true);
    try {
      const result = await getAccessories({
        page,
        limit,
        search,
        brand_id: brandFilter || undefined,
      });
      setAccessories(result.data);
      setTotalCount(result.count);
    } catch (error) {
      console.error('加载配件失败:', error);
    } finally {
      setLoading(false);
    }
  };

  // 打开创建/编辑对话框
  const handleOpenDialog = (accessory?: Accessory) => {
    if (accessory) {
      setEditingAccessory(accessory);
      setFormData({
        sku_code: accessory.sku_code,
        brand_id: accessory.brand_id,
        name: accessory.name,
        description: accessory.description || '',
      });
    } else {
      setEditingAccessory(null);
      setFormData({
        sku_code: '',
        brand_id: '',
        name: '',
        description: '',
      });
    }
    setDialogOpen(true);
  };

  // 关闭对话框
  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingAccessory(null);
  };

  // 保存配件
  const handleSave = async () => {
    try {
      if (editingAccessory) {
        await updateAccessory(editingAccessory.id, formData);
      } else {
        await createAccessory(formData as any);
      }
      handleCloseDialog();
      loadAccessories();
    } catch (error: any) {
      alert(`保存失败: ${error.message}`);
    }
  };

  // 删除配件
  const handleDelete = async (id: string) => {
    if (!confirm('确定要删除这个配件吗？')) return;

    try {
      await deleteAccessory(id);
      loadAccessories();
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
          配件管理
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          新建配件
        </Button>
      </Box>

      {/* 筛选器 */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <TextField
            label="搜索"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="配件名称或SKU"
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
        </Box>
      </Paper>

      {/* 配件表格 */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>SKU</TableCell>
              <TableCell>配件名称</TableCell>
              <TableCell>品牌</TableCell>
              <TableCell>描述</TableCell>
              <TableCell align="right">操作</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {accessories.map(accessory => (
              <TableRow key={accessory.id}>
                <TableCell>{accessory.sku_code}</TableCell>
                <TableCell>{accessory.name}</TableCell>
                <TableCell>{accessory.brand?.name || '-'}</TableCell>
                <TableCell>
                  {accessory.description
                    ? accessory.description.length > 50
                      ? `${accessory.description.substring(0, 50)}...`
                      : accessory.description
                    : '-'}
                </TableCell>
                <TableCell align="right">
                  <IconButton
                    size="small"
                    onClick={() => handleOpenDialog(accessory)}
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => handleDelete(accessory.id)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
            {accessories.length === 0 && !loading && (
              <TableRow>
                <TableCell colSpan={5} align="center">
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
        <DialogTitle>{editingAccessory ? '编辑配件' : '新建配件'}</DialogTitle>
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
              label="配件名称"
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
