'use client';

import {
  AccountBalance,
  Add,
  History,
  MonetizationOn,
  Payment,
  Refresh,
  Remove,
  Search,
  TrendingUp,
} from '@mui/icons-material';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  LinearProgress,
  MenuItem,
  Paper,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import { useEffect, useState } from 'react';

// Mock 数据
const mockTokenBalances = [
  {
    id: '1',
    user_id: 'u001',
    user_name: '张三 (企业用户)',
    business_type: 'enterprise',
    balance_free: 50000,
    balance_paid: 250000,
    balance_promotion: 0,
    total: 300000,
    last_recharge: '2026-03-15',
    last_used: '2026-03-17',
  },
  {
    id: '2',
    user_id: 'u002',
    user_name: '李四 (维修店)',
    business_type: 'repair-shop',
    balance_free: 10000,
    balance_paid: 50000,
    balance_promotion: 5000,
    total: 65000,
    last_recharge: '2026-03-10',
    last_used: '2026-03-17',
  },
  {
    id: '3',
    user_id: 'u003',
    user_name: '王五 (外贸公司)',
    business_type: 'foreign-trade',
    balance_free: 5000,
    balance_paid: 20000,
    balance_promotion: 0,
    total: 25000,
    last_recharge: '2026-03-01',
    last_used: '2026-03-16',
  },
  {
    id: '4',
    user_id: 'u004',
    user_name: '赵六 (维修店)',
    business_type: 'repair-shop',
    balance_free: 2000,
    balance_paid: 10000,
    balance_promotion: 1000,
    total: 13000,
    last_recharge: '2026-03-12',
    last_used: '2026-03-17',
  },
];

const mockTransactions = [
  {
    id: 't001',
    user_id: 'u001',
    user_name: '张三 (企业用户)',
    type: 'recharge',
    amount: 50000,
    package_id: 'pkg1',
    package_name: '企业套餐 - 50000 Token',
    status: 'completed',
    created_at: '2026-03-15 14:30',
  },
  {
    id: 't002',
    user_id: 'u002',
    user_name: '李四 (维修店)',
    type: 'consume',
    amount: -500,
    description: '故障诊断API调用',
    status: 'completed',
    created_at: '2026-03-17 10:20',
  },
  {
    id: 't003',
    user_id: 'u003',
    user_name: '王五 (外贸公司)',
    type: 'refund',
    amount: 2000,
    description: '订单退款',
    status: 'completed',
    created_at: '2026-03-16 16:45',
  },
  {
    id: 't004',
    user_id: 'u001',
    user_name: '张三 (企业用户)',
    type: 'consume',
    amount: -1200,
    description: '智能体调用',
    status: 'completed',
    created_at: '2026-03-17 09:15',
  },
  {
    id: 't005',
    user_id: 'u004',
    user_name: '赵六 (维修店)',
    type: 'promotion',
    amount: 1000,
    description: '新用户赠送',
    status: 'completed',
    created_at: '2026-03-12 08:00',
  },
];

const mockStats = {
  totalUsers: 12450,
  totalBalance: 8543200,
  totalFreeTokens: 1523000,
  totalPaidTokens: 6850000,
  totalPromotionTokens: 170200,
  todayRecharges: 156,
  todayRechargeAmount: 780000,
  todayConsumption: 245000,
  averageBalance: 686,
  lowBalanceUsers: 234,
};

export default function TokensManagementPage() {
  const [stats] = useState(mockStats);
  const [transactions] = useState(mockTransactions);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filteredBalances, setFilteredBalances] =
    useState<any[]>(mockTokenBalances);

  // 充值对话框
  const [rechargeDialog, setRechargeDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [rechargeAmount, setRechargeAmount] = useState('');

  // 交易记录对话框
  const [historyDialog, setHistoryDialog] = useState(false);
  const [historyUser, setHistoryUser] = useState<any>(null);

  // 过滤数据 - 使用 useMemo 避免在渲染期间更新状态
  useEffect(() => {
    let filtered = mockTokenBalances;

    if (searchTerm) {
      filtered = filtered.filter(b =>
        b.user_name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterType !== 'all') {
      filtered = filtered.filter(b => b.business_type === filterType);
    }

    // 异步更新，避免在渲染期间同步调用 setState
    setTimeout(() => {
      setFilteredBalances(filtered);
    }, 0);
  }, [searchTerm, filterType]);

  const getTypeLabel = (type: string) => {
    const labels = {
      enterprise: '企业用户',
      'repair-shop': '维修店',
      'foreign-trade': '外贸公司',
    };
    return labels[type as keyof typeof labels] || type;
  };

  const getTypeColor = (type: string) => {
    const colors = {
      enterprise: 'primary',
      'repair-shop': 'success',
      'foreign-trade': 'info',
    };
    return colors[type as keyof typeof colors] || 'default';
  };

  const getTransactionTypeChip = (type: string) => {
    const config = {
      recharge: { label: '充值', color: 'success', icon: Add },
      consume: { label: '消费', color: 'error', icon: Remove },
      refund: { label: '退款', color: 'warning', icon: MonetizationOn },
      promotion: { label: '赠送', color: 'info', icon: AccountBalance },
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

  const handleRefresh = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  };

  const handleRecharge = () => {
    setRechargeDialog(false);
    // TODO: 调用充值API
    alert(`为 ${selectedUser.user_name} 充值 ${rechargeAmount} Token`);
    setRechargeAmount('');
  };

  const handleViewHistory = (user: any) => {
    setHistoryUser(user);
    setHistoryDialog(true);
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
    <Container maxWidth="xl" sx={{ mt: 0, mb: 4 }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Token 统一管理
        </Typography>
        <Typography variant="body1" color="textSecondary">
          管理所有用户的 Token 余额、充值和消费记录
        </Typography>
      </Box>

      {/* 统计卡片 */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="总用户数"
            value={stats.totalUsers}
            subtitle="平均余额：{stats.averageBalance}"
            icon={AccountBalance}
            color="primary.main"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="Token 总余额"
            value={stats.totalBalance}
            subtitle="免费：{stats.totalFreeTokens.toLocaleString()}"
            icon={MonetizationOn}
            color="success.main"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="今日充值"
            value={stats.todayRechargeAmount}
            subtitle="{stats.todayRecharges} 笔"
            icon={Payment}
            color="info.main"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="今日消费"
            value={stats.todayConsumption}
            subtitle="余额不足：{stats.lowBalanceUsers} 人"
            icon={TrendingUp}
            color="warning.main"
          />
        </Grid>
      </Grid>

      {/* Token 分布 */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, md: 4 }}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom variant="body2">
                付费 Token
              </Typography>
              <Typography variant="h3" color="success.main">
                {stats.totalPaidTokens.toLocaleString()}
              </Typography>
              <Box sx={{ mt: 2 }}>
                <LinearProgress
                  variant="determinate"
                  value={(stats.totalPaidTokens / stats.totalBalance) * 100}
                />
              </Box>
              <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                占比{' '}
                {((stats.totalPaidTokens / stats.totalBalance) * 100).toFixed(
                  1
                )}
                %
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom variant="body2">
                免费 Token
              </Typography>
              <Typography variant="h3" color="info.main">
                {stats.totalFreeTokens.toLocaleString()}
              </Typography>
              <Box sx={{ mt: 2 }}>
                <LinearProgress
                  variant="determinate"
                  value={(stats.totalFreeTokens / stats.totalBalance) * 100}
                  color="info"
                />
              </Box>
              <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                占比{' '}
                {((stats.totalFreeTokens / stats.totalBalance) * 100).toFixed(
                  1
                )}
                %
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom variant="body2">
                赠送 Token
              </Typography>
              <Typography variant="h3" color="warning.main">
                {stats.totalPromotionTokens.toLocaleString()}
              </Typography>
              <Box sx={{ mt: 2 }}>
                <LinearProgress
                  variant="determinate"
                  value={
                    (stats.totalPromotionTokens / stats.totalBalance) * 100
                  }
                  color="warning"
                />
              </Box>
              <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                占比{' '}
                {(
                  (stats.totalPromotionTokens / stats.totalBalance) *
                  100
                ).toFixed(1)}
                %
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* 低余额警告 */}
      {stats.lowBalanceUsers > 0 && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          <Typography variant="body2">
            有 <strong>{stats.lowBalanceUsers}</strong> 位用户 Token 余额不足
            1000，建议提醒充值
          </Typography>
        </Alert>
      )}

      {/* 过滤和搜索 */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              size="small"
              placeholder="搜索用户名称"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <Search sx={{ mr: 1, color: 'text.secondary' }} />
                ),
              }}
            />
          </Grid>
          <Grid size={{ xs: 6, md: 3 }}>
            <FormControl fullWidth size="small">
              <InputLabel>用户类型</InputLabel>
              <Select
                value={filterType}
                onChange={e => setFilterType(e.target.value)}
                label="用户类型"
              >
                <MenuItem value="all">全部</MenuItem>
                <MenuItem value="enterprise">企业用户</MenuItem>
                <MenuItem value="repair-shop">维修店</MenuItem>
                <MenuItem value="foreign-trade">外贸公司</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 6, md: 3 }} sx={{ textAlign: 'right' }}>
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

      {/* Token 余额列表 */}
      <Paper sx={{ mb: 3 }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>用户</TableCell>
                <TableCell>类型</TableCell>
                <TableCell align="right">免费 Token</TableCell>
                <TableCell align="right">付费 Token</TableCell>
                <TableCell align="right">赠送 Token</TableCell>
                <TableCell align="right">总余额</TableCell>
                <TableCell>最后充值</TableCell>
                <TableCell>最后使用</TableCell>
                <TableCell align="center">操作</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredBalances.map(balance => (
                <TableRow key={balance.id} hover>
                  <TableCell>
                    <Typography variant="body2" fontWeight="medium">
                      {balance.user_name}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={getTypeLabel(balance.business_type)}
                      size="small"
                      color={getTypeColor(balance.business_type) as any}
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell align="right">
                    {balance.balance_free.toLocaleString()}
                  </TableCell>
                  <TableCell align="right">
                    {balance.balance_paid.toLocaleString()}
                  </TableCell>
                  <TableCell align="right">
                    {balance.balance_promotion.toLocaleString()}
                  </TableCell>
                  <TableCell align="right">
                    <Typography
                      variant="body2"
                      fontWeight="bold"
                      color="primary.main"
                    >
                      {balance.total.toLocaleString()}
                    </Typography>
                  </TableCell>
                  <TableCell>{balance.last_recharge}</TableCell>
                  <TableCell>{balance.last_used}</TableCell>
                  <TableCell align="center">
                    <Tooltip title="充值">
                      <IconButton
                        size="small"
                        onClick={() => {
                          setSelectedUser(balance);
                          setRechargeDialog(true);
                        }}
                      >
                        <Add fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="消费记录">
                      <IconButton
                        size="small"
                        onClick={() => handleViewHistory(balance)}
                      >
                        <History fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
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
        <DialogTitle>Token 充值 - {selectedUser?.user_name}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="充值数量"
            type="number"
            fullWidth
            variant="outlined"
            value={rechargeAmount}
            onChange={e => setRechargeAmount(e.target.value)}
            helperText="请输入要充值的 Token 数量"
          />
          <Stack spacing={1} sx={{ mt: 2 }}>
            <Typography variant="body2" color="textSecondary">
              快捷充值：
            </Typography>
            <Stack direction="row" spacing={1}>
              {[1000, 5000, 10000, 50000, 100000].map(amount => (
                <Button
                  key={amount}
                  size="small"
                  variant="outlined"
                  onClick={() => setRechargeAmount(amount.toString())}
                >
                  {amount}
                </Button>
              ))}
            </Stack>
          </Stack>
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

      {/* 交易记录对话框 */}
      <Dialog
        open={historyDialog}
        onClose={() => setHistoryDialog(false)}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>交易记录 - {historyUser?.user_name}</DialogTitle>
        <DialogContent>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>交易ID</TableCell>
                  <TableCell>类型</TableCell>
                  <TableCell align="right">数量</TableCell>
                  <TableCell>说明</TableCell>
                  <TableCell>状态</TableCell>
                  <TableCell>时间</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {transactions
                  .filter(t => t.user_id === historyUser?.user_id)
                  .map(tx => (
                    <TableRow key={tx.id} hover>
                      <TableCell>{tx.id}</TableCell>
                      <TableCell>{getTransactionTypeChip(tx.type)}</TableCell>
                      <TableCell align="right">
                        <Typography
                          color={tx.amount > 0 ? 'success.main' : 'error.main'}
                        >
                          {tx.amount > 0 ? '+' : ''}
                          {tx.amount}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        {tx.description || tx.package_name || '-'}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={tx.status}
                          size="small"
                          color="success"
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>{tx.created_at}</TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </TableContainer>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setHistoryDialog(false)}>关闭</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
