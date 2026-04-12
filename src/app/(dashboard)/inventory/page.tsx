'use client';

import {
  Assessment as AnalyticsIcon,
  ShowChart as ChartIcon,
  Chat as ChatIcon,
  Storage as DatabaseIcon,
  Inventory as InventoryIcon,
  Notifications as NotificationIcon,
} from '@mui/icons-material';
import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  Container,
  Grid,
  Paper,
  Tab,
  Tabs,
  Typography,
} from '@mui/material';
import Link from 'next/link';
import { useState } from 'react';

interface FeatureCard {
  title: string;
  description: string;
  icon: React.ReactNode;
  href?: string;
  color: string;
}

const features: FeatureCard[] = [
  {
    title: '智能销量预测',
    description: '基于Prophet模型，支持季节性分析，准确率>85%',
    icon: <ChartIcon sx={{ fontSize: 48 }} />,
    href: '/inventory/forecast',
    color: '#1976d2',
  },
  {
    title: '自动补货建议',
    description: 'n8n工作流驱动，自动生成采购建议，支持一键审批',
    icon: <NotificationIcon sx={{ fontSize: 48 }} />,
    href: '/inventory/replenishment',
    color: '#2e7d32',
  },
  {
    title: 'AI智能问答',
    description: '集成Dify平台，自然语言查询库存，实时响应',
    icon: <ChatIcon sx={{ fontSize: 48 }} />,
    href: '/inventory/ai-chat',
    color: '#ed6c02',
  },
  {
    title: '库存健康监控',
    description: '实时监控库存状态，低库存预警，过期提醒',
    icon: <InventoryIcon sx={{ fontSize: 48 }} />,
    href: '/inventory/health',
    color: '#9c27b0',
  },
  {
    title: '数据可视化',
    description: 'Recharts图表库，预测曲线、仪表板、利用率监控',
    icon: <AnalyticsIcon sx={{ fontSize: 48 }} />,
    href: '/inventory/analytics',
    color: '#0288d1',
  },
  {
    title: '仓库管理',
    description: '多仓库管理，库位优化，出入库记录追踪',
    icon: <DatabaseIcon sx={{ fontSize: 48 }} />,
    href: '/inventory/warehouses',
    color: '#d32f2f',
  },
];

// Tab面板组件
interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`inventory-ai-tabpanel-${index}`}
      aria-labelledby={`inventory-ai-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

export default function InventoryAIPage() {
  const [tabValue, setTabValue] = useState(0);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* 页面标题 */}
      <Paper
        sx={{
          p: 4,
          mb: 3,
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
        }}
      >
        <Typography variant="h3" component="h1" gutterBottom fontWeight="bold">
          进销存AI模块
        </Typography>
        <Typography variant="h6" sx={{ opacity: 0.9 }}>
          智能库存管理系统 - AI预测 · 自动补货 · 智能问答 · 数据可视化
        </Typography>
      </Paper>

      {/* Tab导航 */}
      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          variant="fullWidth"
          sx={{
            borderBottom: 1,
            borderColor: 'divider',
            '& .MuiTab-root': {
              fontSize: '1rem',
              fontWeight: 600,
              minHeight: 64,
            },
          }}
        >
          <Tab label="📦 功能模块" />
          <Tab label="📖 定位和使用方法" />
          <Tab label="⚙️ 环境要求" />
        </Tabs>
      </Paper>

      {/* Tab 1: 功能模块 */}
      <TabPanel value={tabValue} index={0}>
        <Grid container spacing={3}>
          {features.map(feature => (
            <Grid
              size={{ xs: 12, sm: 6, md: 4 }}
              key={feature.href || feature.title}
            >
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 6,
                  },
                }}
              >
                <CardContent sx={{ flexGrow: 1, textAlign: 'center' }}>
                  <Box
                    sx={{
                      color: feature.color,
                      mb: 2,
                      display: 'flex',
                      justifyContent: 'center',
                    }}
                  >
                    {feature.icon}
                  </Box>
                  <Typography gutterBottom variant="h6" component="h2">
                    {feature.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {feature.description}
                  </Typography>
                </CardContent>
                {feature.href && (
                  <CardActions sx={{ justifyContent: 'center', pb: 2 }}>
                    <Button
                      component={Link}
                      href={feature.href}
                      variant="outlined"
                      size="small"
                      sx={{
                        borderColor: feature.color,
                        color: feature.color,
                        '&:hover': {
                          borderColor: feature.color,
                          bgcolor: `${feature.color}10`,
                        },
                      }}
                    >
                      进入
                    </Button>
                  </CardActions>
                )}
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* 快速说明 */}
        <Paper sx={{ p: 3, mt: 4, bgcolor: '#e3f2fd' }}>
          <Typography variant="h6" gutterBottom>
            📌 提示
          </Typography>
          <Typography variant="body2" paragraph>
            完整的定位说明和环境搭建指南请切换到其他Tab查看，或访问详细文档。
          </Typography>
          <Box component="ul" sx={{ pl: 3 }}>
            <Typography component="li" variant="body2" paragraph>
              📖 <strong>定位和使用方法：</strong>点击第二个Tab查看详细说明
            </Typography>
            <Typography component="li" variant="body2" paragraph>
              ⚙️ <strong>环境要求：</strong>点击第三个Tab查看搭建步骤
            </Typography>
            <Typography component="li" variant="body2">
              📄 <strong>完整文档：</strong>查看项目文档目录
            </Typography>
          </Box>
        </Paper>
      </TabPanel>

      {/* Tab 2: 定位和使用方法 - 简化版 */}
      <TabPanel value={tabValue} index={1}>
        <Paper
          sx={{
            p: 4,
            mb: 3,
            bgcolor: '#fff3e0',
            borderLeft: '5px solid #ff9800',
          }}
        >
          <Typography
            variant="h5"
            gutterBottom
            fontWeight="bold"
            color="#e65100"
          >
            📢 核心理念
          </Typography>
          <Typography variant="body1" paragraph sx={{ lineHeight: 1.8 }}>
            传统进销存只是"记账本"，而进销存AI是<strong>"智能管家"</strong>。
            它利用人工智能技术，帮助你做出更聪明的库存决策。
          </Typography>
        </Paper>

        <Paper sx={{ p: 4, mb: 3 }}>
          <Typography
            variant="h5"
            gutterBottom
            fontWeight="bold"
            color="#1976d2"
          >
            💡 主要优势
          </Typography>
          <Box component="ul" sx={{ pl: 3 }}>
            <Typography
              component="li"
              variant="body1"
              paragraph
              sx={{ lineHeight: 1.8 }}
            >
              <strong>智能预测：</strong>基于历史数据预测未来销量，准确率&gt;85%
            </Typography>
            <Typography
              component="li"
              variant="body1"
              paragraph
              sx={{ lineHeight: 1.8 }}
            >
              <strong>自动补货：</strong>系统自动生成采购建议，减少人工决策
            </Typography>
            <Typography
              component="li"
              variant="body1"
              paragraph
              sx={{ lineHeight: 1.8 }}
            >
              <strong>AI问答：</strong>用自然语言查询库存信息，无需学习复杂操作
            </Typography>
            <Typography component="li" variant="body1" sx={{ lineHeight: 1.8 }}>
              <strong>实时监控：</strong>及时发现库存异常，避免损失
            </Typography>
          </Box>
        </Paper>

        <Paper sx={{ p: 4, bgcolor: '#e8f5e9' }}>
          <Typography variant="h6" gutterBottom>
            📚 查看详细文档
          </Typography>
          <Typography variant="body2" paragraph>
            由于内容较多，详细的定位说明、使用场景和常见问题已整理成文档：
          </Typography>
          <Box component="ul" sx={{ pl: 3 }}>
            <Typography component="li" variant="body2" paragraph>
              📄 HTML营销页面：<code>docs/inventory-ai-module.html</code>
            </Typography>
            <Typography component="li" variant="body2">
              📄 实施报告：<code>IMPLEMENTATION_REPORT.md</code>
            </Typography>
          </Box>
        </Paper>
      </TabPanel>

      {/* Tab 3: 环境要求 - 简化版 */}
      <TabPanel value={tabValue} index={2}>
        <Paper sx={{ p: 4, mb: 3 }}>
          <Typography
            variant="h5"
            gutterBottom
            fontWeight="bold"
            color="#1565c0"
          >
            🔧 环境搭建步骤
          </Typography>
        </Paper>

        <Paper
          sx={{
            p: 4,
            mb: 3,
            bgcolor: '#e8f5e9',
            borderLeft: '5px solid #4caf50',
          }}
        >
          <Typography variant="h6" gutterBottom color="#2e7d32">
            第1步：基础环境
          </Typography>
          <Box component="ul" sx={{ pl: 3 }}>
            <Typography component="li" variant="body2" paragraph>
              Node.js 18+
            </Typography>
            <Typography component="li" variant="body2" paragraph>
              Python 3.9+（用于Prophet）
            </Typography>
            <Typography component="li" variant="body2" paragraph>
              PostgreSQL 14+ 或 Supabase
            </Typography>
            <Typography component="li" variant="body2">
              Redis（可选）
            </Typography>
          </Box>
        </Paper>

        <Paper
          sx={{
            p: 4,
            mb: 3,
            bgcolor: '#e3f2fd',
            borderLeft: '5px solid #2196f3',
          }}
        >
          <Typography variant="h6" gutterBottom color="#1565c0">
            第2步：AI服务配置
          </Typography>
          <Box component="ul" sx={{ pl: 3 }}>
            <Typography component="li" variant="body2" paragraph>
              Dify AI平台
            </Typography>
            <Typography component="li" variant="body2" paragraph>
              Pinecone向量数据库
            </Typography>
            <Typography component="li" variant="body2" paragraph>
              Prophet预测模型
            </Typography>
            <Typography component="li" variant="body2">
              n8n自动化工作流（可选）
            </Typography>
          </Box>
        </Paper>

        <Paper
          sx={{
            p: 4,
            mb: 3,
            bgcolor: '#f3e5f5',
            borderLeft: '5px solid #9c27b0',
          }}
        >
          <Typography variant="h6" gutterBottom color="#7b1fa2">
            第3步：环境变量
          </Typography>
          <Typography variant="body2" paragraph>
            在 <code>.env.local</code>{' '}
            中配置Supabase、Dify、Pinecone等服务的密钥。
          </Typography>
        </Paper>

        <Paper sx={{ p: 4, bgcolor: '#fff9c4' }}>
          <Typography variant="h6" gutterBottom>
            📖 查看详细指南
          </Typography>
          <Typography variant="body2" paragraph>
            完整的环境搭建指南包含详细的步骤、命令示例和常见问题解答，请查看：
          </Typography>
          <Box component="ul" sx={{ pl: 3 }}>
            <Typography component="li" variant="body2" paragraph>
              📄 HTML文档：<code>docs/inventory-ai-module.html</code>
            </Typography>
            <Typography component="li" variant="body2">
              📄 部署指南：
              <code>src/modules/inventory-management/DEPLOYMENT_GUIDE.md</code>
            </Typography>
          </Box>
        </Paper>
      </TabPanel>
    </Container>
  );
}
