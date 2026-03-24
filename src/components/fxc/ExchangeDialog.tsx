/**
 * FXC 兑换 Token 对话框组件
 */
'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Typography,
  Box,
  Alert,
  CircularProgress,
  IconButton,
} from '@mui/material';
import { Close as CloseIcon, Info as InfoIcon } from '@mui/icons-material';
import { calculateExchangeResult, EXCHANGE_CONFIG } from '@/config/fxc-exchange.config';

interface ExchangeDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess: (data: any) => void;
  userBalance?: number;
}

export function ExchangeDialog({
  open,
  onClose,
  onSuccess,
  userBalance,
}: ExchangeDialogProps) {
  const [fxcAmount, setFxcAmount] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewData, setPreviewData] = useState<{
    tokenAmount: number;
    feeAmount: number;
    finalAmount: number;
    exchangeRate: number;
  } | null>(null);

  // 实时计算兑换结果
  const handleAmountChange = (value: string) => {
    setFxcAmount(value);
    setError(null);

    const numValue = parseFloat(value);
    if (!isNaN(numValue) && numValue > 0) {
      try {
        const result = calculateExchangeResult(numValue, true);
        setPreviewData(result);
      } catch (err) {
        setPreviewData(null);
      }
    } else {
      setPreviewData(null);
    }
  };

  // 执行兑换
  const handleExchange = async () => {
    if (!fxcAmount || parseFloat(fxcAmount) <= 0) {
      setError('请输入有效的兑换金额');
      return;
    }

    if (userBalance !== undefined && parseFloat(fxcAmount) > userBalance) {
      setError('FXC 余额不足');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/fxc/exchange', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fxcAmount: parseFloat(fxcAmount),
          useDynamicRate: true,
        }),
      });

      const result = await response.json();

      if (result.success) {
        onSuccess(result.data);
        handleClose();
      } else {
        setError(result.error || '兑换失败');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '系统错误');
    } finally {
      setLoading(false);
    }
  };

  // 关闭对话框
  const handleClose = () => {
    setFxcAmount('');
    setPreviewData(null);
    setError(null);
    onClose();
  };

  // 快速选择金额
  const quickAmounts = [50, 100, 500, 1000];

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6" component="div">
            FXC 兑换 Token
          </Typography>
          <IconButton onClick={handleClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent>
        <Box sx={{ mt: 2 }}>
          {/* 用户余额提示 */}
          {userBalance !== undefined && (
            <Alert severity="info" sx={{ mb: 2 }}>
              您的 FXC 余额：{userBalance.toFixed(2)} FXC
            </Alert>
          )}

          {/* 汇率说明 */}
          <Alert severity="info" sx={{ mb: 2 }} icon={<InfoIcon />}>
            <Typography variant="body2">
              <strong>当前汇率机制：</strong>
              <br />• 基础汇率：1 FXC = {EXCHANGE_CONFIG.baseRate} Tokens
              <br />
              • 动态浮动：±{EXCHANGE_CONFIG.volatilityBand * 100}%
              <br />
              • 手续费率：{EXCHANGE_CONFIG.feeRate * 100}%
              <br />
              • 每日限额：{EXCHANGE_CONFIG.minExchangeAmount} -{' '}
              {EXCHANGE_CONFIG.maxDailyAmount.toLocaleString()} FXC
            </Typography>
          </Alert>

          {/* 输入金额 */}
          <TextField
            label="兑换金额 (FXC)"
            type="number"
            fullWidth
            value={fxcAmount}
            onChange={(e) => handleAmountChange(e.target.value)}
            placeholder={`最小 ${EXCHANGE_CONFIG.minExchangeAmount} FXC`}
            error={!!error}
            disabled={loading}
            sx={{ mb: 2 }}
            InputProps={{
              endAdornment: (
                <Typography variant="body2" color="text.secondary">
                  FXC
                </Typography>
              ),
            }}
          />

          {/* 快速选择 */}
          <Box display="flex" gap={1} flexWrap="wrap" sx={{ mb: 2 }}>
            {quickAmounts.map((amount) => (
              <Button
                key={amount}
                variant="outlined"
                size="small"
                onClick={() => handleAmountChange(amount.toString())}
                disabled={loading || (userBalance !== undefined && amount > userBalance)}
              >
                {amount} FXC
              </Button>
            ))}
          </Box>

          {/* 预览结果 */}
          {previewData && (
            <Box
              sx={{
                p: 2,
                bgcolor: 'background.default',
                borderRadius: 1,
                mb: 2,
              }}
            >
              <Typography variant="subtitle2" gutterBottom>
                兑换详情
              </Typography>
              <Box display="flex" justifyContent="space-between" mb={1}>
                <Typography variant="body2" color="text.secondary">
                  理论 Token 数量
                </Typography>
                <Typography variant="body2">
                  {previewData.tokenAmount.toFixed(2)} Tokens
                </Typography>
              </Box>
              <Box display="flex" justifyContent="space-between" mb={1}>
                <Typography variant="body2" color="text.secondary">
                  手续费 ({EXCHANGE_CONFIG.feeRate * 100}%)
                </Typography>
                <Typography variant="body2" color="error">
                  -{previewData.feeAmount.toFixed(2)} Tokens
                </Typography>
              </Box>
              <Box
                display="flex"
                justifyContent="space-between"
                pt={1}
                borderTop={1}
                borderColor="divider"
              >
                <Typography variant="h6">实际到账</Typography>
                <Typography variant="h6" color="primary">
                  {previewData.finalAmount.toFixed(2)} Tokens
                </Typography>
              </Box>
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
                汇率：1 FXC = {previewData.exchangeRate.toFixed(4)} Tokens
              </Typography>
            </Box>
          )}

          {/* 错误提示 */}
          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose} disabled={loading}>
          取消
        </Button>
        <Button
          onClick={handleExchange}
          variant="contained"
          disabled={loading || !previewData || parseFloat(fxcAmount) <= 0}
          startIcon={loading && <CircularProgress size={20} />}
        >
          {loading ? '处理中...' : '确认兑换'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
