'use client';

import {
  createBrand,
  deleteBrand,
  getBrands,
  updateBrand,
  type Brand,
} from '@/lib/api/product-library';
import {
  Add as AddIcon,
  Business as BusinessIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Search as SearchIcon,
} from '@mui/icons-material';
import {
  Alert,
  Avatar,
  Box,
  Button,
  Chip,
  CircularProgress,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Paper,
  Stack,
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

export default function BrandsPage() {
  // 状态管理
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(20);
  const [searchTerm, setSearchTerm] = useState('');

  // 对话框状态
  const [openDialog, setOpenDialog] = useState(false);
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    website_url: '',
    contact_email: '',
  });
  const [submitting, setSubmitting] = useState(false);

  // 加载品牌列表
  const loadBrands = async () => {
    try {
      setLoading(true);
      setError(null);

      const result = await getBrands({
        search: searchTerm || undefined,
        page,
        limit: rowsPerPage,
      });

      setBrands(result.data);
      setTotal(result.count);
    } catch (err) {
      setError(err instanceof Error ? err.message : '加载失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBrands();
  }, [page, rowsPerPage, searchTerm]);

  // 处理分页
  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // 打开创建/编辑对话框
  const handleOpenDialog = (brand?: Brand) => {
    if (brand) {
      setEditingBrand(brand);
      setFormData({
        name: brand.name,
        slug: brand.slug,
        website_url: brand.website_url || '',
        contact_email: brand.contact_email || '',
      });
    } else {
      setEditingBrand(null);
      setFormData({
        name: '',
        slug: '',
        website_url: '',
        contact_email: '',
      });
    }
    setOpenDialog(true);
  };

  // 关闭对话框
  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingBrand(null);
  };

  // 提交表单
  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      setError('品牌名称不能为空');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      if (editingBrand) {
        await updateBrand(editingBrand.id, formData);
      } else {
        await createBrand(formData);
      }

      handleCloseDialog();
      loadBrands();
    } catch (err) {
      setError(err instanceof Error ? err.message : '操作失败');
    } finally {
      setSubmitting(false);
    }
  };

  // 删除品牌
  const handleDelete = async (id: string) => {
    if (!confirm('确定要删除这个品牌吗？')) {
      return;
    }

    try {
      setError(null);
      await deleteBrand(id);
      loadBrands();
    } catch (err) {
      setError(err instanceof Error ? err.message : '删除失败');
    }
  };

  // 搜索
  const handleSearch = () => {
    setPage(0);
    loadBrands();
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* 页面标题 */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 3,
        }}
      >
        <Typography variant="h4" component="h1" gutterBottom>
          品牌管理
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          创建品牌
        </Button>
      </Box>

      {/* 错误提示 */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* 搜索栏 */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Stack direction="row" spacing={2}>
          <TextField
            fullWidth
            placeholder="搜索品牌..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            onKeyPress={e => e.key === 'Enter' && handleSearch()}
            InputProps={{
              startAdornment: (
                <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />
              ),
            }}
          />
          <Button variant="contained" onClick={handleSearch}>
            搜索
          </Button>
        </Stack>
      </Paper>

      {/* 品牌列表表格 */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell width="60">Logo</TableCell>
              <TableCell>品牌名称</TableCell>
              <TableCell>Slug</TableCell>
              <TableCell>网站</TableCell>
              <TableCell>联系邮箱</TableCell>
              <TableCell>状态</TableCell>
              <TableCell>创建时间</TableCell>
              <TableCell align="right">操作</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                  <CircularProgress />
                </TableCell>
              </TableRow>
            ) : brands.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                  <Box
                    sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: 2,
                    }}
                  >
                    <BusinessIcon
                      sx={{ fontSize: 64, color: 'text.secondary' }}
                    />
                    <Typography variant="body1" color="text.secondary">
                      暂无品牌数据
                    </Typography>
                    <Button
                      variant="outlined"
                      onClick={() => handleOpenDialog()}
                    >
                      创建第一个品牌
                    </Button>
                  </Box>
                </TableCell>
              </TableRow>
            ) : (
              brands.map(brand => (
                <TableRow key={brand.id} hover>
                  <TableCell>
                    <Avatar
                      src={brand.logo_url}
                      sx={{ bgcolor: 'primary.main' }}
                    >
                      {brand.name.charAt(0).toUpperCase()}
                    </Avatar>
                  </TableCell>
                  <TableCell>
                    <Typography variant="subtitle2">{brand.name}</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary">
                      {brand.slug}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    {brand.website_url ? (
                      <Typography
                        variant="body2"
                        component="a"
                        href={brand.website_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        color="primary"
                        sx={{
                          textDecoration: 'none',
                          '&:hover': { textDecoration: 'underline' },
                        }}
                      >
                        访问网站
                      </Typography>
                    ) : (
                      '-'
                    )}
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary">
                      {brand.contact_email || '-'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={brand.is_active ? '活跃' : '停用'}
                      size="small"
                      color={brand.is_active ? 'success' : 'default'}
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="caption" color="text.secondary">
                      {new Date(brand.created_at).toLocaleDateString('zh-CN')}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <IconButton
                      size="small"
                      color="primary"
                      onClick={() => handleOpenDialog(brand)}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => handleDelete(brand.id)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        <TablePagination
          rowsPerPageOptions={[10, 20, 50]}
          component="div"
          count={total}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="每页行数"
          labelDisplayedRows={({ from, to, count }) =>
            `${from}-${to} / ${count}`
          }
        />
      </TableContainer>

      {/* 创建/编辑对话框 */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>{editingBrand ? '编辑品牌' : '创建品牌'}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 2 }}>
            <TextField
              label="品牌名称 *"
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              required
              fullWidth
            />
            <TextField
              label="Slug *"
              value={formData.slug}
              onChange={e =>
                setFormData({
                  ...formData,
                  slug: e.target.value.toLowerCase().replace(/\s+/g, '-'),
                })
              }
              required
              fullWidth
              helperText="URL友好的标识符，只能包含小写字母、数字和连字符"
            />
            <TextField
              label="网站"
              value={formData.website_url}
              onChange={e =>
                setFormData({ ...formData, website_url: e.target.value })
              }
              placeholder="https://example.com"
              fullWidth
            />
            <TextField
              label="联系邮箱"
              value={formData.contact_email}
              onChange={e =>
                setFormData({ ...formData, contact_email: e.target.value })
              }
              placeholder="contact@example.com"
              fullWidth
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>取消</Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={submitting || !formData.name.trim()}
          >
            {submitting ? <CircularProgress size={24} /> : '保存'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
