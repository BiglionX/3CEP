'use client';

import {
  Settings as AccessoriesIcon,
  Business as BrandsIcon,
  Build as ComponentsIcon,
  Upload as ImportIcon,
  Link as IntegrationIcon,
  Widgets as PartsIcon,
  Inventory as ProductsIcon,
  QrCode as TraceabilityIcon,
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
  href: string;
  color: string;
}

const features: FeatureCard[] = [
  {
    title: '品牌管理',
    description: '管理产品品牌信息，包括Logo、描述、网站等',
    icon: <BrandsIcon sx={{ fontSize: 48 }} />,
    href: '/product-library/brands',
    color: '#1976d2',
  },
  {
    title: '整机产品',
    description: '管理完整的成品产品信息和规格参数',
    icon: <ProductsIcon sx={{ fontSize: 48 }} />,
    href: '/product-library/products',
    color: '#2e7d32',
  },
  {
    title: '配件管理',
    description: '管理产品配件信息和兼容性',
    icon: <AccessoriesIcon sx={{ fontSize: 48 }} />,
    href: '/product-library/accessories',
    color: '#ed6c02',
  },
  {
    title: '部件管理',
    description: '管理产品组成部件和BOM关系',
    icon: <ComponentsIcon sx={{ fontSize: 48 }} />,
    href: '/product-library/components',
    color: '#9c27b0',
  },
  {
    title: '零件管理',
    description: '管理最小物理单元的零件信息',
    icon: <PartsIcon sx={{ fontSize: 48 }} />,
    href: '/product-library/parts',
    color: '#0288d1',
  },
  {
    title: '溯源码',
    description: '生成和管理产品溯源码，追踪全生命周期',
    icon: <TraceabilityIcon sx={{ fontSize: 48 }} />,
    href: '/product-library/traceability',
    color: '#d32f2f',
  },
  {
    title: '数据导入',
    description: '从CSV、Excel或API批量导入产品数据',
    icon: <ImportIcon sx={{ fontSize: 48 }} />,
    href: '/product-library/import',
    color: '#388e3c',
  },
  {
    title: '进销存集成',
    description: '将产品库数据同步到进销存系统',
    icon: <IntegrationIcon sx={{ fontSize: 48 }} />,
    href: '/inventory/import-from-library',
    color: '#7b1fa2',
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
      id={`product-library-tabpanel-${index}`}
      aria-labelledby={`product-library-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

export default function ProductLibraryPage() {
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
          产品库模块
        </Typography>
        <Typography variant="h6" sx={{ opacity: 0.9 }}>
          行业标准产品主数据中心 - 五库设计 · BOM管理 · 溯源追踪
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
            <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={feature.href}>
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
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* 快速开始指南 */}
        <Paper sx={{ p: 3, mt: 4 }}>
          <Typography variant="h6" gutterBottom>
            🚀 快速开始
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            1️⃣ 首先创建品牌信息
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            2️⃣ 然后添加整机产品和配件/部件/零件
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            3️⃣ 配置BOM关系（可选）
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            4️⃣ 发布产品到产品库
          </Typography>
          <Typography variant="body2" color="text.secondary">
            5️⃣ 生成溯源码并追踪产品生命周期
          </Typography>
        </Paper>
      </TabPanel>

      {/* Tab 2: 定位和使用方法 */}
      <TabPanel value={tabValue} index={1}>
        {/* 核心定位 */}
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
            component="h2"
            gutterBottom
            fontWeight="bold"
            color="#e65100"
          >
            📢 产品库是什么？
          </Typography>
          <Typography
            variant="body1"
            paragraph
            sx={{ lineHeight: 1.8, fontSize: '1.05rem' }}
          >
            <strong>简单来说：</strong>产品库就像是一个
            <strong>"产品字典"</strong>，里面记录了所有产品的标准信息。
          </Typography>
          <Typography
            variant="body1"
            paragraph
            sx={{ lineHeight: 1.8, fontSize: '1.05rem' }}
          >
            <strong>核心理念：</strong>本产品库是
            <strong>行业标准产品主数据中心</strong>，作为
            <strong>公开标准数据源（行业统一）</strong>
            ，为整个系统提供标准化的产品基础数据支持。
          </Typography>
          <Box
            sx={{
              bgcolor: 'white',
              p: 2,
              borderRadius: 1,
              mt: 2,
            }}
          >
            <Typography variant="body2" sx={{ lineHeight: 1.8 }}>
              💡 <strong>打个比方：</strong>
              就像手机通讯录，产品库存储的是"联系人基本信息"（姓名、电话），而进销存系统记录的是"你和这个联系人的交易记录"（买了什么、什么时候买的）。
            </Typography>
          </Box>
        </Paper>

        {/* 架构说明 */}
        <Paper sx={{ p: 4, mb: 3 }}>
          <Typography
            variant="h5"
            gutterBottom
            fontWeight="bold"
            color="#1976d2"
          >
            🏗️ 系统架构说明
          </Typography>
          <Typography variant="body1" paragraph sx={{ lineHeight: 1.8 }}>
            我们的系统分为三个部分，各司其职：
          </Typography>

          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid size={{ xs: 12, md: 4 }}>
              <Card sx={{ height: '100%', bgcolor: '#e3f2fd' }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom color="#1565c0">
                    1️⃣ 产品库
                  </Typography>
                  <Typography variant="body2" paragraph>
                    <strong>作用：</strong>存储产品的标准信息
                  </Typography>
                  <Typography variant="body2" paragraph>
                    <strong>特点：</strong>全局共享，所有人用同一份数据
                  </Typography>
                  <Typography variant="body2">
                    <strong>例子：</strong>iPhone 15的规格、参数、图片
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
              <Card sx={{ height: '100%', bgcolor: '#f3e5f5' }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom color="#7b1fa2">
                    2️⃣ 进销存系统
                  </Typography>
                  <Typography variant="body2" paragraph>
                    <strong>作用：</strong>管理你的库存和交易
                  </Typography>
                  <Typography variant="body2" paragraph>
                    <strong>特点：</strong>每个用户有自己的独立数据
                  </Typography>
                  <Typography variant="body2">
                    <strong>例子：</strong>你仓库里有10台iPhone 15
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
              <Card sx={{ height: '100%', bgcolor: '#e8f5e9' }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom color="#2e7d32">
                    3️⃣ 溯源码插件
                  </Typography>
                  <Typography variant="body2" paragraph>
                    <strong>作用：</strong>追踪每个产品的生命周期
                  </Typography>
                  <Typography variant="body2" paragraph>
                    <strong>特点：</strong>给每个产品一个唯一身份证
                  </Typography>
                  <Typography variant="body2">
                    <strong>例子：</strong>这台iPhone 15的生产、销售、维修记录
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          <Box
            sx={{
              bgcolor: '#fff9c4',
              p: 2,
              borderRadius: 1,
              mt: 3,
            }}
          >
            <Typography variant="body2" sx={{ lineHeight: 1.8 }}>
              ⚠️ <strong>重要提示：</strong>产品库采用
              <strong>单一全局实例</strong>设计，通过品牌、类目等维度组织数据，
              <strong>不需要</strong>
              也不支持创建多个数据库实例。这样设计的好处是保证数据的一致性和标准化。
            </Typography>
          </Box>
        </Paper>

        {/* 使用场景 */}
        <Paper sx={{ p: 4, mb: 3 }}>
          <Typography
            variant="h5"
            gutterBottom
            fontWeight="bold"
            color="#2e7d32"
          >
            💼 典型使用场景
          </Typography>

          <Box sx={{ mt: 2 }}>
            <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
              场景1：电子产品零售商
            </Typography>
            <Box component="ul" sx={{ pl: 3 }}>
              <Typography component="li" variant="body2" paragraph>
                在产品库中查找"Apple"品牌的所有iPhone型号
              </Typography>
              <Typography component="li" variant="body2" paragraph>
                查看iPhone 15的详细规格和配件清单
              </Typography>
              <Typography component="li" variant="body2" paragraph>
                将产品信息导入到你的进销存系统
              </Typography>
              <Typography component="li" variant="body2">
                为你的每台iPhone生成溯源码，方便售后追踪
              </Typography>
            </Box>

            <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
              场景2：电脑组装商
            </Typography>
            <Box component="ul" sx={{ pl: 3 }}>
              <Typography component="li" variant="body2" paragraph>
                在部件库中查找各种CPU、内存、硬盘
              </Typography>
              <Typography component="li" variant="body2" paragraph>
                查看哪些配件兼容特定的主板
              </Typography>
              <Typography component="li" variant="body2" paragraph>
                使用BOM功能管理整机的组成部件
              </Typography>
              <Typography component="li" variant="body2">
                为组装好的电脑生成完整的产品档案
              </Typography>
            </Box>

            <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
              场景3：维修服务商
            </Typography>
            <Box component="ul" sx={{ pl: 3 }}>
              <Typography component="li" variant="body2" paragraph>
                扫描产品溯源码，快速查看产品信息
              </Typography>
              <Typography component="li" variant="body2" paragraph>
                查询零件库，找到替换零件的详细信息
              </Typography>
              <Typography component="li" variant="body2" paragraph>
                记录维修历史，完善产品生命周期档案
              </Typography>
              <Typography component="li" variant="body2">
                为客户提供透明的维修记录和零件来源
              </Typography>
            </Box>
          </Box>
        </Paper>

        {/* 常见问题 */}
        <Paper sx={{ p: 4, mb: 3, bgcolor: '#fce4ec' }}>
          <Typography
            variant="h5"
            gutterBottom
            fontWeight="bold"
            color="#c2185b"
          >
            ❓ 常见问题（FAQ）
          </Typography>

          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle1" fontWeight="bold" sx={{ mt: 2 }}>
              Q1: 为什么不能创建多个产品库？
            </Typography>
            <Typography variant="body2" paragraph sx={{ pl: 2 }}>
              A:
              产品库的定位是"行业标准数据"，就像字典一样，大家都应该使用同一本标准字典。
              如果你需要隔离数据，应该在进销存系统中实现，那里支持多租户隔离。
            </Typography>

            <Typography variant="subtitle1" fontWeight="bold" sx={{ mt: 2 }}>
              Q2: 产品库和进销存有什么区别？
            </Typography>
            <Typography variant="body2" paragraph sx={{ pl: 2 }}>
              A: 产品库存储的是"产品是什么"（名称、规格、图片等标准信息），
              进销存记录的是"我有多少"（库存数量、采购价格、销售记录等业务数据）。
            </Typography>

            <Typography variant="subtitle1" fontWeight="bold" sx={{ mt: 2 }}>
              Q3: 我需要自己录入所有产品信息吗？
            </Typography>
            <Typography variant="body2" paragraph sx={{ pl: 2 }}>
              A: 不一定！你可以：
            </Typography>
            <Box component="ul" sx={{ pl: 5 }}>
              <Typography component="li" variant="body2" paragraph>
                使用数据导入功能批量导入CSV/Excel文件
              </Typography>
              <Typography component="li" variant="body2" paragraph>
                通过API从品牌方官方数据源同步
              </Typography>
              <Typography component="li" variant="body2">
                手动添加少量特殊产品
              </Typography>
            </Box>

            <Typography variant="subtitle1" fontWeight="bold" sx={{ mt: 2 }}>
              Q4: 什么是BOM？有什么用？
            </Typography>
            <Typography variant="body2" paragraph sx={{ pl: 2 }}>
              A: BOM（Bill of
              Materials）是物料清单，用来描述一个产品由哪些部件组成。
              比如一台电脑包含：1个CPU、2根内存条、1个硬盘等。BOM可以帮助你：
            </Typography>
            <Box component="ul" sx={{ pl: 5 }}>
              <Typography component="li" variant="body2" paragraph>
                了解产品的完整组成结构
              </Typography>
              <Typography component="li" variant="body2" paragraph>
                计算生产成本
              </Typography>
              <Typography component="li" variant="body2">
                管理配件兼容性
              </Typography>
            </Box>

            <Typography variant="subtitle1" fontWeight="bold" sx={{ mt: 2 }}>
              Q5: 溯源码怎么使用？
            </Typography>
            <Typography variant="body2" paragraph sx={{ pl: 2 }}>
              A: 溯源码就像是产品的"身份证"，每个产品都有唯一的二维码。使用时：
            </Typography>
            <Box component="ol" sx={{ pl: 5 }}>
              <Typography component="li" variant="body2" paragraph>
                在产品库中选择要追踪的产品
              </Typography>
              <Typography component="li" variant="body2" paragraph>
                生成溯源码（可以批量生成）
              </Typography>
              <Typography component="li" variant="body2" paragraph>
                打印二维码贴到产品上
              </Typography>
              <Typography component="li" variant="body2">
                客户扫码即可查看产品完整信息和使用历史
              </Typography>
            </Box>
          </Box>
        </Paper>

        {/* 学习资源 */}
        <Paper sx={{ p: 4 }}>
          <Typography
            variant="h5"
            gutterBottom
            fontWeight="bold"
            color="#6a1b9a"
          >
            📚 学习资源
          </Typography>
          <Typography variant="body1" paragraph sx={{ lineHeight: 1.8 }}>
            想要深入了解产品库？这里有更多资源：
          </Typography>
          <Box component="ul" sx={{ pl: 3 }}>
            <Typography component="li" variant="body2" paragraph>
              📄 <strong>完整开发文档：</strong>查看项目根目录的{' '}
              <code>PRODUCT_LIBRARY_DEVELOPMENT_PLAN.md</code>
            </Typography>
            <Typography component="li" variant="body2" paragraph>
              🔧 <strong>API文档：</strong>访问{' '}
              <code>/api/product-library/*</code> 查看所有接口
            </Typography>
            <Typography component="li" variant="body2" paragraph>
              💻 <strong>示例代码：</strong>参考各个子页面的实现代码
            </Typography>
            <Typography component="li" variant="body2">
              🎥 <strong>视频教程：</strong>（即将推出）
            </Typography>
          </Box>
        </Paper>
      </TabPanel>

      {/* Tab 3: 环境要求 */}
      <TabPanel value={tabValue} index={2}>
        <Paper sx={{ p: 4, mb: 3 }}>
          <Typography
            variant="h5"
            gutterBottom
            fontWeight="bold"
            color="#1565c0"
          >
            🔧 环境搭建完整指南
          </Typography>
          <Typography variant="body1" paragraph sx={{ lineHeight: 1.8 }}>
            按照以下步骤，轻松搭建产品库运行环境：
          </Typography>
        </Paper>

        {/* 步骤1：数据库环境 */}
        <Paper
          sx={{
            p: 4,
            mb: 3,
            bgcolor: '#e8f5e9',
            borderLeft: '5px solid #4caf50',
          }}
        >
          <Typography
            variant="h5"
            gutterBottom
            fontWeight="bold"
            color="#2e7d32"
          >
            第1步：准备数据库环境
          </Typography>

          <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
            ✅ 方式A：使用Supabase（推荐，最简单）
          </Typography>
          <Box component="ol" sx={{ pl: 3 }}>
            <Typography
              component="li"
              variant="body2"
              paragraph
              sx={{ lineHeight: 1.8 }}
            >
              <strong>注册Supabase账号：</strong>访问{' '}
              <a
                href="https://supabase.com"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: '#1565c0' }}
              >
                https://supabase.com
              </a>{' '}
              免费注册
            </Typography>
            <Typography
              component="li"
              variant="body2"
              paragraph
              sx={{ lineHeight: 1.8 }}
            >
              <strong>创建新项目：</strong>点击"New Project"，选择免费套餐
            </Typography>
            <Typography
              component="li"
              variant="body2"
              paragraph
              sx={{ lineHeight: 1.8 }}
            >
              <strong>获取连接信息：</strong>在项目设置中找到API密钥
            </Typography>
            <Typography component="li" variant="body2" sx={{ lineHeight: 1.8 }}>
              <strong>执行迁移脚本：</strong>在Supabase SQL编辑器中运行迁移文件
            </Typography>
          </Box>

          <Box
            sx={{
              bgcolor: 'white',
              p: 2,
              borderRadius: 1,
              mt: 2,
              mb: 3,
            }}
          >
            <Typography variant="subtitle2" gutterBottom fontWeight="bold">
              📝 需要执行的SQL脚本：
            </Typography>
            <Box
              component="pre"
              sx={{
                bgcolor: '#263238',
                color: '#aed581',
                p: 2,
                borderRadius: 1,
                fontSize: '0.85rem',
                overflow: 'auto',
              }}
            >
              {`-- 1. 创建产品库Schema
supabase/migrations/020_create_product_library_schema.sql

-- 2. 配置访问权限
supabase/migrations/027_grant_product_library_permissions.sql`}
            </Box>
          </Box>

          <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
            ✅ 方式B：自建PostgreSQL数据库
          </Typography>
          <Box component="ol" sx={{ pl: 3 }}>
            <Typography
              component="li"
              variant="body2"
              paragraph
              sx={{ lineHeight: 1.8 }}
            >
              <strong>安装PostgreSQL 12+：</strong>
              <a
                href="https://www.postgresql.org/download/"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: '#1565c0', marginLeft: '4px' }}
              >
                下载地址
              </a>
            </Typography>
            <Typography
              component="li"
              variant="body2"
              paragraph
              sx={{ lineHeight: 1.8 }}
            >
              <strong>创建数据库：</strong>使用pgAdmin或命令行创建新数据库
            </Typography>
            <Typography
              component="li"
              variant="body2"
              paragraph
              sx={{ lineHeight: 1.8 }}
            >
              <strong>执行迁移脚本：</strong>使用psql工具运行SQL文件
            </Typography>
            <Typography component="li" variant="body2" sx={{ lineHeight: 1.8 }}>
              <strong>配置连接字符串：</strong>记录数据库连接信息
            </Typography>
          </Box>
        </Paper>

        {/* 步骤2：环境变量配置 */}
        <Paper
          sx={{
            p: 4,
            mb: 3,
            bgcolor: '#e3f2fd',
            borderLeft: '5px solid #2196f3',
          }}
        >
          <Typography
            variant="h5"
            gutterBottom
            fontWeight="bold"
            color="#1565c0"
          >
            第2步：配置环境变量
          </Typography>

          <Typography variant="body1" paragraph sx={{ mt: 2, lineHeight: 1.8 }}>
            在项目根目录创建或编辑 <code>.env.local</code> 文件，添加以下配置：
          </Typography>

          <Box
            component="pre"
            sx={{
              bgcolor: '#263238',
              color: '#aed581',
              p: 3,
              borderRadius: 1,
              fontSize: '0.9rem',
              overflow: 'auto',
              my: 2,
            }}
          >
            {`# Supabase 配置（必填）
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# 应用配置
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development`}
          </Box>

          <Box
            sx={{
              bgcolor: '#fff9c4',
              p: 2,
              borderRadius: 1,
              mt: 2,
            }}
          >
            <Typography variant="body2" sx={{ lineHeight: 1.8 }}>
              ⚠️ <strong>注意：</strong>
            </Typography>
            <Box component="ul" sx={{ pl: 3, mt: 1 }}>
              <Typography component="li" variant="body2" paragraph>
                将 <code>your-project.supabase.co</code>{' '}
                替换为你的实际Supabase项目URL
              </Typography>
              <Typography component="li" variant="body2" paragraph>
                从Supabase项目设置中复制实际的API密钥
              </Typography>
              <Typography component="li" variant="body2">
                不要将 <code>.env.local</code> 文件提交到Git仓库
              </Typography>
            </Box>
          </Box>
        </Paper>

        {/* 步骤3：安装依赖 */}
        <Paper
          sx={{
            p: 4,
            mb: 3,
            bgcolor: '#f3e5f5',
            borderLeft: '5px solid #9c27b0',
          }}
        >
          <Typography
            variant="h5"
            gutterBottom
            fontWeight="bold"
            color="#7b1fa2"
          >
            第3步：安装项目依赖
          </Typography>

          <Typography variant="body1" paragraph sx={{ mt: 2, lineHeight: 1.8 }}>
            打开终端（命令行），进入项目目录，执行以下命令：
          </Typography>

          <Box
            component="pre"
            sx={{
              bgcolor: '#263238',
              color: '#aed581',
              p: 3,
              borderRadius: 1,
              fontSize: '0.9rem',
              overflow: 'auto',
              my: 2,
            }}
          >
            {`# 进入项目目录
cd d:\\BigLionX\\3cep

# 安装所有依赖（首次使用需要）
npm install

# 如果安装速度慢，可以使用国内镜像
npm install --registry=https://registry.npmmirror.com`}
          </Box>

          <Box
            sx={{
              bgcolor: '#e8f5e9',
              p: 2,
              borderRadius: 1,
              mt: 2,
            }}
          >
            <Typography variant="body2" sx={{ lineHeight: 1.8 }}>
              💡 <strong>提示：</strong>
              安装过程可能需要几分钟，请耐心等待。如果遇到错误，可以尝试删除{' '}
              <code>node_modules</code> 文件夹后重新安装。
            </Typography>
          </Box>
        </Paper>

        {/* 步骤4：启动开发服务器 */}
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
            第4步：启动开发服务器
          </Typography>

          <Typography variant="body1" paragraph sx={{ mt: 2, lineHeight: 1.8 }}>
            依赖安装完成后，启动开发服务器：
          </Typography>

          <Box
            component="pre"
            sx={{
              bgcolor: '#263238',
              color: '#aed581',
              p: 3,
              borderRadius: 1,
              fontSize: '0.9rem',
              overflow: 'auto',
              my: 2,
            }}
          >
            {`# 启动开发服务器（默认端口3001）
npm run dev

# 或者指定端口
npm run dev -- -p 3000`}
          </Box>

          <Typography variant="body1" paragraph sx={{ mt: 2, lineHeight: 1.8 }}>
            看到以下输出表示启动成功：
          </Typography>

          <Box
            component="pre"
            sx={{
              bgcolor: '#e8f5e9',
              color: '#2e7d32',
              p: 2,
              borderRadius: 1,
              fontSize: '0.85rem',
            }}
          >
            {`✓ Ready in 2.3s
- Local:   http://localhost:3001
- Network: http://192.168.x.x:3001`}
          </Box>

          <Box
            sx={{
              mt: 3,
              p: 3,
              bgcolor: 'white',
              borderRadius: 1,
              border: '2px solid #4caf50',
            }}
          >
            <Typography variant="h6" gutterBottom color="#2e7d32">
              🎉 访问产品库
            </Typography>
            <Typography variant="body1" paragraph>
              在浏览器中打开：
            </Typography>
            <Box
              component="a"
              href="http://localhost:3001/product-library"
              sx={{
                display: 'inline-block',
                bgcolor: '#e8f5e9',
                color: '#2e7d32',
                px: 3,
                py: 1.5,
                borderRadius: 1,
                textDecoration: 'none',
                fontWeight: 'bold',
                fontSize: '1.1rem',
                '&:hover': {
                  bgcolor: '#c8e6c9',
                },
              }}
            >
              http://localhost:3001/product-library
            </Box>
          </Box>
        </Paper>

        {/* 常见问题 */}
        <Paper sx={{ p: 4, mb: 3, bgcolor: '#fce4ec' }}>
          <Typography
            variant="h5"
            gutterBottom
            fontWeight="bold"
            color="#c2185b"
          >
            🔍 环境搭建常见问题
          </Typography>

          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle1" fontWeight="bold" sx={{ mt: 2 }}>
              问题1：npm install 失败怎么办？
            </Typography>
            <Typography
              variant="body2"
              paragraph
              sx={{ pl: 2, lineHeight: 1.8 }}
            >
              尝试以下解决方案：
            </Typography>
            <Box component="ol" sx={{ pl: 5 }}>
              <Typography component="li" variant="body2" paragraph>
                清除缓存：<code>npm cache clean --force</code>
              </Typography>
              <Typography component="li" variant="body2" paragraph>
                删除node_modules后重装：
                <code>rm -rf node_modules && npm install</code>
              </Typography>
              <Typography component="li" variant="body2">
                使用淘宝镜像：
                <code>
                  npm install --registry=https://registry.npmmirror.com
                </code>
              </Typography>
            </Box>

            <Typography variant="subtitle1" fontWeight="bold" sx={{ mt: 2 }}>
              问题2：端口3001被占用怎么办？
            </Typography>
            <Typography
              variant="body2"
              paragraph
              sx={{ pl: 2, lineHeight: 1.8 }}
            >
              使用其他端口启动：<code>npm run dev -- -p 3002</code>
            </Typography>

            <Typography variant="subtitle1" fontWeight="bold" sx={{ mt: 2 }}>
              问题3：数据库连接失败？
            </Typography>
            <Typography
              variant="body2"
              paragraph
              sx={{ pl: 2, lineHeight: 1.8 }}
            >
              检查以下几点：
            </Typography>
            <Box component="ul" sx={{ pl: 5 }}>
              <Typography component="li" variant="body2" paragraph>
                确认 <code>.env.local</code> 中的URL和密钥正确
              </Typography>
              <Typography component="li" variant="body2" paragraph>
                确认已执行迁移脚本创建schema
              </Typography>
              <Typography component="li" variant="body2">
                检查网络连接是否正常
              </Typography>
            </Box>

            <Typography variant="subtitle1" fontWeight="bold" sx={{ mt: 2 }}>
              问题4：如何确认环境配置成功？
            </Typography>
            <Typography
              variant="body2"
              paragraph
              sx={{ pl: 2, lineHeight: 1.8 }}
            >
              访问产品库页面后，尝试：
            </Typography>
            <Box component="ol" sx={{ pl: 5 }}>
              <Typography component="li" variant="body2" paragraph>
                进入"品牌管理"，尝试创建一个新品牌
              </Typography>
              <Typography component="li" variant="body2" paragraph>
                如果没有报错，说明环境配置成功！
              </Typography>
              <Typography component="li" variant="body2">
                如果报错，查看浏览器控制台和终端的错误信息
              </Typography>
            </Box>
          </Box>
        </Paper>

        {/* 技术支持 */}
        <Paper sx={{ p: 4, bgcolor: '#e0f2f1' }}>
          <Typography
            variant="h5"
            gutterBottom
            fontWeight="bold"
            color="#00695c"
          >
            🆘 需要帮助？
          </Typography>
          <Typography variant="body1" paragraph sx={{ lineHeight: 1.8 }}>
            如果在环境搭建过程中遇到问题：
          </Typography>
          <Box component="ul" sx={{ pl: 3 }}>
            <Typography component="li" variant="body2" paragraph>
              📖 查看项目文档：<code>docs/</code> 目录下的相关文档
            </Typography>
            <Typography component="li" variant="body2" paragraph>
              🔍 搜索Issues：在GitHub Issues中搜索类似问题
            </Typography>
            <Typography component="li" variant="body2" paragraph>
              💬 提交Issue：描述你遇到的问题和错误信息
            </Typography>
            <Typography component="li" variant="body2">
              📧 联系技术支持：发送邮件至 support@example.com
            </Typography>
          </Box>
        </Paper>
      </TabPanel>
    </Container>
  );
}
