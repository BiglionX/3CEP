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
  Avatar,
  LinearProgress,
  Stack,
  Switch,
} from '@mui/material';
import {
  Refresh,
  Search,
  Visibility,
  Edit,
  Delete,
  Approve,
  Publish,
  Preview,
  Image,
  Description,
  Link as LinkIcon,
  TrendingUp,
  Warning,
  CheckCircle,
  Pending,
  Close,
} from '@mui/icons-material';

// Mock 数据
const mockPortals = [
  {
    id: '1',
    user_id: 'u001',
    user_name: '张三',
    business_type: 'enterprise',
    portal_name: 'Procyc 企业门户',
    portal_description: '专业的企业级智能体解决方案',
    business_links_count: 5,
    promotional_images_count: 3,
    blog_posts_count: 7,
    view_count: 15230,
    share_count: 456,
    is_published: true,
    approval_status: 'approved',
    created_at: '2026-02-15',
    last_updated: '2026-03-17',
  },
  {
    id: '2',
    user_id: 'u002',
    user_name: '李四',
    business_type: 'repair-shop',
    portal_name: '李四维修店',
    portal_description: '专业汽车维修服务',
    business_links_count: 3,
    promotional_images_count: 2,
    blog_posts_count: 0,
    view_count: 8560,
    share_count: 234,
    is_published: true,
    approval_status: 'approved',
    created_at: '2026-02-20',
    last_updated: '2026-03-15',
  },
  {
    id: '3',
    user_id: 'u003',
    user_name: '王五',
    business_type: 'foreign-trade',
    portal_name: '全球贸易通',
    portal_description: '一站式外贸服务',
    business_links_count: 4,
    promotional_images_count: 5,
    blog_posts_count: 3,
    view_count: 12500,
    share_count: 378,
    is_published: false,
    approval_status: 'pending',
    created_at: '2026-03-10',
    last_updated: '2026-03-16',
  },
  {
    id: '4',
    user_name: '赵六',
    business_type: 'repair-shop',
    portal_name: '赵六汽修',
    portal_description: '快速维修，质量保证',
    business_links_count: 2,
    promotional_images_count: 1,
    blog_posts_count: 0,
    view_count: 3200,
    share_count: 89,
    is_published: false,
    approval_status: 'pending',
    created_at: '2026-03-12',
    last_updated: '2026-03-14',
  },
];

const mockStats = {
  totalPortals: 12847,
  publishedPortals: 11256,
  pendingPortals: 312,
  rejectedPortals: 279,
  totalViews: 2847500,
  totalShares: 45678,
  activePortals: 12000,
  thisMonthNew: 234,
};

export default function PortalsManagementPage() {
  const [tabValue, setTabValue] = useState(0);
  const [portals, setPortals] = useState(mockPortals);
  const [stats, setStats] = useState(mockStats);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [filterPublished, setFilterPublished] = useState('all');

  // 详情对话框
  const [detailDialog, setDetailDialog] = useState(false);
  const [selectedPortal, setSelectedPortal] = useState<any>(null);

  // 预览对话框
  const [previewDialog, setPreviewDialog] = useState(false);
  const [previewPortal, setPreviewPortal] = useState<any>(null);

  useEffect(() => {
    let filtered = portals;

    if (searchTerm) {
      filtered = filtered.filter(
        p =>
          p.portal_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.user_name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterStatus !== 'all') {
      filtered = filtered.filter(p => p.approval_status === filterStatus);
    }

    if (filterType !== 'all') {
      filtered = filtered.filter(p => p.business_type === filterType);
    }

    if (filterPublished !== 'all') {
      const isPublished = filterPublished === 'published';
      filtered = filtered.filter(p => p.is_published === isPublished);
    }

    setPortals(filtered);
  }, [searchTerm, filterStatus, filterType, filterPublished]);

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

  const getStatusChip = (status: string) => {
    const config = {
      approved: { label: '已通过', color: 'success', icon: CheckCircle },
      pending: { label: '待审核', color: 'warning', icon: Pending },
      rejected: { label: '已拒绝', color: 'error', icon: Close },
    };

    const {
      label,
      color,
      icon: Icon,
    } = config[status as keyof typeof config] || config.approved;

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

  const handleApprove = (portal: any) => {
    alert(`批准门户: ${portal.portal_name}`);
    setPortals(
      portals.map(p =>
        p.id === portal.id ? { ...p, approval_status: 'approved' } : p
      )
    );
  };

  const handleReject = (portal: any) => {
    alert(`拒绝门户: ${portal.portal_name}`);
    setPortals(
      portals.map(p =>
        p.id === portal.id ? { ...p, approval_status: 'rejected' } : p
      )
    );
  };

  const handleViewDetail = (portal: any) => {
    setSelectedPortal(portal);
    setDetailDialog(true);
  };

  const handlePreview = (portal: any) => {
    setPreviewPortal(portal);
    setPreviewDialog(true);
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
          门户统一管理
        </Typography>
        <Typography variant="body1" color="textSecondary">
          管理所有用户门户的配置、审核和使用统计
        </Typography>
      </Box>

      {/* 统计卡片 */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="总门户数"
            value={stats.totalPortals}
            subtitle="本月新增: {stats.thisMonthNew}"
            icon={Description}
            color="primary.main"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="已发布"
            value={stats.publishedPortals}
            subtitle="占比 87.6%"
            icon={Publish}
            color="success.main"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="待审核"
            value={stats.pendingPortals}
            subtitle="需要处理"
            icon={Pending}
            color="warning.main"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="总浏览量"
            value={stats.totalViews}
            subtitle="分享: {stats.totalShares}"
            icon={TrendingUp}
            color="info.main"
          />
        </Grid>
      </Grid>

      {/* 流量统计 */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom variant="body2">
                门户发布率
              </Typography>
              <Typography variant="h3" sx={{ mb: 2 }}>
                {((stats.publishedPortals / stats.totalPortals) * 100).toFixed(
                  1
                )}
                %
              </Typography>
              <LinearProgress
                variant="determinate"
                value={(stats.publishedPortals / stats.totalPortals) * 100}
                sx={{ height: 10, borderRadius: 5 }}
              />
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom variant="body2">
                审核通过率
              </Typography>
              <Typography variant="h3" sx={{ mb: 2 }}>
                {(
                  (stats.publishedPortals /
                    (stats.publishedPortals + stats.rejectedPortals)) *
                  100
                ).toFixed(1)}
                %
              </Typography>
              <LinearProgress
                variant="determinate"
                value={
                  (stats.publishedPortals /
                    (stats.publishedPortals + stats.rejectedPortals)) *
                  100
                }
                color="success"
                sx={{ height: 10, borderRadius: 5 }}
              />
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* 待审核警告 */}
      {stats.pendingPortals > 0 && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          <Typography variant="body2">
            有 <strong>{stats.pendingPortals}</strong> 个门户待审核，请及时处理
          </Typography>
        </Alert>
      )}

      {/* 过滤和搜索 */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={3}>
            <TextField
              fullWidth
              size="small"
              placeholder="搜索门户或用户"
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
              <InputLabel>审核状态</InputLabel>
              <Select
                value={filterStatus}
                onChange={e => setFilterStatus(e.target.value)}
                label="审核状态"
              >
                <MenuItem value="all">全部</MenuItem>
                <MenuItem value="approved">已通过</MenuItem>
                <MenuItem value="pending">待审核</MenuItem>
                <MenuItem value="rejected">已拒绝</MenuItem>
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
          <Grid item xs={6} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel>发布状态</InputLabel>
              <Select
                value={filterPublished}
                onChange={e => setFilterPublished(e.target.value)}
                label="发布状态"
              >
                <MenuItem value="all">全部</MenuItem>
                <MenuItem value="published">已发布</MenuItem>
                <MenuItem value="unpublished">未发布</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={6} md={3} sx={{ textAlign: 'right' }}>
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

      {/* 门户列表 */}
      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>门户名称</TableCell>
                <TableCell>用户</TableCell>
                <TableCell>类型</TableCell>
                <TableCell>审核状态</TableCell>
                <TableCell>发布状态</TableCell>
                <TableCell>内容统计</TableCell>
                <TableCell>浏览量</TableCell>
                <TableCell>创建时间</TableCell>
                <TableCell align="center">操作</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {portals.map(portal => (
                <TableRow key={portal.id} hover>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Avatar sx={{ width: 40, height: 40 }}>
                        {portal.portal_name.charAt(0)}
                      </Avatar>
                      <Box>
                        <Typography variant="body2" fontWeight="medium">
                          {portal.portal_name}
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          {portal.portal_description}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>{portal.user_name}</TableCell>
                  <TableCell>
                    <Chip
                      label={getTypeLabel(portal.business_type)}
                      size="small"
                      color={getTypeColor(portal.business_type) as any}
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>{getStatusChip(portal.approval_status)}</TableCell>
                  <TableCell>
                    <Chip
                      label={portal.is_published ? '已发布' : '未发布'}
                      size="small"
                      color={portal.is_published ? 'success' : 'default'}
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>
                    <Stack spacing={0.5}>
                      <Box
                        sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
                      >
                        <LinkIcon fontSize="small" sx={{ fontSize: 14 }} />
                        <Typography variant="caption">
                          {portal.business_links_count} 链接
                        </Typography>
                      </Box>
                      <Box
                        sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
                      >
                        <Image fontSize="small" sx={{ fontSize: 14 }} />
                        <Typography variant="caption">
                          {portal.promotional_images_count} 图片
                        </Typography>
                      </Box>
                      <Box
                        sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
                      >
                        <Description fontSize="small" sx={{ fontSize: 14 }} />
                        <Typography variant="caption">
                          {portal.blog_posts_count} 文章
                        </Typography>
                      </Box>
                    </Stack>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight="medium">
                      {portal.view_count.toLocaleString()}
                    </Typography>
                  </TableCell>
                  <TableCell>{portal.created_at}</TableCell>
                  <TableCell align="center">
                    <Tooltip title="预览">
                      <IconButton
                        size="small"
                        onClick={() => handlePreview(portal)}
                      >
                        <Preview fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="查看详情">
                      <IconButton
                        size="small"
                        onClick={() => handleViewDetail(portal)}
                      >
                        <Visibility fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    {portal.approval_status === 'pending' && (
                      <>
                        <Tooltip title="批准">
                          <IconButton
                            size="small"
                            color="success"
                            onClick={() => handleApprove(portal)}
                          >
                            <Approve fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="拒绝">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleReject(portal)}
                          >
                            <Close fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </>
                    )}
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
        <DialogTitle>门户详情</DialogTitle>
        <DialogContent>
          {selectedPortal && (
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="textSecondary">
                  门户名称
                </Typography>
                <Typography variant="body1">
                  {selectedPortal.portal_name}
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="textSecondary">
                  用户
                </Typography>
                <Typography variant="body1">
                  {selectedPortal.user_name}
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="textSecondary">
                  类型
                </Typography>
                <Typography variant="body1">
                  {getTypeLabel(selectedPortal.business_type)}
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="textSecondary">
                  审核状态
                </Typography>
                <Box>{getStatusChip(selectedPortal.approval_status)}</Box>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="textSecondary">
                  发布状态
                </Typography>
                <Chip
                  label={selectedPortal.is_published ? '已发布' : '未发布'}
                  size="small"
                  color={selectedPortal.is_published ? 'success' : 'default'}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="textSecondary">
                  浏览量
                </Typography>
                <Typography variant="body1">
                  {selectedPortal.view_count.toLocaleString()}
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle2" color="textSecondary">
                  描述
                </Typography>
                <Typography variant="body1">
                  {selectedPortal.portal_description}
                </Typography>
              </Grid>
              <Grid item xs={12} md={4}>
                <Typography variant="subtitle2" color="textSecondary">
                  业务链接
                </Typography>
                <Typography variant="body1">
                  {selectedPortal.business_links_count} 个
                </Typography>
              </Grid>
              <Grid item xs={12} md={4}>
                <Typography variant="subtitle2" color="textSecondary">
                  宣传图片
                </Typography>
                <Typography variant="body1">
                  {selectedPortal.promotional_images_count} 张
                </Typography>
              </Grid>
              <Grid item xs={12} md={4}>
                <Typography variant="subtitle2" color="textSecondary">
                  博客文章
                </Typography>
                <Typography variant="body1">
                  {selectedPortal.blog_posts_count} 篇
                </Typography>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailDialog(false)}>关闭</Button>
        </DialogActions>
      </Dialog>

      {/* 预览对话框 */}
      <Dialog
        open={previewDialog}
        onClose={() => setPreviewDialog(false)}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>门户预览</DialogTitle>
        <DialogContent>
          {previewPortal && (
            <Box
              sx={{ mt: 2, p: 3, border: '1px solid #e0e0e0', borderRadius: 2 }}
            >
              <Typography variant="h4" gutterBottom>
                {previewPortal.portal_name}
              </Typography>
              <Typography variant="body1" color="textSecondary" paragraph>
                {previewPortal.portal_description}
              </Typography>
              <Box sx={{ mt: 3 }}>
                <Typography variant="h6" gutterBottom>
                  业务链接 ({previewPortal.business_links_count})
                </Typography>
                {[...Array(previewPortal.business_links_count)].map((_, i) => (
                  <Box
                    key={i}
                    sx={{ mb: 1, p: 1, bgcolor: '#f5f5f5', borderRadius: 1 }}
                  >
                    链接 {i + 1}
                  </Box>
                ))}
              </Box>
              <Box sx={{ mt: 3 }}>
                <Typography variant="h6" gutterBottom>
                  宣传图片 ({previewPortal.promotional_images_count})
                </Typography>
                {[...Array(previewPortal.promotional_images_count)].map(
                  (_, i) => (
                    <Box
                      key={i}
                      sx={{
                        width: '100%',
                        height: 150,
                        bgcolor: '#e0e0e0',
                        borderRadius: 1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mb: 1,
                      }}
                    >
                      图片 {i + 1}
                    </Box>
                  )
                )}
              </Box>
              <Box sx={{ mt: 3 }}>
                <Typography variant="h6" gutterBottom>
                  博客文章 ({previewPortal.blog_posts_count})
                </Typography>
                {[...Array(previewPortal.blog_posts_count)].map((_, i) => (
                  <Box
                    key={i}
                    sx={{
                      mb: 2,
                      p: 2,
                      border: '1px solid #e0e0e0',
                      borderRadius: 1,
                    }}
                  >
                    文章标题 {i + 1}
                  </Box>
                ))}
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPreviewDialog(false)}>关闭</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
