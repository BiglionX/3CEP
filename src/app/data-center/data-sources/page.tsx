/**
 * 数据源管理页面
 * /data-center/data-sources
 */

'use client';

import {
  Add,
  CheckCircle,
  Delete,
  Edit,
  Error as ErrorIcon,
  Refresh,
  Sync,
} from '@mui/icons-material';
import {
  Alert,
  Box,
  Button,
  Chip,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormControlLabel,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Snackbar,
  Switch,
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

interface DataSource {
  id: string;
  name: string;
  type: string;
  description?: string;
  connection_config: any;
  sync_frequency: number;
  sync_enabled: boolean;
  status: string;
  health_status: string;
  last_sync_at?: string;
  created_at: string;
}

export default function DataSourcesPage() {
  const [dataSources, setDataSources] = useState<DataSource[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingSource, setEditingSource] = useState<DataSource | null>(null);
  const [testingConnection, setTestingConnection] = useState<string | null>(
    null
  );
  const [notification, setNotification] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  // 表单状态
  const [formData, setFormData] = useState({
    name: '',
    type: 'parts',
    description: '',
    host: '',
    port: '5432',
    database: '',
    user: '',
    password: '',
    sync_frequency: 300,
    sync_enabled: false,
  });

  // 加载数据源列表
  useEffect(() => {
    loadDataSources();
  }, []);

  const loadDataSources = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/data-sources/list');
      const result = await response.json();

      if (result.success) {
        setDataSources(result.data);
      } else {
        setNotification({
          type: 'error',
          message: `加载失败：${result.error}`,
        });
      }
    } catch (error: any) {
      setNotification({
        type: 'error',
        message: `加载数据源列表失败：${error.message}`,
      });
    } finally {
      setLoading(false);
    }
  };

  // 打开新建对话框
  const handleCreate = () => {
    setEditingSource(null);
    setFormData({
      name: '',
      type: 'parts',
      description: '',
      host: '',
      port: '5432',
      database: '',
      user: '',
      password: '',
      sync_frequency: 300,
      sync_enabled: false,
    });
    setDialogOpen(true);
  };

  // 打开编辑对话框
  const handleEdit = (source: DataSource) => {
    setEditingSource(source);
    setFormData({
      name: source.name,
      type: source.type,
      description: source.description || '',
      host: source.connection_config?.host || '',
      port: source.connection_config?.port || '5432',
      database: source.connection_config?.database || '',
      user: source.connection_config?.user || '',
      password: source.connection_config?.password || '',
      sync_frequency: source.sync_frequency,
      sync_enabled: source.sync_enabled,
    });
    setDialogOpen(true);
  };

  // 保存数据源
  const handleSave = async () => {
    try {
      const connectionConfig = {
        host: formData.host,
        port: parseInt(formData.port),
        database: formData.database,
        user: formData.user,
        password: formData.password,
        ssl: true,
      };

      const payload = {
        name: formData.name,
        type: formData.type,
        description: formData.description,
        connection_config: connectionConfig,
        sync_frequency: formData.sync_frequency,
        sync_enabled: formData.sync_enabled,
      };

      let response;
      if (editingSource) {
        // 更新
        response = await fetch(
          `/api/admin/data-sources/update/${editingSource.id}`,
          {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          }
        );
      } else {
        // 创建
        response = await fetch('/api/admin/data-sources/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      }

      const result = await response.json();

      if (result.success) {
        setNotification({
          type: 'success',
          message: editingSource ? '更新成功' : '创建成功',
        });
        setDialogOpen(false);
        loadDataSources();
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

  // 删除数据源
  const handleDelete = async (id: string) => {
    if (!confirm('确定要删除这个数据源吗？')) return;

    try {
      const response = await fetch(`/api/admin/data-sources/delete/${id}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (result.success) {
        setNotification({
          type: 'success',
          message: '删除成功',
        });
        loadDataSources();
      } else {
        setNotification({
          type: 'error',
          message: `删除失败：${result.error}`,
        });
      }
    } catch (error: any) {
      setNotification({
        type: 'error',
        message: `删除失败：${error.message}`,
      });
    }
  };

  // 测试连接
  const handleTestConnection = async (source: DataSource) => {
    setTestingConnection(source.id);
    try {
      const response = await fetch('/api/admin/data-sources/test-connection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          source_id: source.id,
          connection_config: source.connection_config,
          type: source.type,
        }),
      });

      const result = await response.json();

      if (result.success) {
        setNotification({
          type: 'success',
          message: '连接测试成功',
        });
      } else {
        setNotification({
          type: 'error',
          message: `连接测试失败：${result.message}`,
        });
      }
    } catch (error: any) {
      setNotification({
        type: 'error',
        message: `连接测试失败：${error.message}`,
      });
    } finally {
      setTestingConnection(null);
    }
  };

  // 手动同步
  const handleSync = async (sourceId: string) => {
    try {
      const response = await fetch('/api/admin/data-sync/trigger', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ source_id: sourceId }),
      });

      const result = await response.json();

      if (result.success) {
        setNotification({
          type: 'success',
          message: `同步成功！共 ${result.data.total} 条记录`,
        });
        loadDataSources();
      } else {
        setNotification({
          type: 'error',
          message: `同步失败：${result.error}`,
        });
      }
    } catch (error: any) {
      setNotification({
        type: 'error',
        message: `同步失败：${error.message}`,
      });
    }
  };

  const getStatusChip = (healthStatus: string) => {
    const config = {
      healthy: {
        color: 'success' as const,
        label: '健康',
        icon: <CheckCircle />,
      },
      unhealthy: {
        color: 'error' as const,
        label: '异常',
        icon: <ErrorIcon />,
      },
      unknown: { color: 'default' as const, label: '未知', icon: null },
    };

    const cfg = config[healthStatus as keyof typeof config] || config.unknown;

    return (
      <Chip icon={cfg.icon} label={cfg.label} color={cfg.color} size="small" />
    );
  };

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      parts: '零配件数据库',
      erp: 'ERP 系统',
      crm: 'CRM 系统',
      custom: '自定义',
    };
    return labels[type] || type;
  };

  const formatFrequency = (seconds: number) => {
    if (seconds >= 3600) {
      return `${seconds / 3600}小时`;
    } else if (seconds >= 60) {
      return `${seconds / 60}分钟`;
    }
    return `${seconds}秒`;
  };

  return (
    <Container maxWidth="xl">
      {/* 标题栏 */}
      <Box
        sx={{
          mb: 4,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <div>
          <Typography variant="h4" gutterBottom>
            数据源管理
          </Typography>
          <Typography variant="body2" color="text.secondary">
            管理外部数据库连接，配置自动同步策略
          </Typography>
        </div>
        <Button variant="contained" startIcon={<Add />} onClick={handleCreate}>
          新建数据源
        </Button>
      </Box>

      {/* 数据表格 */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>名称</TableCell>
              <TableCell>类型</TableCell>
              <TableCell>同步频率</TableCell>
              <TableCell>状态</TableCell>
              <TableCell>最后同步</TableCell>
              <TableCell align="right">操作</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  加载中...
                </TableCell>
              </TableRow>
            ) : dataSources.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  暂无数据源
                </TableCell>
              </TableRow>
            ) : (
              dataSources.map(source => (
                <TableRow key={source.id}>
                  <TableCell>
                    <Typography variant="body2" fontWeight="bold">
                      {source.name}
                    </Typography>
                    {source.description && (
                      <Typography variant="caption" color="text.secondary">
                        {source.description}
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>{getTypeLabel(source.type)}</TableCell>
                  <TableCell>
                    {formatFrequency(source.sync_frequency)}
                    {source.sync_enabled && (
                      <Chip
                        label="自动"
                        size="small"
                        color="primary"
                        sx={{ ml: 1 }}
                      />
                    )}
                  </TableCell>
                  <TableCell>{getStatusChip(source.health_status)}</TableCell>
                  <TableCell>
                    {source.last_sync_at
                      ? new Date(source.last_sync_at).toLocaleString('zh-CN')
                      : '从未同步'}
                  </TableCell>
                  <TableCell align="right">
                    <IconButton
                      size="small"
                      onClick={() => handleTestConnection(source)}
                      disabled={testingConnection === source.id}
                    >
                      {testingConnection === source.id ? (
                        <Refresh />
                      ) : (
                        <CheckCircle />
                      )}
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleSync(source.id)}
                    >
                      <Sync />
                    </IconButton>
                    <IconButton size="small" onClick={() => handleEdit(source)}>
                      <Edit />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleDelete(source.id)}
                      color="error"
                    >
                      <Delete />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* 新建/编辑对话框 */}
      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>{editingSource ? '编辑数据源' : '新建数据源'}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="数据源名称"
                value={formData.name}
                onChange={e =>
                  setFormData({ ...formData, name: e.target.value })
                }
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="描述"
                value={formData.description}
                onChange={e =>
                  setFormData({ ...formData, description: e.target.value })
                }
                multiline
                rows={2}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>数据类型</InputLabel>
                <Select
                  value={formData.type}
                  label="数据类型"
                  onChange={e =>
                    setFormData({ ...formData, type: e.target.value })
                  }
                >
                  <MenuItem value="parts">零配件数据库</MenuItem>
                  <MenuItem value="erp">ERP 系统</MenuItem>
                  <MenuItem value="crm">CRM 系统</MenuItem>
                  <MenuItem value="custom">自定义</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="主机地址"
                value={formData.host}
                onChange={e =>
                  setFormData({ ...formData, host: e.target.value })
                }
                placeholder="localhost"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="端口"
                value={formData.port}
                onChange={e =>
                  setFormData({ ...formData, port: e.target.value })
                }
                placeholder="5432"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="数据库名"
                value={formData.database}
                onChange={e =>
                  setFormData({ ...formData, database: e.target.value })
                }
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="用户名"
                value={formData.user}
                onChange={e =>
                  setFormData({ ...formData, user: e.target.value })
                }
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="密码"
                type="password"
                value={formData.password}
                onChange={e =>
                  setFormData({ ...formData, password: e.target.value })
                }
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="同步频率（秒）"
                type="number"
                value={formData.sync_frequency}
                onChange={e =>
                  setFormData({
                    ...formData,
                    sync_frequency: parseInt(e.target.value),
                  })
                }
              />
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.sync_enabled}
                    onChange={e =>
                      setFormData({
                        ...formData,
                        sync_enabled: e.target.checked,
                      })
                    }
                  />
                }
                label="启用自动同步"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>取消</Button>
          <Button onClick={handleSave} variant="contained">
            保存
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
