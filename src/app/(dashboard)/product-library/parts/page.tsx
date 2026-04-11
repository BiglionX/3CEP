'use client';

import {
  Part,
  createPart,
  deletePart,
  getBrands,
  getParts,
  updatePart,
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

// 零件类型选项
const PART_TYPES = [
  { value: 'screw', label: '螺丝' },
  { value: 'resistor', label: '电阻' },
  { value: 'capacitor', label: '电容' },
  { value: 'connector', label: '连接器' },
  { value: 'cable', label: '线缆' },
  { value: 'fastener', label: '紧固件' },
  { value: 'washer', label: '垫圈' },
  { value: 'spring', label: '弹簧' },
  { value: 'other', label: '其他' },
];

export default function PartsPage() {
  // 状态管理
  const [parts, setParts] = useState<Part[]>([]);
  const [brands, setBrands] = useState<any[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(0);
  const [limit, setLimit] = useState(20);
  const [search, setSearch] = useState('');
  const [brandFilter, setBrandFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [loading, setLoading] = useState(false);

  // 对话框状态
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPart, setEditingPart] = useState<Part | null>(null);
  const [formData, setFormData] = useState({
    sku_code: '',
    brand_id: '',
    name: '',
    type: '',
    description: '',
    material: '',
  });

  // 加载品牌列表
  useEffect(() => {
    loadBrands();
  }, []);

  // 加载零件列表
  useEffect(() => {
    loadParts();
  }, [page, limit, search, brandFilter, typeFilter]);

  const loadBrands = async () => {
    try {
      const result = await getBrands({ limit: 100 });
      setBrands(result.data);
    } catch (error) {
      console.error('加载品牌失败:', error);
    }
  };

  const loadParts = async () => {
    setLoading(true);
    try {
      const result = await getParts({
        page,
        limit,
        search,
        brand_id: brandFilter || undefined,
        type: typeFilter || undefined,
      });
      setParts(result.data);
      setTotalCount(result.count);
    } catch (error) {
      console.error('加载零件失败:', error);
    } finally {
      setLoading(false);
    }
  };

  // 打开创建/编辑对话框
  const handleOpenDialog = (part?: Part) => {
    if (part) {
      setEditingPart(part);
      setFormData({
        sku_code: part.sku_code,
        brand_id: part.brand_id || '',
        name: part.name,
        type: part.type || '',
        description: part.description || '',
        material: part.material || '',
      });
    } else {
      setEditingPart(null);
      setFormData({
        sku_code: '',
        brand_id: '',
        name: '',
        type: '',
        description: '',
        material: '',
      });
    }
    setDialogOpen(true);
  };

  // 关闭对话框
  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingPart(null);
  };

  // 保存零件
  const handleSave = async () => {
    try {
      if (editingPart) {
        await updatePart(editingPart.id, formData);
      } else {
        await createPart(formData as any);
      }
      handleCloseDialog();
      loadParts();
    } catch (error: any) {
      alert(`保存失败: ${error.message}`);
    }
  };

  // 删除零件
  const handleDelete = async (id: string) => {
    if (!confirm('确定要删除这个零件吗？')) return;

    try {
      await deletePart(id);
      loadParts();
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

  // 获取类型标签
  const getTypeLabel = (type: string) => {
    const found = PART_TYPES.find(t => t.value === type);
    return found ? found.label : type;
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
          零件管理
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          新建零件
        </Button>
      </Box>

      {/* 筛选器 */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <TextField
            label="搜索"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="零件名称或SKU"
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
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>类型</InputLabel>
            <Select
              value={typeFilter}
              onChange={e => setTypeFilter(e.target.value)}
              label="类型"
            >
              <MenuItem value="">全部</MenuItem>
              {PART_TYPES.map(type => (
                <MenuItem key={type.value} value={type.value}>
                  {type.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
      </Paper>

      {/* 零件表格 */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>SKU</TableCell>
              <TableCell>零件名称</TableCell>
              <TableCell>品牌</TableCell>
              <TableCell>类型</TableCell>
              <TableCell>材质</TableCell>
              <TableCell>描述</TableCell>
              <TableCell align="right">操作</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {parts.map(part => (
              <TableRow key={part.id}>
                <TableCell>{part.sku_code}</TableCell>
                <TableCell>{part.name}</TableCell>
                <TableCell>{part.brand?.name || '-'}</TableCell>
                <TableCell>
                  {part.type ? getTypeLabel(part.type) : '-'}
                </TableCell>
                <TableCell>{part.material || '-'}</TableCell>
                <TableCell>
                  {part.description
                    ? part.description.length > 50
                      ? `${part.description.substring(0, 50)}...`
                      : part.description
                    : '-'}
                </TableCell>
                <TableCell align="right">
                  <IconButton
                    size="small"
                    onClick={() => handleOpenDialog(part)}
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => handleDelete(part.id)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
            {parts.length === 0 && !loading && (
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
        <DialogTitle>{editingPart ? '编辑零件' : '新建零件'}</DialogTitle>
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
            <FormControl fullWidth>
              <InputLabel>品牌（可选）</InputLabel>
              <Select
                value={formData.brand_id}
                onChange={e =>
                  setFormData({ ...formData, brand_id: e.target.value })
                }
                label="品牌（可选）"
              >
                <MenuItem value="">无品牌</MenuItem>
                {brands.map(brand => (
                  <MenuItem key={brand.id} value={brand.id}>
                    {brand.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              label="零件名称"
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              required
              fullWidth
            />
            <FormControl fullWidth>
              <InputLabel>类型</InputLabel>
              <Select
                value={formData.type}
                onChange={e =>
                  setFormData({ ...formData, type: e.target.value })
                }
                label="类型"
              >
                <MenuItem value="">请选择</MenuItem>
                {PART_TYPES.map(type => (
                  <MenuItem key={type.value} value={type.value}>
                    {type.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              label="材质"
              value={formData.material}
              onChange={e =>
                setFormData({ ...formData, material: e.target.value })
              }
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
