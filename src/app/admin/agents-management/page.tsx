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
  LinearProgress,
  Tab,
  Tabs,
  Alert,
  Tooltip,
} from '@mui/material';
import {
  Refresh,
  Search,
  Visibility,
  Edit,
  Delete,
  Settings,
  Analytics,
  CheckCircle,
  Warning,
  Error,
  TrendingUp,
  TrendingDown,
} from '@mui/icons-material';

// Mock 数据 - 基于真实的已上线智能体
const mockAgents = [
  {
    id: '1',
    agent_id: 'uuid-1',
    agent_name: '设备故障诊断智能体',
    user_id: 'u001',
    user_name: '张三 (企业用户)',
    business_type: 'enterprise',
    author_name: '3CEP 智能维修',
    version: '2.1.0',
    status: 'active',
    pricing_type: 'subscription',
    pricing_price: 29,
    pricing_unit: '月',
    expiry_date: '2026-06-17',
    requests_this_month: 12500,
    tokens_used: 85000,
    avg_response_time: 0.8,
    last_used: '2026-03-17 14:30',
    rating: 4.92,
    review_count: 342,
    usage_count: 12340,
  },
  {
    id: '2',
    agent_id: 'uuid-2',
    agent_name: '配件查询智能体',
    user_id: 'u002',
    user_name: '李四 (维修店)',
    business_type: 'repair-shop',
    author_name: '3CEP 配件商城',
    version: '1.4.0',
    status: 'expiring',
    pricing_type: 'subscription',
    pricing_price: 29,
    pricing_unit: '月',
    expiry_date: '2026-03-20',
    requests_this_month: 8300,
    tokens_used: 42000,
    avg_response_time: 0.6,
    last_used: '2026-03-17 12:15',
    rating: 4.8,
    review_count: 189,
    usage_count: 9870,
  },
  {
    id: '3',
    agent_id: 'uuid-3',
    agent_name: '智能客服助手',
    user_id: 'u003',
    user_name: '王五 (外贸公司)',
    business_type: 'foreign-trade',
    author_name: '3CEP Team',
    version: '2.0.0',
    status: 'expired',
    pricing_type: 'subscription',
    pricing_price: 29,
    pricing_unit: '月',
    expiry_date: '2026-03-10',
    requests_this_month: 0,
    tokens_used: 128000,
    avg_response_time: 1.2,
    last_used: '2026-03-09 18:45',
    rating: 4.65,
    review_count: 203,
    usage_count: 15430,
  },
  {
    id: '4',
    agent_id: 'uuid-4',
    agent_name: '售后智能体',
    user_id: 'u004',
    user_name: '赵六 (维修店)',
    business_type: 'repair-shop',
    author_name: '3CEP 企业服务',
    version: '1.4.0',
    status: 'active',
    pricing_type: 'subscription',
    pricing_price: 29,
    pricing_unit: '月',
    expiry_date: '2026-09-17',
    requests_this_month: 5600,
    tokens_used: 31000,
    avg_response_time: 0.7,
    last_used: '2026-03-17 15:20',
    rating: 4.82,
    review_count: 198,
    usage_count: 8920,
  },
  {
    id: '5',
    agent_id: 'uuid-5',
    agent_name: '数据分析助手',
    user_id: 'u005',
    user_name: '孙七 (外贸公司)',
    business_type: 'foreign-trade',
    author_name: '3CEP Team',
    version: '1.3.0',
    status: 'suspended',
    pricing_type: 'subscription',
    pricing_price: 29,
    pricing_unit: '月',
    expiry_date: '2026-12-31',
    requests_this_month: 3200,
    tokens_used: 18000,
    avg_response_time: 0.9,
    last_used: '2026-03-16 09:30',
    rating: 4.9,
    review_count: 156,
    usage_count: 8920,
  },
  {
    id: '6',
    agent_id: 'uuid-6',
    agent_name: '客服智能体',
    user_id: 'u001',
    user_name: '张三 (企业用户)',
    business_type: 'enterprise',
    author_name: '3CEP 企业服务',
    version: '1.5.0',
    status: 'active',
    pricing_type: 'subscription',
    pricing_price: 29,
    pricing_unit: '月',
    expiry_date: '2026-07-17',
    requests_this_month: 9800,
    tokens_used: 72000,
    avg_response_time: 0.65,
    last_used: '2026-03-17 16:00',
    rating: 4.78,
    review_count: 312,
    usage_count: 12890,
  },
];

const mockStats = {
  totalSubscriptions: 12847,
  activeSubscriptions: 11256,
  expiringSoon: 312,
  expired: 279,
  totalRequestsThisMonth: 2847500,
  totalTokensUsed: 152340000,
  avgResponseTime: 0.85,
  growthRate: 12.5,
};

export default function AgentsManagementPage() {
  const [tabValue, setTabValue] = useState(0);
  const [agents, setAgents] = useState(mockAgents);
  const [filteredAgents, setFilteredAgents] = useState(mockAgents);
  const [stats, setStats] = useState(mockStats);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');

  // 详情对话框
  const [detailDialog, setDetailDialog] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<any>(null);

  // 统计筛选
  useEffect(() => {
    let filtered = agents;

    if (searchTerm) {
      filtered = filtered.filter(
        agent =>
          agent.agent_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          agent.user_name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterStatus !== 'all') {
      filtered = filtered.filter(agent => agent.status === filterStatus);
    }

    if (filterType !== 'all') {
      filtered = filtered.filter(agent => agent.business_type === filterType);
    }

    setFilteredAgents(filtered);
  }, [agents, searchTerm, filterStatus, filterType]);

  const getStatusChip = (status: string) => {
    const config = {
      active: { label: '运行中', color: 'success', icon: CheckCircle },
      expiring: { label: '即将到期', color: 'warning', icon: Warning },
      expired: { label: '已过期', color: 'error', icon: Error },
      suspended: { label: '已暂停', color: 'default', icon: Error },
    };

    const {
      label,
      color,
      icon: Icon,
    } = config[status as keyof typeof config] || config.active;

    return (
      <Chip
        label={label}
        color={color as any}
        size="small"
        icon={<Icon fontSize="small" />}
      />
    );
  };

  const getTypeLabel = (type: string) => {
    const labels = {
      enterprise: '企业用户',
      'repair-shop': '维修店',
      'foreign-trade': '外贸公司',
    };
    return labels[type as keyof typeof labels] || type;
  };

  const handleRefresh = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  };

  const handleViewDetail = (agent: any) => {
    setSelectedAgent(agent);
    setDetailDialog(true);
  };

  const StatCard = ({ title, value, subtitle, icon: Icon, trend }: any) => (
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
            <Typography variant="h4">{value.toLocaleString()}</Typography>
            {subtitle && (
              <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                {subtitle}
              </Typography>
            )}
          </Box>
          <Icon sx={{ fontSize: 40, color: 'primary.main' }} />
        </Box>
        {trend && (
          <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
            {trend > 0 ? (
              <TrendingUp color="success" fontSize="small" />
            ) : (
              <TrendingDown color="error" fontSize="small" />
            )}
            <Typography
              variant="body2"
              color={trend > 0 ? 'success.main' : 'error.main'}
              sx={{ ml: 1 }}
            >
              {trend > 0 ? '+' : ''}
              {trend}% 较上月
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          智能体统一管理
        </Typography>
        <Typography variant="body1" color="textSecondary">
          管理所有用户的智能体订阅、配置和使用统计
        </Typography>
      </Box>

      {/* 统计卡片 */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="总订阅数"
            value={stats.totalSubscriptions}
            icon={Analytics}
            trend={stats.growthRate}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="运行中"
            value={stats.activeSubscriptions}
            subtitle="占比 87.6%"
            icon={CheckCircle}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="即将到期"
            value={stats.expiringSoon}
            subtitle="7天内到期"
            icon={Warning}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="已过期" value={stats.expired} icon={Error} />
        </Grid>
      </Grid>

      {/* 使用统计 */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom variant="body2">
                本月请求总数
              </Typography>
              <Typography variant="h3">
                {stats.totalRequestsThisMonth.toLocaleString()}
              </Typography>
              <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                平均响应时间: {stats.avgResponseTime}s
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom variant="body2">
                本月 Token 消耗
              </Typography>
              <Typography variant="h3">
                {(stats.totalTokensUsed / 1000000).toFixed(2)}M
              </Typography>
              <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                约 {(stats.totalTokensUsed / 1000).toFixed(0)} 元
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom variant="body2">
                系统健康度
              </Typography>
              <Typography variant="h3" color="success.main">
                99.2%
              </Typography>
              <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                所有服务正常运行
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* 过滤和搜索 */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              size="small"
              placeholder="搜索智能体或用户"
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
              <InputLabel>状态</InputLabel>
              <Select
                value={filterStatus}
                onChange={e => setFilterStatus(e.target.value)}
                label="状态"
              >
                <MenuItem value="all">全部</MenuItem>
                <MenuItem value="active">运行中</MenuItem>
                <MenuItem value="expiring">即将到期</MenuItem>
                <MenuItem value="expired">已过期</MenuItem>
                <MenuItem value="suspended">已暂停</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={6} md={2}>
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

      {/* 智能体列表 */}
      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>智能体名称</TableCell>
                <TableCell>作者</TableCell>
                <TableCell>用户</TableCell>
                <TableCell>类型</TableCell>
                <TableCell>版本</TableCell>
                <TableCell>价格</TableCell>
                <TableCell>评分</TableCell>
                <TableCell>状态</TableCell>
                <TableCell>到期时间</TableCell>
                <TableCell align="right">本月请求</TableCell>
                <TableCell>最后使用</TableCell>
                <TableCell align="center">操作</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredAgents.map(agent => (
                <TableRow key={agent.id} hover>
                  <TableCell>
                    <Box>
                      <Typography variant="body2" fontWeight="medium">
                        {agent.agent_name}
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        ID: {agent.agent_id}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>{agent.author_name}</TableCell>
                  <TableCell>{agent.user_name}</TableCell>
                  <TableCell>
                    <Chip
                      label={getTypeLabel(agent.business_type)}
                      size="small"
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>v{agent.version}</TableCell>
                  <TableCell>
                    <Typography
                      variant="body2"
                      fontWeight="bold"
                      color="primary.main"
                    >
                      ¥{agent.pricing_price}/{agent.pricing_unit}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Box
                      sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}
                    >
                      <Typography variant="body2" fontWeight="medium">
                        {agent.rating.toFixed(1)}
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        ({agent.review_count})
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>{getStatusChip(agent.status)}</TableCell>
                  <TableCell>{agent.expiry_date}</TableCell>
                  <TableCell align="right">
                    {agent.requests_this_month.toLocaleString()}
                  </TableCell>
                  <TableCell>{agent.last_used}</TableCell>
                  <TableCell align="center">
                    <Tooltip title="查看详情">
                      <IconButton
                        size="small"
                        onClick={() => handleViewDetail(agent)}
                      >
                        <Visibility fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="编辑">
                      <IconButton size="small">
                        <Edit fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="设置">
                      <IconButton size="small">
                        <Settings fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* 详情对话框 */}
      <Dialog
        open={detailDialog}
        onClose={() => setDetailDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>智能体详情</DialogTitle>
        <DialogContent>
          {selectedAgent && (
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="textSecondary">
                  智能体名称
                </Typography>
                <Typography variant="body1" fontWeight="medium">
                  {selectedAgent.agent_name}
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="textSecondary">
                  智能体ID
                </Typography>
                <Typography variant="body1">
                  {selectedAgent.agent_id}
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="textSecondary">
                  作者
                </Typography>
                <Typography variant="body1">
                  {selectedAgent.author_name}
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="textSecondary">
                  订阅用户
                </Typography>
                <Typography variant="body1">
                  {selectedAgent.user_name}
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="textSecondary">
                  业务类型
                </Typography>
                <Typography variant="body1">
                  {getTypeLabel(selectedAgent.business_type)}
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="textSecondary">
                  版本
                </Typography>
                <Typography variant="body1">
                  v{selectedAgent.version}
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="textSecondary">
                  价格
                </Typography>
                <Typography
                  variant="body1"
                  fontWeight="bold"
                  color="primary.main"
                >
                  ¥{selectedAgent.pricing_price}/{selectedAgent.pricing_unit}
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="textSecondary">
                  评分
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="body1" fontWeight="medium">
                    {selectedAgent.rating.toFixed(1)}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    ({selectedAgent.review_count} 评价)
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="textSecondary">
                  状态
                </Typography>
                <Box>{getStatusChip(selectedAgent.status)}</Box>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="textSecondary">
                  到期时间
                </Typography>
                <Typography variant="body1">
                  {selectedAgent.expiry_date}
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="textSecondary">
                  本月请求
                </Typography>
                <Typography variant="body1">
                  {selectedAgent.requests_this_month.toLocaleString()}
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="textSecondary">
                  Token消耗
                </Typography>
                <Typography variant="body1">
                  {selectedAgent.tokens_used.toLocaleString()}
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="textSecondary">
                  平均响应时间
                </Typography>
                <Typography variant="body1">
                  {selectedAgent.avg_response_time}s
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="textSecondary">
                  最后使用
                </Typography>
                <Typography variant="body1">
                  {selectedAgent.last_used}
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="textSecondary">
                  总使用量
                </Typography>
                <Typography variant="body1">
                  {selectedAgent.usage_count.toLocaleString()}
                </Typography>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailDialog(false)}>关闭</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
