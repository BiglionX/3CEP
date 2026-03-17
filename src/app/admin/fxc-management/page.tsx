'use client';

import { useState, useEffect } from 'react';
import {
  Box,
  Container,
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
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Grid,
  Card,
  CardContent,
  Tooltip,
  Alert,
  Tab,
  Tabs,
  Stack,
} from '@mui/material';
import {
  Refresh,
  Search,
  Add,
  Remove,
  SwapHoriz,
  AccountBalance,
  MonetizationOn,
  CurrencyExchange,
  TrendingUp,
  Warning,
} from '@mui/icons-material';

// Mock 数据
const mockFXCAccounts = [
  {
    id: '1',
    user_id: 'u001',
    user_name: '张三 (企业用户)',
    business_type: 'enterprise',
    balance: 125000.5,
    currency: 'USD',
    last_transaction: '2026-03-17 14:30',
    account_status: 'active',
  },
  {
    id: '2',
    user_id: 'u002',
    user_name: '李四 (维修店)',
    business_type: 'repair-shop',
    balance: 8500.75,
    currency: 'CNY',
    last_transaction: '2026-03-17 12:15',
    account_status: 'active',
  },
  {
    id: '3',
    user_id: 'u003',
    user_name: '王五 (外贸公司)',
    business_type: 'foreign-trade',
    balance: 52000.25,
    currency: 'EUR',
    last_transaction: '2026-03-16 18:45',
    account_status: 'frozen',
  },
  {
    id: '4',
    user_id: 'u004',
    user_name: '赵六 (维修店)',
    business_type: 'repair-shop',
    balance: 3200.0,
    currency: 'CNY',
    last_transaction: '2026-03-17 15:20',
    account_status: 'active',
  },
];

const mockTransactions = [
  {
    id: 't001',
    user_id: 'u001',
    user_name: '张三 (企业用户)',
    type: 'recharge',
    amount: 50000,
    from_currency: 'USD',
    to_currency: null,
    exchange_rate: null,
    status: 'completed',
    created_at: '2026-03-15 14:30',
  },
  {
    id: 't002',
    user_id: 'u002',
    user_name: '李四 (维修店)',
    type: 'withdraw',
    amount: -2000,
    from_currency: 'CNY',
    to_currency: null,
    exchange_rate: null,
    status: 'completed',
    created_at: '2026-03-17 10:20',
  },
  {
    id: 't003',
    user_id: 'u003',
    user_name: '王五 (外贸公司)',
    type: 'exchange',
    amount: 10000,
    from_currency: 'USD',
    to_currency: 'EUR',
    exchange_rate: 0.92,
    status: 'completed',
    created_at: '2026-03-16 16:45',
  },
  {
    id: 't004',
    user_id: 'u001',
    user_name: '张三 (企业用户)',
    type: 'transfer',
    amount: -15000,
    from_currency: 'USD',
    to_currency: null,
    exchange_rate: null,
    status: 'completed',
    created_at: '2026-03-17 09:15',
  },
  {
    id: 't005',
    user_id: 'u004',
    user_name: '赵六 (维修店)',
    type: 'recharge',
    amount: 5000,
    from_currency: 'CNY',
    to_currency: null,
    exchange_rate: null,
    status: 'pending',
    created_at: '2026-03-17 11:30',
  },
];

const mockExchangeRates = [
  { currency: 'CNY', rate: 1.0, symbol: '¥', name: '人民币' },
  { currency: 'USD', rate: 7.245, symbol: '$', name: '美元' },
  { currency: 'EUR', rate: 7.856, symbol: '€', name: '欧元' },
  { currency: 'JPY', rate: 0.0485, symbol: '¥', name: '日元' },
  { currency: 'GBP', rate: 9.245, symbol: '£', name: '英镑' },
];

const mockStats = {
  totalAccounts: 4580,
  totalBalance: 85432000,
  todayTransactions: 128,
  todayVolume: 2847500,
  frozenAccounts: 12,
  pendingTransactions: 15,
  topCurrency: 'USD',
  growthRate: 8.5,
};

export default function FXCManagementPage() {
  const [tabValue, setTabValue] = useState(0);
  const [accounts, setAccounts] = useState(mockFXCAccounts);
  const [transactions, setTransactions] = useState(mockTransactions);
  const [rates, setRates] = useState(mockExchangeRates);
  const [stats, setStats] = useState(mockStats);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterCurrency, setFilterCurrency] = useState('all');

  // 充值对话框
  const [rechargeDialog, setRechargeDialog] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<any>(null);
  const [rechargeAmount, setRechargeAmount] = useState('');
  const [rechargeCurrency, setRechargeCurrency] = useState('CNY');

  // 兑换对话框
  const [exchangeDialog, setExchangeDialog] = useState(false);
  const [exchangeFrom, setExchangeFrom] = useState('CNY');
  const [exchangeTo, setExchangeTo] = useState('USD');
  const [exchangeAmount, setExchangeAmount] = useState('');
  const [exchangeResult, setExchangeResult] = useState(0);

  useEffect(() => {
    let filtered = accounts;

    if (searchTerm) {
      filtered = filtered.filter(acc =>
        acc.user_name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterStatus !== 'all') {
      filtered = filtered.filter(acc => acc.account_status === filterStatus);
    }

    if (filterCurrency !== 'all') {
      filtered = filtered.filter(acc => acc.currency === filterCurrency);
    }

    setAccounts(filtered);
  }, [searchTerm, filterStatus, filterCurrency]);

  useEffect(() => {
    // 计算兑换结果
    if (exchangeAmount && exchangeFrom && exchangeTo) {
      const fromRate = rates.find(r => r.currency === exchangeFrom)?.rate || 1;
      const toRate = rates.find(r => r.currency === exchangeTo)?.rate || 1;
      const result = (parseFloat(exchangeAmount) / fromRate) * toRate;
      setExchangeResult(result);
    } else {
      setExchangeResult(0);
    }
  }, [exchangeAmount, exchangeFrom, exchangeTo, rates]);

  const getTypeLabel = (type: string) => {
    const labels = {
      enterprise: '企业用户',
      'repair-shop': '维修店',
      'foreign-trade': '外贸公司',
    };
    return labels[type as keyof typeof labels] || type;
  };

  const getTransactionTypeChip = (type: string) => {
    const config = {
      recharge: { label: '充值', color: 'success', icon: Add },
      withdraw: { label: '提现', color: 'error', icon: Remove },
      exchange: { label: '兑换', color: 'info', icon: SwapHoriz },
      transfer: { label: '转账', color: 'warning', icon: MonetizationOn },
    };

    const {
      label,
      color,
      icon: Icon,
    } = config[type as keyof typeof config] || config.recharge;

    return (
      <Chip
        label={label}
        color={color as any}
        size="small"
        icon={<Icon fontSize="small" />}
      />
    );
  };

  const getAccountStatusChip = (status: string) => {
    const config = {
      active: { label: '正常', color: 'success' },
      frozen: { label: '冻结', color: 'error' },
      closed: { label: '关闭', color: 'default' },
    };

    const { label, color } =
      config[status as keyof typeof config] || config.active;

    return <Chip label={label} color={color as any} size="small" />;
  };

  const handleRefresh = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  };

  const handleRecharge = () => {
    setRechargeDialog(false);
    alert(
      `为 ${selectedAccount?.user_name} 充值 ${rechargeAmount} ${rechargeCurrency}`
    );
    setRechargeAmount('');
  };

  const handleExchange = () => {
    setExchangeDialog(false);
    alert(
      `兑换 ${exchangeAmount} ${exchangeFrom} → ${exchangeResult.toFixed(2)} ${exchangeTo}`
    );
    setExchangeAmount('');
  };

  const StatCard = ({ title, value, subtitle, icon: Icon, color }: any) => (
    <Card>
      <CardContent>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Box>
            <Typography color="textSecondary" gutterBottom variant="body2">
              {title}
            </Typography>
            <Typography variant="h4" color={color}>
              {value.toLocaleString()}
            </Typography>
            {subtitle && (
              <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                {subtitle}
              </Typography>
            )}
          </Box>
          <Icon sx={{ fontSize: 40, color: color || 'primary.main' }} />
        </Box>
      </CardContent>
    </Card>
  );

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          FXC 统一管理
        </Typography>
        <Typography variant="body1" color="textSecondary">
          管理所有用户的 FXC 账户、交易和汇率
        </Typography>
      </Box>

      {/* 统计卡片 */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="总账户数"
            value={stats.totalAccounts}
            subtitle="冻结: {stats.frozenAccounts}"
            icon={AccountBalance}
            color="primary.main"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="总余额"
            value={stats.totalBalance}
            subtitle="约 {(stats.totalBalance / 7.2450).toFixed(0)} USD"
            icon={MonetizationOn}
            color="success.main"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="今日交易量"
            value={stats.todayVolume}
            subtitle="{stats.todayTransactions} 笔"
            icon={CurrencyExchange}
            color="info.main"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="待处理交易"
            value={stats.pendingTransactions}
            subtitle="需要审核"
            icon={Warning}
            color="warning.main"
          />
        </Grid>
      </Grid>

      {/* 实时汇率 */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="subtitle1" gutterBottom>
          实时汇率 (基准: CNY)
        </Typography>
        <Grid container spacing={2}>
          {rates.map(rate => (
            <Grid item xs={12} sm={6} md={2.4} key={rate.currency}>
              <Card variant="outlined">
                <CardContent sx={{ textAlign: 'center', py: 1 }}>
                  <Typography variant="h5">
                    {rate.symbol}
                    {rate.rate.toFixed(4)}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    {rate.name} ({rate.currency})
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Paper>

      {/* 待处理警告 */}
      {stats.pendingTransactions > 0 && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          <Typography variant="body2">
            有 <strong>{stats.pendingTransactions}</strong>{' '}
            笔交易待处理，请及时审核
          </Typography>
        </Alert>
      )}

      {/* 过滤和搜索 */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              size="small"
              placeholder="搜索用户"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <Search sx={{ mr: 1, color: 'text.secondary' }} />
                ),
              }}
            />
          </Grid>
          <Grid item xs={6} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel>账户状态</InputLabel>
              <Select
                value={filterStatus}
                onChange={e => setFilterStatus(e.target.value)}
                label="账户状态"
              >
                <MenuItem value="all">全部</MenuItem>
                <MenuItem value="active">正常</MenuItem>
                <MenuItem value="frozen">冻结</MenuItem>
                <MenuItem value="closed">关闭</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={6} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel>币种</InputLabel>
              <Select
                value={filterCurrency}
                onChange={e => setFilterCurrency(e.target.value)}
                label="币种"
              >
                <MenuItem value="all">全部</MenuItem>
                {rates.map(rate => (
                  <MenuItem key={rate.currency} value={rate.currency}>
                    {rate.currency}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={4} sx={{ textAlign: 'right' }}>
            <Button
              variant="outlined"
              startIcon={<Refresh />}
              onClick={handleRefresh}
              disabled={loading}
            >
              刷新
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* FXC 账户列表 */}
      <Paper sx={{ mb: 3 }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>用户</TableCell>
                <TableCell>类型</TableCell>
                <TableCell>余额</TableCell>
                <TableCell>币种</TableCell>
                <TableCell>状态</TableCell>
                <TableCell>最后交易</TableCell>
                <TableCell align="center">操作</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {accounts.map(account => (
                <TableRow key={account.id} hover>
                  <TableCell>
                    <Typography variant="body2" fontWeight="medium">
                      {account.user_name}
                    </Typography>
                  </TableCell>
                  <TableCell>{getTypeLabel(account.business_type)}</TableCell>
                  <TableCell>
                    <Typography
                      variant="body2"
                      fontWeight="bold"
                      color="success.main"
                    >
                      {account.balance.toLocaleString()}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={account.currency}
                      size="small"
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>
                    {getAccountStatusChip(account.account_status)}
                  </TableCell>
                  <TableCell>{account.last_transaction}</TableCell>
                  <TableCell align="center">
                    <Tooltip title="充值">
                      <IconButton
                        size="small"
                        onClick={() => {
                          setSelectedAccount(account);
                          setRechargeDialog(true);
                        }}
                      >
                        <Add fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="兑换">
                      <IconButton size="small">
                        <SwapHoriz fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* 最近交易记录 */}
      <Paper>
        <Box sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>
            最近交易记录
          </Typography>
        </Box>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>交易ID</TableCell>
                <TableCell>用户</TableCell>
                <TableCell>类型</TableCell>
                <TableCell align="right">金额</TableCell>
                <TableCell>汇率</TableCell>
                <TableCell>状态</TableCell>
                <TableCell>时间</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {transactions.slice(0, 10).map(tx => (
                <TableRow key={tx.id} hover>
                  <TableCell>{tx.id}</TableCell>
                  <TableCell>{tx.user_name}</TableCell>
                  <TableCell>{getTransactionTypeChip(tx.type)}</TableCell>
                  <TableCell align="right">
                    <Typography
                      color={tx.amount > 0 ? 'success.main' : 'error.main'}
                    >
                      {tx.amount > 0 ? '+' : ''}
                      {tx.amount} {tx.from_currency}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    {tx.exchange_rate
                      ? `1 ${tx.from_currency} = ${tx.exchange_rate} ${tx.to_currency}`
                      : '-'}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={tx.status}
                      size="small"
                      color={tx.status === 'completed' ? 'success' : 'warning'}
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>{tx.created_at}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* 充值对话框 */}
      <Dialog
        open={rechargeDialog}
        onClose={() => setRechargeDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>FXC 充值 - {selectedAccount?.user_name}</DialogTitle>
        <DialogContent>
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>选择币种</InputLabel>
            <Select
              value={rechargeCurrency}
              onChange={e => setRechargeCurrency(e.target.value)}
              label="选择币种"
            >
              {rates.map(rate => (
                <MenuItem key={rate.currency} value={rate.currency}>
                  {rate.name} ({rate.currency})
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            autoFocus
            margin="dense"
            label="充值金额"
            type="number"
            fullWidth
            variant="outlined"
            value={rechargeAmount}
            onChange={e => setRechargeAmount(e.target.value)}
            sx={{ mt: 2 }}
            helperText="请输入要充值的金额"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRechargeDialog(false)}>取消</Button>
          <Button
            onClick={handleRecharge}
            variant="contained"
            disabled={!rechargeAmount}
          >
            确认充值
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
