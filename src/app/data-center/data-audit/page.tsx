/**
 * 数据审核中心页面
 * /data-center/data-audit
 */

'use client';
import { Cancel, CheckCircle, SkipNext } from '@mui/icons-material';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  Chip,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Snackbar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import { useEffect, useState } from 'react';

interface PendingRecord {
  id: string;
  part_number: string;
  part_name: string;
  category: string;
  price: number;
  stock_quantity: number;
  sync_mode: string;
  synced_at: string;
  source_name: string;
  source_type: string;
}

interface AuditStatistics {
  pending: number;
  approved: number;
  rejected: number;
  skipped: number;
  total: number;
}

export default function DataAuditPage() {
  const [pendingData, setPendingData] = useState<PendingRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [statistics, setStatistics] = useState<AuditStatistics | null>(null);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [notification, setNotification] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);
  const [tabValue, setTabValue] = useState(0);
  const [sourceFilter, setSourceFilter] = useState<string>('');

  // 加载待审核数据
  useEffect(() => {
    loadPendingData();
    loadStatistics();
  }, []);

  const loadPendingData = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        limit: '100',
        ...(sourceFilter && { source_id: sourceFilter }),
      });

      const response = await fetch(`/api/admin/data-audit/pending?${params}`);
      const result = await response.json();

      if (result.success) {
        setPendingData(result.data);
      }
    } catch (error: any) {
      setNotification({
        type: 'error',
        message: `加载数据失败：${error.message}`,
      });
    } finally {
      setLoading(false);
    }
  };

  const loadStatistics = async () => {
    try {
      const response = await fetch('/api/admin/data-audit/statistics');
      const result = await response.json();

      if (result.success) {
        setStatistics(result.data);
      }
    } catch (error: any) {
      console.error('加载统计失败:', error);
    }
  };

  // 全选/取消全选
  const toggleSelectAll = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      setSelectedIds(pendingData.map(r => r.id));
    } else {
      setSelectedIds([]);
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  // 批量通过
  const handleBatchApprove = async () => {
    if (selectedIds.length === 0) {
      setNotification({ type: 'error', message: '请先选择记录' });
      return;
    }

    try {
      const response = await fetch('/api/admin/data-audit/batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          staging_ids: selectedIds,
          action: 'approve',
          notes: '批量审核通过',
        }),
      });

      const result = await response.json();

      if (result.success) {
        setNotification({
          type: 'success',
          message: `成功通过 ${result.data.processed} 条记录`,
        });
        setSelectedIds([]);
        loadPendingData();
        loadStatistics();
      } else {
        setNotification({
          type: 'error',
          message: `操作失败：${result.error}`,
        });
      }
    } catch (error: any) {
      setNotification({
        type: 'error',
        message: `操作失败：${error.message}`,
      });
    }
  };

  // 批量拒绝
  const handleBatchReject = () => {
    if (selectedIds.length === 0) {
      setNotification({ type: 'error', message: '请先选择记录' });
      return;
    }
    setRejectDialogOpen(true);
  };

  const confirmReject = async () => {
    try {
      const response = await fetch('/api/admin/data-audit/batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          staging_ids: selectedIds,
          action: 'reject',
          reason: rejectionReason,
        }),
      });

      const result = await response.json();

      if (result.success) {
        setNotification({
          type: 'success',
          message: `成功拒绝 ${result.data.processed} 条记录`,
        });
        setRejectDialogOpen(false);
        setRejectionReason('');
        setSelectedIds([]);
        loadPendingData();
        loadStatistics();
      } else {
        setNotification({
          type: 'error',
          message: `操作失败：${result.error}`,
        });
      }
    } catch (error: any) {
      setNotification({
        type: 'error',
        message: `操作失败：${error.message}`,
      });
    }
  };

  // 批量跳过
  const handleBatchSkip = async () => {
    if (selectedIds.length === 0) {
      setNotification({ type: 'error', message: '请先选择记录' });
      return;
    }

    try {
      const response = await fetch('/api/admin/data-audit/batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          staging_ids: selectedIds,
          action: 'skip',
          notes: '跳过本次同步',
        }),
      });

      const result = await response.json();

      if (result.success) {
        setNotification({
          type: 'success',
          message: `成功跳过 ${result.data.processed} 条记录`,
        });
        setSelectedIds([]);
        loadPendingData();
        loadStatistics();
      } else {
        setNotification({
          type: 'error',
          message: `操作失败：${result.error}`,
        });
      }
    } catch (error: any) {
      setNotification({
        type: 'error',
        message: `操作失败：${error.message}`,
      });
    }
  };

  const getSyncModeChip = (mode: string) => {
    const config: Record<string, { color: string; label: string }> = {
      insert: { color: 'success', label: '新增' },
      update: { color: 'info', label: '更新' },
      delete: { color: 'warning', label: '删除' },
    };

    const cfg = config[mode] || { color: 'default', label: mode };

    return (
      <Chip
        label={cfg.label}
        color={cfg.color as any}
        size="small"
        variant="outlined"
      />
    );
  };

  return (
    <Container maxWidth="xl">
      {/* 标题栏 */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          数据审核中心
        </Typography>
        <Typography variant="body2" color="text.secondary">
          审核从外部数据库同步的数据，确保数据质量
        </Typography>
      </Box>

      {/* 统计卡片 */}
      {statistics && (
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={2.4}>
            <Card sx={{ bgcolor: '#E3F2FD' }}>
              <CardContent>
                <Typography color="text.secondary" gutterBottom>
                  待审核
                </Typography>
                <Typography variant="h3">{statistics.pending}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={2.4}>
            <Card sx={{ bgcolor: '#E8F5E9' }}>
              <CardContent>
                <Typography color="text.secondary" gutterBottom>
                  已通过
                </Typography>
                <Typography variant="h3">{statistics.approved}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={2.4}>
            <Card sx={{ bgcolor: '#FFEBEE' }}>
              <CardContent>
                <Typography color="text.secondary" gutterBottom>
                  已拒绝
                </Typography>
                <Typography variant="h3">{statistics.rejected}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={2.4}>
            <Card sx={{ bgcolor: '#FFF3E0' }}>
              <CardContent>
                <Typography color="text.secondary" gutterBottom>
                  已跳过
                </Typography>
                <Typography variant="h3">{statistics.skipped}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={2.4}>
            <Card sx={{ bgcolor: '#F3E5F5' }}>
              <CardContent>
                <Typography color="text.secondary" gutterBottom>
                  总计
                </Typography>
                <Typography variant="h3">{statistics.total}</Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* 操作工具栏 */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6}>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                variant="contained"
                startIcon={<CheckCircle />}
                onClick={handleBatchApprove}
                disabled={selectedIds.length === 0}
                color="success"
              >
                批量通过 ({selectedIds.length})
              </Button>
              <Button
                variant="outlined"
                startIcon={<Cancel />}
                onClick={handleBatchReject}
                disabled={selectedIds.length === 0}
                color="error"
              >
                批量拒绝
              </Button>
              <Button
                variant="outlined"
                startIcon={<SkipNext />}
                onClick={handleBatchSkip}
                disabled={selectedIds.length === 0}
              >
                批量跳过
              </Button>
            </Box>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
              <FormControl size="small" sx={{ minWidth: 150 }}>
                <InputLabel>数据源</InputLabel>
                <Select
                  value={sourceFilter}
                  label="数据源"
                  onChange={e => setSourceFilter(e.target.value)}
                >
                  <MenuItem value="">全部</MenuItem>
                  {/* TODO: 加载数据源列表 */}
                </Select>
              </FormControl>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* 数据表格 */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell padding="checkbox">
                <Checkbox onChange={toggleSelectAll} />
              </TableCell>
              <TableCell>配件编号</TableCell>
              <TableCell>配件名称</TableCell>
              <TableCell>分类</TableCell>
              <TableCell>价格</TableCell>
              <TableCell>库存</TableCell>
              <TableCell>变更类型</TableCell>
              <TableCell>数据源</TableCell>
              <TableCell>同步时间</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={9} align="center">
                  加载中...
                </TableCell>
              </TableRow>
            ) : pendingData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} align="center">
                  <Box sx={{ py: 4 }}>
                    <CheckCircle
                      sx={{ fontSize: 60, color: 'success.main', mb: 2 }}
                    />
                    <Typography variant="h6" color="text.secondary">
                      没有待审核的数据
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      所有同步数据已完成审核
                    </Typography>
                  </Box>
                </TableCell>
              </TableRow>
            ) : (
              pendingData.map(record => (
                <TableRow
                  key={record.id}
                  selected={selectedIds.includes(record.id)}
                >
                  <TableCell padding="checkbox">
                    <Checkbox
                      checked={selectedIds.includes(record.id)}
                      onChange={() => toggleSelect(record.id)}
                    />
                  </TableCell>
                  <TableCell>{record.part_number}</TableCell>
                  <TableCell>{record.part_name}</TableCell>
                  <TableCell>{record.category}</TableCell>
                  <TableCell>¥{record.price?.toFixed(2)}</TableCell>
                  <TableCell>{record.stock_quantity}</TableCell>
                  <TableCell>{getSyncModeChip(record.sync_mode)}</TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {record.source_name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {record.source_type}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    {new Date(record.synced_at).toLocaleString('zh-CN')}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* 拒绝原因对话框 */}
      <Dialog
        open={rejectDialogOpen}
        onClose={() => setRejectDialogOpen(false)}
      >
        <DialogTitle>批量拒绝</DialogTitle>
        <DialogContent sx={{ minWidth: 400 }}>
          <TextField
            fullWidth
            label="拒绝原因"
            value={rejectionReason}
            onChange={e => setRejectionReason(e.target.value)}
            multiline
            rows={4}
            placeholder="请输入拒绝原因..."
            autoFocus
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRejectDialogOpen(false)}>取消</Button>
          <Button
            onClick={confirmReject}
            variant="contained"
            color="error"
            disabled={!rejectionReason.trim()}
          >
            确认拒绝
          </Button>
        </DialogActions>
      </Dialog>

      {/* 通知提示 */}
      <Snackbar
        open={!!notification}
        autoHideDuration={6000}
        onClose={() => setNotification(null)}
      >
        <Alert
          severity={notification?.type}
          onClose={() => setNotification(null)}
        >
          {notification?.message}
        </Alert>
      </Snackbar>
    </Container>
  );
}
