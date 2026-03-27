/**
 * 外部数据同步监控页面
 * /data-center/external-data-sync
 */

'use client';
import {
  CheckCircle,
  Error as ErrorIcon,
  PlayArrow,
  Refresh,
  Schedule,
} from '@mui/icons-material';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Container,
  Grid,
  IconButton,
  LinearProgress,
  Paper,
  Snackbar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import { useEffect, useState } from 'react';

interface SyncTask {
  source_id: string;
  source_name: string;
  source_type: string;
  sync_frequency: number;
  sync_enabled: boolean;
  last_sync_at?: string;
  health_status: string;
}

interface SyncHistory {
  id: string;
  source_id: string;
  source_name: string;
  records_synced: number;
  records_inserted: number;
  records_updated: number;
  records_deleted: number;
  records_failed: number;
  status: string;
  started_at: string;
  completed_at?: string;
  duration_seconds?: number;
  error_message?: string;
}

interface SyncStatistics {
  source_id: string;
  source_name: string;
  total_syncs: number;
  successful_syncs: number;
  failed_syncs: number;
  total_records: number;
  total_inserted: number;
  total_updated: number;
  avg_duration?: number;
  last_sync_at?: string;
}

export default function ExternalDataSyncPage() {
  const [syncTasks, setSyncTasks] = useState<SyncTask[]>([]);
  const [syncHistory, setSyncHistory] = useState<SyncHistory[]>([]);
  const [statistics, setStatistics] = useState<SyncStatistics[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncingId, setSyncingId] = useState<string | null>(null);
  const [notification, setNotification] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  // 加载数据
  useEffect(() => {
    loadAllData();
    // 每 30 秒自动刷新
    const interval = setInterval(loadAllData, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadAllData = async () => {
    try {
      setLoading(true);
      await Promise.all([loadSyncTasks(), loadSyncHistory(), loadStatistics()]);
    } catch (error) {
      console.error('加载数据失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadSyncTasks = async () => {
    const response = await fetch('/api/admin/data-sources/list');
    const result = await response.json();
    if (result.success) {
      setSyncTasks(result.data.filter((s: any) => s.sync_enabled));
    }
  };

  const loadSyncHistory = async () => {
    const response = await fetch('/api/admin/data-sync/history?limit=20');
    const result = await response.json();
    if (result.success) {
      setSyncHistory(result.data);
    }
  };

  const loadStatistics = async () => {
    const response = await fetch('/api/admin/data-sync/statistics');
    const result = await response.json();
    if (result.success) {
      setStatistics(result.data);
    }
  };

  // 手动触发同步
  const handleManualSync = async (sourceId: string) => {
    setSyncingId(sourceId);
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
        loadAllData();
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
    } finally {
      setSyncingId(null);
    }
  };

  const getStatusChip = (status: string) => {
    const config: Record<string, { color: string; label: string; icon: any }> =
      {
        success: {
          color: 'success',
          label: '成功',
          icon: <CheckCircle sx={{ fontSize: 14 }} />,
        },
        failed: {
          color: 'error',
          label: '失败',
          icon: <ErrorIcon sx={{ fontSize: 14 }} />,
        },
        partial: {
          color: 'warning',
          label: '部分成功',
          icon: <Schedule sx={{ fontSize: 14 }} />,
        },
      };

    const cfg = config[status] || config.success;
    return (
      <Chip
        icon={cfg.icon}
        label={cfg.label}
        color={cfg.color as any}
        size="small"
        variant="outlined"
      />
    );
  };

  const formatDuration = (seconds?: number) => {
    if (!seconds) return '-';
    if (seconds < 60) return `${seconds.toFixed(1)}秒`;
    return `${Math.floor(seconds / 60)}分${(seconds % 60).toFixed(0)}秒`;
  };

  const formatFrequency = (seconds: number) => {
    if (seconds >= 3600) return `${(seconds / 3600).toFixed(1)}小时`;
    if (seconds >= 60) return `${(seconds / 60).toFixed(0)}分钟`;
    return `${seconds}秒`;
  };

  return (
    <Container maxWidth="xl">
      {/* 标题栏 */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          外部数据同步监控
        </Typography>
        <Typography variant="body2" color="text.secondary">
          实时监控外部数据同步任务执行状态和历史记录
        </Typography>
      </Box>

      {loading && <LinearProgress sx={{ mb: 2 }} />}

      {/* 统计概览 */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {statistics.map(stat => (
          <Grid item xs={12} sm={6} md={3} key={stat.source_id}>
            <Card>
              <CardContent>
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    mb: 2,
                  }}
                >
                  <Typography variant="h6">{stat.source_name}</Typography>
                  <Chip label={stat.source_type} size="small" />
                </Box>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">
                      总同步次数
                    </Typography>
                    <Typography variant="h5">{stat.total_syncs}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">
                      成功率
                    </Typography>
                    <Typography variant="h5" color="success.main">
                      {stat.total_syncs > 0
                        ? `${((stat.successful_syncs / stat.total_syncs) * 100).toFixed(0)}%`
                        : '-'}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">
                      总记录数
                    </Typography>
                    <Typography variant="h6">{stat.total_records}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">
                      平均耗时
                    </Typography>
                    <Typography variant="h6">
                      {formatDuration(stat.avg_duration)}
                    </Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* 正在运行的任务 */}
      <Paper sx={{ p: 2, mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          活跃同步任务
        </Typography>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>数据源名称</TableCell>
                <TableCell>类型</TableCell>
                <TableCell>同步频率</TableCell>
                <TableCell>状态</TableCell>
                <TableCell>最后同步</TableCell>
                <TableCell align="right">操作</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {syncTasks.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    <Typography color="text.secondary" sx={{ py: 2 }}>
                      暂无启用的同步任务
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                syncTasks.map(task => (
                  <TableRow key={task.source_id}>
                    <TableCell>{task.source_name}</TableCell>
                    <TableCell>{task.source_type}</TableCell>
                    <TableCell>
                      {formatFrequency(task.sync_frequency)}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={
                          task.health_status === 'healthy' ? '正常' : '异常'
                        }
                        color={
                          task.health_status === 'healthy' ? 'success' : 'error'
                        }
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      {task.last_sync_at
                        ? new Date(task.last_sync_at).toLocaleString('zh-CN')
                        : '从未同步'}
                    </TableCell>
                    <TableCell align="right">
                      <IconButton
                        size="small"
                        onClick={() => handleManualSync(task.source_id)}
                        disabled={syncingId === task.source_id}
                      >
                        {syncingId === task.source_id ? (
                          <Refresh
                            sx={{ animation: 'spin 1s linear infinite' }}
                          />
                        ) : (
                          <PlayArrow />
                        )}
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* 同步历史 */}
      <Paper sx={{ p: 2 }}>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 2,
          }}
        >
          <Typography variant="h6">最近同步历史</Typography>
          <Button
            startIcon={<Refresh />}
            size="small"
            onClick={loadSyncHistory}
          >
            刷新
          </Button>
        </Box>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>数据源</TableCell>
                <TableCell>状态</TableCell>
                <TableCell>开始时间</TableCell>
                <TableCell>完成时间</TableCell>
                <TableCell>耗时</TableCell>
                <TableCell>新增</TableCell>
                <TableCell>更新</TableCell>
                <TableCell>删除</TableCell>
                <TableCell>失败</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {syncHistory.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} align="center">
                    <Typography color="text.secondary" sx={{ py: 2 }}>
                      暂无同步历史记录
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                syncHistory.map(record => (
                  <TableRow key={record.id}>
                    <TableCell>{record.source_name}</TableCell>
                    <TableCell>{getStatusChip(record.status)}</TableCell>
                    <TableCell>
                      {new Date(record.started_at).toLocaleString('zh-CN')}
                    </TableCell>
                    <TableCell>
                      {record.completed_at
                        ? new Date(record.completed_at).toLocaleString('zh-CN')
                        : '未完成'}
                    </TableCell>
                    <TableCell>
                      {formatDuration(record.duration_seconds)}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={`+${record.records_inserted}`}
                        size="small"
                        color="success"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={`~${record.records_updated}`}
                        size="small"
                        color="info"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={`-${record.records_deleted}`}
                        size="small"
                        color="warning"
                      />
                    </TableCell>
                    <TableCell>
                      {record.records_failed > 0 ? (
                        <Chip
                          label={record.records_failed}
                          size="small"
                          color="error"
                        />
                      ) : (
                        '-'
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

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
