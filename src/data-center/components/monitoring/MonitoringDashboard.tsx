'use client';

import React, { useState, useEffect } from 'react';
import {
  Card,
  Button,
  Table,
  Tag,
  Space,
  Modal,
  Form,
  Input,
  Select,
  Switch,
  Alert,
} from 'antd';
import {
  Monitor,
  AlertTriangle,
  CheckCircle,
  Clock,
  RefreshCw,
  Play,
  Pause,
  Settings,
  BarChart3,
} from 'lucide-react';

const { Option } = Select;

interface ModuleStatus {
  name: string;
  integrated: boolean;
  monitors: number;
  activeAlerts: number;
  lastSync: string | null;
}

interface AlertRule {
  id: string;
  name: string;
  condition: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  enabled: boolean;
  channels: string[];
  createdAt: string;
  lastTriggered: string | null;
}

interface PerformanceMetric {
  component: string;
  metric: string;
  value: number;
  threshold: number;
  status: 'normal' | 'warning' | 'critical';
}

const MonitoringDashboard: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [moduleStatus, setModuleStatus] = useState<ModuleStatus[]>([]);
  const [alertRules, setAlertRules] = useState<AlertRule[]>([]);
  const [performanceMetrics, setPerformanceMetrics] = useState<
    PerformanceMetric[]
  >([]);
  const [showRuleModal, setShowRuleModal] = useState(false);
  const [form] = Form.useForm();

  // 获取监控整合状?
  const fetchIntegrationStatus = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        '/api/data-center/monitoring/integrator?action=status'
      );
      const data = await response.json();

      if (data.success) {
        const statusArray = Object.entries(data.data.moduleDetails).map(
          ([name, details]: [string, any]) => ({
            name,
            ...details,
          })
        );
        setModuleStatus(statusArray);
      }
    } catch (error) {
      console.error('获取监控状态失?', error);
    } finally {
      setLoading(false);
    }
  };

  // 获取告警规则
  const fetchAlertRules = async () => {
    try {
      const response = await fetch(
        '/api/data-center/monitoring/alert-engine?action=list'
      );
      const data = await response.json();

      if (data.success) {
        setAlertRules(data.data.rules);
      }
    } catch (error) {
      console.error('获取告警规则失败:', error);
    }
  };

  // 获取性能指标
  const fetchPerformanceMetrics = async () => {
    try {
      const response = await fetch(
        '/api/data-center/monitoring/performance?action=analyze&timeframe=24h'
      );
      const data = await response.json();

      if (data.success) {
        // 转换性能数据为表格格?
        const metrics: PerformanceMetric[] = [
          {
            component: 'CPU',
            metric: '使用?,
            value: data.data.metrics.cpu.usage,
            threshold: 80,
            status:
              data.data.metrics.cpu.usage > 80
                ? 'critical'
                : data.data.metrics.cpu.usage > 60
                  ? 'warning'
                  : 'normal',
          },
          {
            component: '内存',
            metric: '使用?,
            value: data.data.metrics.memory.usagePercentage,
            threshold: 85,
            status:
              data.data.metrics.memory.usagePercentage > 85
                ? 'critical'
                : data.data.metrics.memory.usagePercentage > 70
                  ? 'warning'
                  : 'normal',
          },
          {
            component: '数据?,
            metric: '连接?,
            value: data.data.metrics.database.connections,
            threshold: 1000,
            status:
              data.data.metrics.database.connections > 1000
                ? 'critical'
                : 'normal',
          },
          {
            component: 'API',
            metric: '响应时间(ms)',
            value: data.data.metrics.api.averageResponseTime,
            threshold: 300,
            status:
              data.data.metrics.api.averageResponseTime > 300
                ? 'critical'
                : data.data.metrics.api.averageResponseTime > 200
                  ? 'warning'
                  : 'normal',
          },
        ];
        setPerformanceMetrics(metrics);
      }
    } catch (error) {
      console.error('获取性能指标失败:', error);
    }
  };

  // 整合模块监控
  const integrateModule = async (moduleName: string) => {
    try {
      setLoading(true);
      const response = await fetch(
        `/api/data-center/monitoring/integrator?action=integrate&module=${moduleName}`
      );
      const data = await response.json();

      if (data.success) {
        Modal.success({
          title: '整合成功',
          content: `${moduleName}监控整合完成`,
        });
        fetchIntegrationStatus();
      }
    } catch (error) {
      console.error('整合失败:', error);
      Modal.error({
        title: '整合失败',
        content: '监控整合过程中出现错?,
      });
    } finally {
      setLoading(false);
    }
  };

  // 创建告警规则
  const handleCreateRule = async (values: any) => {
    try {
      const response = await fetch('/api/data-center/monitoring/alert-engine', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create',
          ...values,
        }),
      });

      const data = await response.json();

      if (data.success) {
        Modal.success({
          title: '创建成功',
          content: '告警规则创建成功',
        });
        setShowRuleModal(false);
        form.resetFields();
        fetchAlertRules();
      }
    } catch (error) {
      console.error('创建规则失败:', error);
      Modal.error({
        title: '创建失败',
        content: '告警规则创建过程中出现错?,
      });
    }
  };

  // 切换规则状?
  const toggleRuleStatus = async (ruleId: string, enabled: boolean) => {
    try {
      const response = await fetch('/api/data-center/monitoring/alert-engine', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update',
          ruleId,
          enabled,
        }),
      });

      const data = await response.json();

      if (data.success) {
        fetchAlertRules();
      }
    } catch (error) {
      console.error('更新规则状态失?', error);
    }
  };

  useEffect(() => {
    fetchIntegrationStatus();
    fetchAlertRules();
    fetchPerformanceMetrics();

    // 设置定时刷新
    const interval = setInterval(() => {
      fetchIntegrationStatus();
      fetchPerformanceMetrics();
    }, 30000); // �?0秒刷新一?

    return () => clearInterval(interval);
  }, []);

  // 模块状态表格列定义
  const moduleColumns = [
    {
      title: '模块名称',
      dataIndex: 'name',
      key: 'name',
      render: (name: string) => (
        <Space>
          <Monitor className="w-4 h-4" />
          <span className="font-medium capitalize">
            {name.replace('-', ' ')}
          </span>
        </Space>
      ),
    },
    {
      title: '整合状?,
      dataIndex: 'integrated',
      key: 'integrated',
      render: (integrated: boolean) => (
        <Tag color={integrated ? 'green' : 'orange'}>
          {integrated ? '已整? : '未整?}
        </Tag>
      ),
    },
    {
      title: '监控项数',
      dataIndex: 'monitors',
      key: 'monitors',
      render: (count: number) => <span>{count}</span>,
    },
    {
      title: '活跃告警',
      dataIndex: 'activeAlerts',
      key: 'activeAlerts',
      render: (alerts: number) => (
        <Tag color={alerts > 0 ? 'red' : 'green'}>{alerts} �?/Tag>
      ),
    },
    {
      title: '最后同?,
      dataIndex: 'lastSync',
      key: 'lastSync',
      render: (date: string | null) =>
        date ? new Date(date).toLocaleString() : '从未同步',
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: ModuleStatus) =>
        !record.integrated ? (
          <Button
            type="primary"
            size="small"
            onClick={() => integrateModule(record.name)}
            loading={loading}
          >
            整合监控
          </Button>
        ) : (
          <Button type="text" size="small" disabled>
            已整?
          </Button>
        ),
    },
  ];

  // 告警规则表格列定?
  const ruleColumns = [
    {
      title: '规则名称',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '严重程度',
      dataIndex: 'severity',
      key: 'severity',
      render: (severity: string) => {
        const colors: Record<string, string> = {
          low: 'blue',
          medium: 'gold',
          high: 'orange',
          critical: 'red',
        };
        return <Tag color={colors[severity]}>{severity.toUpperCase()}</Tag>;
      },
    },
    {
      title: '条件表达?,
      dataIndex: 'condition',
      key: 'condition',
    },
    {
      title: '状?,
      dataIndex: 'enabled',
      key: 'enabled',
      render: (enabled: boolean, record: AlertRule) => (
        <Switch
          checked={enabled}
          onChange={checked => toggleRuleStatus(record.id, checked)}
        />
      ),
    },
    {
      title: '通知渠道',
      dataIndex: 'channels',
      key: 'channels',
      render: (channels: string[]) => (
        <Space>
          {channels.map(channel => (
            <Tag key={channel} color="blue">
              {channel}
            </Tag>
          ))}
        </Space>
      ),
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => new Date(date).toLocaleString(),
    },
  ];

  // 性能指标表格列定?
  const performanceColumns = [
    {
      title: '组件',
      dataIndex: 'component',
      key: 'component',
    },
    {
      title: '指标',
      dataIndex: 'metric',
      key: 'metric',
    },
    {
      title: '当前?,
      dataIndex: 'value',
      key: 'value',
      render: (value: number) => (
        <span className="font-medium">{value.toFixed(1)}</span>
      ),
    },
    {
      title: '阈?,
      dataIndex: 'threshold',
      key: 'threshold',
    },
    {
      title: '状?,
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const statusConfig = {
          normal: { color: 'green', text: '正常', icon: CheckCircle },
          warning: { color: 'orange', text: '警告', icon: AlertTriangle },
          critical: { color: 'red', text: '严重', icon: AlertTriangle },
        };

        const config = statusConfig[status as keyof typeof statusConfig];
        const IconComponent = config.icon;

        return (
          <Tag color={config.color}>
            <IconComponent className="w-3 h-3 inline mr-1" />
            {config.text}
          </Tag>
        );
      },
    },
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">监控告警系统</h1>
        <Space>
          <Button
            icon={<RefreshCw className="w-4 h-4" />}
            onClick={() => {
              fetchIntegrationStatus();
              fetchPerformanceMetrics();
            }}
            loading={loading}
          >
            刷新
          </Button>
          <Button
            type="primary"
            icon={<Settings className="w-4 h-4" />}
            onClick={() => setShowRuleModal(true)}
          >
            新建规则
          </Button>
        </Space>
      </div>

      {/* 系统概览 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {moduleStatus.filter(m => m.integrated).length}
            </div>
            <div className="text-gray-500">已整合模?/div>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">
              {moduleStatus.reduce((sum, m) => sum + m.activeAlerts, 0)}
            </div>
            <div className="text-gray-500">活跃告警</div>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {performanceMetrics.filter(m => m.status === 'normal').length}
            </div>
            <div className="text-gray-500">正常指标</div>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">
              {performanceMetrics.filter(m => m.status !== 'normal').length}
            </div>
            <div className="text-gray-500">异常指标</div>
          </div>
        </Card>
      </div>

      {/* 模块整合状?*/}
      <Card
        title={
          <Space>
            <Monitor className="w-5 h-5" />
            <span>模块监控整合状?/span>
          </Space>
        }
      >
        <Table
          dataSource={moduleStatus}
          columns={moduleColumns}
          rowKey="name"
          loading={loading}
          pagination={false}
        />
      </Card>

      {/* 性能指标监控 */}
      <Card
        title={
          <Space>
            <BarChart3 className="w-5 h-5" />
            <span>系统性能指标</span>
          </Space>
        }
      >
        <Table
          dataSource={performanceMetrics}
          columns={performanceColumns}
          rowKey={record => `${record.component}-${record.metric}`}
          pagination={false}
        />
      </Card>

      {/* 告警规则管理 */}
      <Card
        title={
          <Space>
            <AlertTriangle className="w-5 h-5" />
            <span>告警规则管理</span>
          </Space>
        }
      >
        <Table
          dataSource={alertRules}
          columns={ruleColumns}
          rowKey="id"
          pagination={{
            pageSize: 5,
            showSizeChanger: true,
            showQuickJumper: true,
          }}
        />
      </Card>

      {/* 创建规则模态框 */}
      <Modal
        title="创建告警规则"
        open={showRuleModal}
        onCancel={() => {
          setShowRuleModal(false);
          form.resetFields();
        }}
        footer={null}
        width={600}
      >
        <Form form={form} layout="vertical" onFinish={handleCreateRule}>
          <Form.Item
            name="name"
            label="规则名称"
            rules={[{ required: true, message: '请输入规则名? }]}
          >
            <Input placeholder="例如：数据库连接异常" />
          </Form.Item>

          <Form.Item
            name="condition"
            label="告警条件"
            rules={[{ required: true, message: '请输入告警条件表达式' }]}
          >
            <Input placeholder="例如：database.connections > 1000" />
          </Form.Item>

          <Form.Item
            name="severity"
            label="严重程度"
            rules={[{ required: true, message: '请选择严重程度' }]}
          >
            <Select placeholder="选择严重程度">
              <Option value="low">�?/Option>
              <Option value="medium">�?/Option>
              <Option value="high">�?/Option>
              <Option value="critical">严重</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="notificationChannels"
            label="通知渠道"
            rules={[{ required: true, message: '请选择通知渠道' }]}
          >
            <Select mode="multiple" placeholder="选择通知渠道">
              <Option value="email">邮件</Option>
              <Option value="slack">Slack</Option>
              <Option value="sms">短信</Option>
              <Option value="webhook">Webhook</Option>
            </Select>
          </Form.Item>

          <Form.Item name="enabled" label="是否启用" initialValue={true}>
            <Switch defaultChecked />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                创建规则
              </Button>
              <Button
                onClick={() => {
                  setShowRuleModal(false);
                  form.resetFields();
                }}
              >
                取消
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default MonitoringDashboard;
