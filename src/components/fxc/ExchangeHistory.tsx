/**
 * FXC 兑换历史组件
 */
'use client';

import { useEffect, useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Chip,
  Box,
  CircularProgress,
  Alert,
} from '@mui/material';
import { TrendingUp, TrendingDown, History } from '@mui/icons-material';

interface ExchangeTransaction {
  id: string;
  fxc_amount: number;
  token_amount: number;
  fee_amount: number;
  final_amount: number;
  exchange_rate: number;
  status: string;
  created_at: string;
}

interface DailyStats {
  todayExchanged: number;
  remainingLimit: number;
  transactionCount: number;
}

export function ExchangeHistory() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [transactions, setTransactions] = useState<ExchangeTransaction[]>([]);
  const [dailyStats, setDailyStats] = useState<DailyStats>({
    todayExchanged: 0,
    remainingLimit: 10000,
    transactionCount: 0,
  });

  useEffect(() => {
    loadExchangeData();
  }, []);

  const loadExchangeData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/fxc/exchange?limit=20');
      const result = await response.json();

      if (result.success) {
        setDailyStats(result.data.dailyStats);
        setTransactions(result.data.history || []);
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '加载失败');
    } finally {
      setLoading(false);
    }
  };

  const getStatusChip = (status: string) => {
    const config: Record<string, { label: string; color: string }> = {
      completed: { label: '已完成', color: 'success' },
      processing: { label: '处理中', color: 'warning' },
      pending: { label: '待处理', color: 'info' },
      failed: { label: '失败', color: 'error' },
      cancelled: { label: '已取消', color: 'default' },
    };

    const { label, color } = config[status] || config.completed;
    return <Chip label={label} color={color as any} size="small" />;
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" p={4}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  return (
    <Box>
      {/* 每日统计 */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          今日兑换统计
        </Typography>
        <Box display="flex" gap={3} flexWrap="wrap">
          <Box>
            <Typography variant="body2" color="text.secondary">
              已兑换金额
            </Typography>
            <Typography variant="h5" color="primary">
              {dailyStats.todayExchanged.toFixed(2)} FXC
            </Typography>
          </Box>
          <Box>
            <Typography variant="body2" color="text.secondary">
              剩余限额
            </Typography>
            <Typography variant="h5" color="success.main">
              {dailyStats.remainingLimit.toFixed(2)} FXC
            </Typography>
          </Box>
          <Box>
            <Typography variant="body2" color="text.secondary">
              交易笔数
            </Typography>
            <Typography variant="h5">
              {dailyStats.transactionCount} 笔
            </Typography>
          </Box>
        </Box>
      </Paper>

      {/* 历史记录 */}
      <Typography variant="h6" gutterBottom>
        <History sx={{ mr: 1, verticalAlign: 'middle' }} />
        兑换历史
      </Typography>

      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>时间</TableCell>
              <TableCell align="right">FXC 金额</TableCell>
              <TableCell align="right">汇率</TableCell>
              <TableCell align="right">理论 Token</TableCell>
              <TableCell align="right">手续费</TableCell>
              <TableCell align="right">实际到账</TableCell>
              <TableCell>状态</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {transactions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  暂无兑换记录
                </TableCell>
              </TableRow>
            ) : (
              transactions.map((tx) => (
                <TableRow key={tx.id}>
                  <TableCell>
                    {new Date(tx.created_at).toLocaleString('zh-CN')}
                  </TableCell>
                  <TableCell align="right">
                    <Box display="flex" alignItems="center" justifyContent="flex-end">
                      <TrendingDown sx={{ mr: 0.5, color: 'error.main' }} />
                      {tx.fxc_amount.toFixed(2)}
                    </Box>
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="body2" color="text.secondary">
                      1:{tx.exchange_rate.toFixed(4)}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="body2">
                      {tx.token_amount.toFixed(2)}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="body2" color="error">
                      -{tx.fee_amount.toFixed(2)}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Box display="flex" alignItems="center" justifyContent="flex-end">
                      <TrendingUp sx={{ mr: 0.5, color: 'success.main' }} />
                      <Typography variant="body2" fontWeight="bold" color="success.main">
                        {tx.final_amount.toFixed(2)}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>{getStatusChip(tx.status)}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
