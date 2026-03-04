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
  DatePicker,
  TimePicker,
  Tabs,
  Badge,
  Tooltip,
  Dropdown,
  MenuProps,
} from 'antd';
import {
  ClockCircleOutlined,
  PlayCircleOutlined,
  StopOutlined,
  EditOutlined,
  DeleteOutlined,
  PlusOutlined,
  ReloadOutlined,
  MailOutlined,
  FilePdfOutlined,
  FileExcelOutlined,
  FileTextOutlined,
  Html5Outlined,
  CalendarOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';

const { Option } = Select;
const { TextArea } = Input;
const { RangePicker } = DatePicker;
const { TabPane } = Tabs;

interface ScheduleConfig {
  frequency: 'minute' | 'hour' | 'day' | 'week' | 'month';
  interval?: number;
  startTime?: string;
  endTime?: string;
  daysOfWeek?: number[];
  daysOfMonth?: number[];
}

interface ScheduledReport {
  id: string;
  templateId: string;
  name: string;
  description?: string;
  schedule: ScheduleConfig;
  recipients: string[];
  format: 'pdf' | 'excel' | 'csv' | 'html';
  enabled: boolean;
  lastRun?: string;
  nextRun?: string;
  createdAt: string;
  updatedAt: string;
}

interface Subscription {
  id: string;
  userId: string;
  reportId: string;
  email: string;
  frequency: 'immediate' | 'daily' | 'weekly' | 'monthly';
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
}

interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  type: string;
}

const ReportSchedulerDashboard: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [schedules, setSchedules] = useState<ScheduledReport[]>([]);
  const [templates, setTemplates] = useState<ReportTemplate[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [schedulerStatus, setSchedulerStatus] = useState<any>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingSchedule, setEditingSchedule] =
    useState<ScheduledReport | null>(null);
  const [activeTab, setActiveTab] = useState('schedules');
  const [form] = Form.useForm();

  // 初始化数?
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // 获取调度任务
      const schedulesRes = await fetch(
        '/api/data-center/scheduler?action=list'
      );
      const schedulesData = await schedulesRes.json();
      if (schedulesData.success) {
        setSchedules(schedulesData.data);
      }

      // 获取报表模板
      const templatesRes = await fetch(
        '/api/data-center/scheduler?action=templates'
      );
      const templatesData = await templatesRes.json();
      if (templatesData.success) {
        setTemplates(templatesData.data);
      }

      // 获取调度器状?
      const statusRes = await fetch('/api/data-center/scheduler?action=status');
      const statusData = await statusData.json();
      if (statusData.success) {
        setSchedulerStatus(statusData.data);
      }
    } catch (error) {
      console.error('获取数据失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSchedule = () => {
    setEditingSchedule(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEditSchedule = (record: ScheduledReport) => {
    setEditingSchedule(record);
    form.setFieldsValue({
      ...record,
      schedule: {
        ...record.schedule,
        startTime: record.schedule.startTime
          ? dayjs(record.schedule.startTime, 'HH:mm')
          : null,
        endTime: record.schedule.endTime
          ? dayjs(record.schedule.endTime, 'HH:mm')
          : null,
      },
    });
    setModalVisible(true);
  };

  const handleDeleteSchedule = async (id: string) => {
    try {
      const res = await fetch(`/api/data-center/scheduler?id=${id}`, {
        method: 'DELETE',
      });
      const data = await res.json();

      if (data.success) {
        fetchData();
      }
    } catch (error) {
      console.error('删除失败:', error);
    }
  };

  const handleToggleSchedule = async (id: string, enabled: boolean) => {
    try {
      const res = await fetch(`/api/data-center/scheduler?id=${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled }),
      });
      const data = await res.json();

      if (data.success) {
        fetchData();
      }
    } catch (error) {
      console.error('更新失败:', error);
    }
  };

  const handleSubmit = async (values: any) => {
    try {
      const scheduleData = {
        ...values,
        schedule: {
          ...values.schedule,
          startTime: values.schedule.startTime
            ? values.schedule.startTime.format('HH:mm')
            : undefined,
          endTime: values.schedule.endTime
            ? values.schedule.endTime.format('HH:mm')
            : undefined,
        },
      };

      const url = editingSchedule
        ? `/api/data-center/scheduler?id=${editingSchedule.id}`
        : '/api/data-center/scheduler';

      const method = editingSchedule ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(scheduleData),
      });

      const data = await res.json();

      if (data.success) {
        setModalVisible(false);
        fetchData();
      }
    } catch (error) {
      console.error('提交失败:', error);
    }
  };

  const getFrequencyLabel = (schedule: ScheduleConfig) => {
    const intervals: Record<string, string> = {
      minute: '分钟',
      hour: '小时',
      day: '�?,
      week: '�?,
      month: '�?,
    };

    return `${schedule.interval || 1}${intervals[schedule.frequency]}`;
  };

  const getFormatIcon = (format: string) => {
    switch (format) {
      case 'pdf':
        return <FilePdfOutlined />;
      case 'excel':
        return <FileExcelOutlined />;
      case 'csv':
        return <FileTextOutlined />;
      case 'html':
        return <Html5Outlined />;
      default:
        return <FileTextOutlined />;
    }
  };

  const getStatusBadge = (enabled: boolean) => (
    <Badge
      status={enabled ? 'success' : 'default'}
      text={enabled ? '启用' : '禁用'}
    />
  );

  const scheduleColumns = [
    {
      title: '任务名称',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: ScheduledReport) => (
        <Space>
          <ClockCircleOutlined />
          <span>{text}</span>
          {record.description && (
            <Tooltip title={record.description}>
              <Tag color="blue">说明</Tag>
            </Tooltip>
          )}
        </Space>
      ),
    },
    {
      title: '报表模板',
      dataIndex: 'templateId',
      key: 'templateId',
      render: (templateId: string) => {
        const template = templates.find(t => t.id === templateId);
        return template ? template.name : templateId;
      },
    },
    {
      title: '调度频率',
      dataIndex: 'schedule',
      key: 'schedule',
      render: (schedule: ScheduleConfig) => getFrequencyLabel(schedule),
    },
    {
      title: '接收格式',
      dataIndex: 'format',
      key: 'format',
      render: (format: string) => (
        <Tag icon={getFormatIcon(format)} color="processing">
          {format.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: '接收?,
      dataIndex: 'recipients',
      key: 'recipients',
      render: (recipients: string[]) => (
        <Tooltip title={recipients.join(', ')}>
          <Tag icon={<MailOutlined />} color="geekblue">
            {recipients.length} 个邮?
          </Tag>
        </Tooltip>
      ),
    },
    {
      title: '状?,
      dataIndex: 'enabled',
      key: 'enabled',
      render: (enabled: boolean, record: ScheduledReport) => (
        <Space>
          {getStatusBadge(enabled)}
          {enabled && record.nextRun && (
            <Tooltip
              title={`下次执行: ${dayjs(record.nextRun).format('YYYY-MM-DD HH:mm:ss')}`}
            >
              <CalendarOutlined />
            </Tooltip>
          )}
        </Space>
      ),
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: ScheduledReport) => {
        const menuItems: MenuProps['items'] = [
          {
            key: 'toggle',
            icon: record.enabled ? <StopOutlined /> : <PlayCircleOutlined />,
            label: record.enabled ? '暂停' : '启用',
            onClick: () => handleToggleSchedule(record.id, !record.enabled),
          },
          {
            key: 'edit',
            icon: <EditOutlined />,
            label: '编辑',
            onClick: () => handleEditSchedule(record),
          },
          {
            key: 'delete',
            icon: <DeleteOutlined />,
            label: '删除',
            danger: true,
            onClick: () => handleDeleteSchedule(record.id),
          },
        ];

        return (
          <Space>
            <Dropdown menu={{ items: menuItems }} trigger={['click']}>
              <Button>操作</Button>
            </Dropdown>
          </Space>
        );
      },
    },
  ];

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">
          📊 报表调度管理
        </h1>
        <p className="text-gray-600">管理和监控报表定时生成任?/p>
      </div>

      {/* 状态概?*/}
      {schedulerStatus && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {schedulerStatus.total}
              </div>
              <div className="text-gray-500">总任务数</div>
            </div>
          </Card>
          <Card>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {schedulerStatus.active}
              </div>
              <div className="text-gray-500">活跃任务</div>
            </div>
          </Card>
          <Card>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {Math.round(
                  (schedulerStatus.active / schedulerStatus.total) * 100
                ) || 0}
                %
              </div>
              <div className="text-gray-500">激活率</div>
            </div>
          </Card>
        </div>
      )}

      <Tabs activeKey={activeTab} onChange={setActiveTab}>
        <TabPane tab="调度任务" key="schedules">
          <Card
            title="调度任务列表"
            extra={
              <Space>
                <Button icon={<ReloadOutlined />} onClick={fetchData}>
                  刷新
                </Button>
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={handleCreateSchedule}
                >
                  新建调度
                </Button>
              </Space>
            }
          >
            <Table
              loading={loading}
              dataSource={schedules}
              columns={scheduleColumns}
              rowKey="id"
              pagination={{ pageSize: 10 }}
            />
          </Card>
        </TabPane>

        <TabPane tab="订阅管理" key="subscriptions">
          <Card title="订阅列表">
            <Table
              loading={loading}
              dataSource={subscriptions}
              columns={[
                { title: '邮箱', dataIndex: 'email', key: 'email' },
                { title: '订阅频率', dataIndex: 'frequency', key: 'frequency' },
                {
                  title: '状?,
                  dataIndex: 'enabled',
                  key: 'enabled',
                  render: getStatusBadge,
                },
                { title: '创建时间', dataIndex: 'createdAt', key: 'createdAt' },
              ]}
              rowKey="id"
              pagination={{ pageSize: 10 }}
            />
          </Card>
        </TabPane>
      </Tabs>

      {/* 调度任务编辑模态框 */}
      <Modal
        title={editingSchedule ? '编辑调度任务' : '新建调度任务'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={800}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item
            name="name"
            label="任务名称"
            rules={[{ required: true, message: '请输入任务名? }]}
          >
            <Input placeholder="输入调度任务名称" />
          </Form.Item>

          <Form.Item name="description" label="任务描述">
            <TextArea placeholder="输入任务描述（可选）" rows={3} />
          </Form.Item>

          <Form.Item
            name="templateId"
            label="报表模板"
            rules={[{ required: true, message: '请选择报表模板' }]}
          >
            <Select placeholder="选择报表模板">
              {templates.map(template => (
                <Option key={template.id} value={template.id}>
                  {template.name}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <div className="grid grid-cols-2 gap-4">
            <Form.Item
              name="format"
              label="报表格式"
              rules={[{ required: true, message: '请选择报表格式' }]}
            >
              <Select placeholder="选择报表格式">
                <Option value="pdf">PDF</Option>
                <Option value="excel">Excel</Option>
                <Option value="csv">CSV</Option>
                <Option value="html">HTML</Option>
              </Select>
            </Form.Item>

            <Form.Item name="enabled" label="是否启用" valuePropName="checked">
              <Switch />
            </Form.Item>
          </div>

          <Form.Item
            name="recipients"
            label="接收者邮?
            rules={[{ required: true, message: '请输入接收者邮? }]}
          >
            <Select
              mode="tags"
              placeholder="输入邮箱地址，按回车添加"
              tokenSeparators={[',']}
            />
          </Form.Item>

          {/* 调度配置 */}
          <div className="border rounded-lg p-4 mb-4">
            <h3 className="font-medium mb-3">调度配置</h3>

            <div className="grid grid-cols-2 gap-4">
              <Form.Item
                name={['schedule', 'frequency']}
                label="频率"
                rules={[{ required: true, message: '请选择调度频率' }]}
              >
                <Select placeholder="选择调度频率">
                  <Option value="minute">每分?/Option>
                  <Option value="hour">每小?/Option>
                  <Option value="day">每天</Option>
                  <Option value="week">每周</Option>
                  <Option value="month">每月</Option>
                </Select>
              </Form.Item>

              <Form.Item name={['schedule', 'interval']} label="间隔">
                <Input type="number" min="1" placeholder="间隔倍数" />
              </Form.Item>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Form.Item name={['schedule', 'startTime']} label="开始时?>
                <TimePicker format="HH:mm" placeholder="开始时? />
              </Form.Item>

              <Form.Item name={['schedule', 'endTime']} label="结束时间">
                <TimePicker format="HH:mm" placeholder="结束时间" />
              </Form.Item>
            </div>
          </div>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                {editingSchedule ? '更新' : '创建'}
              </Button>
              <Button onClick={() => setModalVisible(false)}>取消</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ReportSchedulerDashboard;
