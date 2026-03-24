/**
 * 门户审批管理组件
 * 支持单个和批量审批功能
 */
'use client';

import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Checkbox,
  Tooltip,
  Alert,
  Snackbar,
  CircularProgress,
  FormControlLabel,
} from '@mui/material';
import {
  Approve,
  Close,
  Visibility,
  Description,
  CheckCircle,
  Pending,
  Warning,
} from '@mui/icons-material';

interface Portal {
  id: string;
  user_id: string;
  portal_name: string;
  portal_description: string;
  business_type: string;
  approval_status: string;
  created_at: string;
  user_profile?: {
    full_name: string;
    avatar_url?: string;
  };
}

interface ApprovalDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void;
  action: 'approve' | 'reject';
  portalName: string;
}

function ApprovalDialog({
  open,
  onClose,
  onConfirm,
  action,
  portalName,
}: ApprovalDialogProps) {
  const [reason, setReason] = useState('');

  const handleConfirm = () => {
    if (action === 'reject' && !reason.trim()) {
      alert('请填写拒绝原因');
      return;
    }
    onConfirm(reason);
    setReason('');
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {action === 'approve' ? '批准门户' : '拒绝门户'} - {portalName}
      </DialogTitle>
      <DialogContent>
        {action === 'reject' && (
          <TextField
            autoFocus
            margin="dense"
            label="拒绝原因"
            type="text"
            fullWidth
            multiline
            rows={4}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="请说明拒绝的原因，以便用户改进"
            required
          />
        )}
        {action === 'approve' && (
          <Box sx={{ p: 2 }}>
            <Alert severity="success">
              <Typography variant="body2">
                批注后，该门户将自动发布，用户可以通过门户访问其内容。
              </Typography>
            </Alert>
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>取消</Button>
        <Button
          onClick={handleConfirm}
          variant="contained"
          color={action === 'approve' ? 'success' : 'error'}
        >
          确认{action === 'approve' ? '批准' : '拒绝'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export function PortalsApprovalManager() {
  const [portals, setPortals] = useState<Portal[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [approvalDialog, setApprovalDialog] = useState<{
    open: boolean;
    action: 'approve' | 'reject';
    portalId: string;
    portalName: string;
  }>({
    open: false,
    action: 'approve',
    portalId: '',
    portalName: '',
  });

  const [batchDialog, setBatchDialog] = useState<{
    open: boolean;
    action: 'approve' | 'reject';
  }>({
    open: false,
    action: 'approve',
  });

  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'warning' | 'info';
  }>({
    open: false,
    message: '',
    severity: 'info',
  });

  // 加载待审批门户
  const loadPendingPortals = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/portals/pending?limit=50');
      const result = await response.json();

      if (result.success) {
        setPortals(result.data.portals || []);
      } else {
        setSnackbar({
          open: true,
          message: result.error || '加载失败',
          severity: 'error',
        });
      }
    } catch (error) {
      setSnackbar({
        open: true,
        message: error instanceof Error ? error.message : '加载失败',
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPendingPortals();
  }, []);

  // 处理单个审批
  const handleSingleApproval = (
    portalId: string,
    portalName: string,
    action: 'approve' | 'reject'
  ) => {
    setApprovalDialog({
      open: true,
      action,
      portalId,
      portalName,
    });
  };

  const confirmSingleApproval = async (reason: string) => {
    try {
      const response = await fetch('/api/admin/portals/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          portalId: approvalDialog.portalId,
          action: approvalDialog.action,
          reason: reason || undefined,
        }),
      });

      const result = await response.json();

      if (result.success) {
        setSnackbar({
          open: true,
          message: result.message || '审批成功',
          severity: 'success',
        });
        loadPendingPortals();
      } else {
        setSnackbar({
          open: true,
          message: result.error || '审批失败',
          severity: 'error',
        });
      }
    } catch (error) {
      setSnackbar({
        open: true,
        message: error instanceof Error ? error.message : '操作失败',
        severity: 'error',
      });
    }
  };

  // 处理批量审批
  const handleBatchApproval = (action: 'approve' | 'reject') => {
    if (selectedIds.length === 0) {
      setSnackbar({
        open: true,
        message: '请先选择要审批的门户',
        severity: 'warning',
      });
      return;
    }

    setBatchDialog({
      open: true,
      action,
    });
  };

  const confirmBatchApproval = async (reason: string) => {
    try {
      const response = await fetch('/api/admin/portals/batch-approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          portalIds: selectedIds,
          action: batchDialog.action,
          reason: batchDialog.action === 'reject' ? reason : undefined,
        }),
      });

      const result = await response.json();

      if (result.success) {
        setSnackbar({
          open: true,
          message: result.message || '批量审批成功',
          severity: 'success',
        });
        setSelectedIds([]);
        loadPendingPortals();
      } else {
        setSnackbar({
          open: true,
          message: result.error || '批量审批失败',
          severity: 'error',
        });
      }
    } catch (error) {
      setSnackbar({
        open: true,
        message: error instanceof Error ? error.message : '操作失败',
        severity: 'error',
      });
    }
  };

  // 全选/反选
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(portals.map((p) => p.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (portalId: string, checked: boolean) => {
    if (checked) {
      setSelectedIds([...selectedIds, portalId]);
    } else {
      setSelectedIds(selectedIds.filter((id) => id !== portalId));
    }
  };

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      enterprise: '企业用户',
      'repair-shop': '维修店',
      'foreign-trade': '外贸公司',
    };
    return labels[type] || type;
  };

  return (
    <Box>
      {/* 统计信息 */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box>
            <Typography variant="h6" gutterBottom>
              待审批门户
            </Typography>
            <Typography variant="body2" color="text.secondary">
              共 {portals.length} 个待审批申请
            </Typography>
          </Box>
          <Box display="flex" gap={2}>
            <Button
              variant="contained"
              color="success"
              startIcon={<Approve />}
              onClick={() => handleBatchApproval('approve')}
              disabled={selectedIds.length === 0}
            >
              批量通过 ({selectedIds.length})
            </Button>
            <Button
              variant="outlined"
              color="error"
              startIcon={<Close />}
              onClick={() => handleBatchApproval('reject')}
              disabled={selectedIds.length === 0}
            >
              批量拒绝
            </Button>
          </Box>
        </Box>
      </Paper>

      {/* 提示警告 */}
      {portals.length > 0 && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          <Typography variant="body2">
            有 <strong>{portals.length}</strong> 个门户待审核，请及时处理
          </Typography>
        </Alert>
      )}

      {/* 表格 */}
      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell padding="checkbox">
                <Checkbox
                  indeterminate={
                    selectedIds.length > 0 && selectedIds.length < portals.length
                  }
                  checked={
                    selectedIds.length > 0 && selectedIds.length === portals.length
                  }
                  onChange={(e) => handleSelectAll(e.target.checked)}
                />
              </TableCell>
              <TableCell>门户名称</TableCell>
              <TableCell>用户类型</TableCell>
              <TableCell>申请时间</TableCell>
              <TableCell align="right">操作</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  <CircularProgress size={24} />
                  <Typography variant="body2" color="text.secondary">
                    加载中...
                  </Typography>
                </TableCell>
              </TableRow>
            ) : portals.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  <Typography variant="body2" color="text.secondary">
                    暂无待审批门户
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              portals.map((portal) => (
                <TableRow key={portal.id} hover>
                  <TableCell padding="checkbox">
                    <Checkbox
                      checked={selectedIds.includes(portal.id)}
                      onChange={(e) =>
                        handleSelectOne(portal.id, e.target.checked)
                      }
                    />
                  </TableCell>
                  <TableCell>
                    <Box>
                      <Typography variant="body2" fontWeight="medium">
                        {portal.portal_name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {portal.portal_description}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={getTypeLabel(portal.business_type)}
                      size="small"
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="caption">
                      {new Date(portal.created_at).toLocaleString('zh-CN')}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Tooltip title="查看详情">
                      <IconButton
                        size="small"
                        onClick={() =>
                          window.open(`/admin/portals/${portal.id}`, '_blank')
                        }
                      >
                        <Visibility fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="批准">
                      <IconButton
                        size="small"
                        color="success"
                        onClick={() =>
                          handleSingleApproval(
                            portal.id,
                            portal.portal_name,
                            'approve'
                          )
                        }
                      >
                        <Approve fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="拒绝">
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() =>
                          handleSingleApproval(
                            portal.id,
                            portal.portal_name,
                            'reject'
                          )
                        }
                      >
                        <Close fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* 单个审批对话框 */}
      <ApprovalDialog
        open={approvalDialog.open}
        onClose={() => setApprovalDialog({ ...approvalDialog, open: false })}
        onConfirm={confirmSingleApproval}
        action={approvalDialog.action}
        portalName={approvalDialog.portalName}
      />

      {/* 批量审批对话框 */}
      <ApprovalDialog
        open={batchDialog.open}
        onClose={() => setBatchDialog({ ...batchDialog, open: false })}
        onConfirm={confirmBatchApproval}
        action={batchDialog.action}
        portalName={`选中的 ${selectedIds.length} 个门户`}
      />

      {/* 消息提示 */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  );
}
