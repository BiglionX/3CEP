'use client';

import { useState, useEffect } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

interface Transaction {
  id: string;
  type: 'income' | 'expense';
  category: string;
  amount: number;
  description: string;
  status: 'completed' | 'pending' | 'failed';
  created_at: string;
  updated_at: string;
}

interface FinancialSummary {
  total_income: number;
  total_expense: number;
  net_profit: number;
  transaction_count: number;
  avg_transaction_amount: number;
}

interface MonthlyData {
  month: string;
  income: number;
  expense: number;
  profit: number;
}

interface CategoryData {
  name: string;
  value: number;
  color: string;
}

export default function FinanceManagementPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [summary, setSummary] = useState<FinancialSummary>({
    total_income: 0,
    total_expense: 0,
    net_profit: 0,
    transaction_count: 0,
    avg_transaction_amount: 0,
  });
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([]);
  const [incomeCategories, setIncomeCategories] = useState<CategoryData[]>([]);
  const [expenseCategories, setExpenseCategories] = useState<CategoryData[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('30');

  // 获取财务数据
  const fetchFinancialData = async () => {
    try {
      setLoading(true);

      // 获取交易列表
      const transactionsResponse = await fetch(
        `/api/admin/finance/transactionsdays=${dateRange}`
      );
      const transactionsResult = await transactionsResponse.json();

      // 获取财务汇      const summaryResponse = await fetch(
        `/api/admin/finance/summarydays=${dateRange}`
      );
      const summaryResult = await summaryResponse.json();

      // 获取月度数据
      const monthlyResponse = await fetch(
        `/api/admin/finance/monthlymonths=6`
      );
      const monthlyResult = await monthlyResponse.json();

      // 获取分类数据
      const categoriesResponse = await fetch(
        `/api/admin/finance/categoriesdays=${dateRange}`
      );
      const categoriesResult = await categoriesResponse.json();

      if (transactionsResult.data) {
        setTransactions(transactionsResult.data);
      }

      if (summaryResult.data) {
        setSummary(summaryResult.data);
      }

      if (monthlyResult.data) {
        setMonthlyData(monthlyResult.data);
      }

      if (categoriesResult.data) {
        setIncomeCategories(categoriesResult.data.income);
        setExpenseCategories(categoriesResult.data.expense);
      }
    } catch (error) {
      console.error('获取财务数据失败:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFinancialData();
  }, [dateRange]);

  // 格式化金  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('zh-CN', {
      style: 'currency',
      currency: 'CNY',
    }).format(amount);
  };

  // 获取状态标签样  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { text: string; className: string }> = {
      completed: { text: '已完, className: 'bg-green-100 text-green-800' },
      pending: { text: '处理, className: 'bg-yellow-100 text-yellow-800' },
      failed: { text: '失败', className: 'bg-red-100 text-red-800' },
    };

    const config = statusMap[status] || {
      text: status,
      className: 'bg-gray-100 text-gray-800',
    };
    return (
      <span
        className={`px-2 py-1 rounded-full text-xs font-medium ${config.className}`}
      >
        {config.text}
      </span>
    );
  };

  // 获取交易类型标签
  const getTypeBadge = (type: string) => {
    const typeMap: Record<string, { text: string; className: string }> = {
      income: { text: '收入', className: 'bg-green-100 text-green-800' },
      expense: { text: '支出', className: 'bg-red-100 text-red-800' },
    };

    const config = typeMap[type] || {
      text: type,
      className: 'bg-gray-100 text-gray-800',
    };
    return (
      <span
        className={`px-2 py-1 rounded-full text-xs font-medium ${config.className}`}
      >
        {config.text}
      </span>
    );
  };

  // 颜色配置
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">财务管理</h1>
        <p className="text-gray-600 mt-1">监控和管理系统财务状/p>
      </div>

      {/* 时间范围选择 */}
      <div className="flex gap-2">
        <Button
          variant={dateRange === '7' ? 'default' : 'outline'}
          onClick={() => setDateRange('7')}
          size="sm"
        >
          最        </Button>
        <Button
          variant={dateRange === '30' ? 'default' : 'outline'}
          onClick={() => setDateRange('30')}
          size="sm"
        >
          最0        </Button>
        <Button
          variant={dateRange === '90' ? 'default' : 'outline'}
          onClick={() => setDateRange('90')}
          size="sm"
        >
          最0        </Button>
      </div>

      {/* 财务概览卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>总收/CardDescription>
            <CardTitle className="text-2xl text-green-600">
              {formatCurrency(summary.total_income)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-gray-500">统计周期内所有收/p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>总支/CardDescription>
            <CardTitle className="text-2xl text-red-600">
              {formatCurrency(summary.total_expense)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-gray-500">统计周期内所有支/p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>净利润</CardDescription>
            <CardTitle
              className={`text-2xl ${summary.net_profit >= 0 ? 'text-green-600' : 'text-red-600'}`}
            >
              {formatCurrency(summary.net_profit)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-gray-500">收入减去支出</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>交易笔数</CardDescription>
            <CardTitle className="text-2xl text-blue-600">
              {summary.transaction_count}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-gray-500">
              平均金额: {formatCurrency(summary.avg_transaction_amount)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* 图表区域 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 收入支出趋势*/}
        <Card>
          <CardHeader>
            <CardTitle>收支趋势</CardTitle>
            <CardDescription>个月收支变化</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={value => formatCurrency(Number(value))} />
                <Legend />
                <Bar dataKey="income" name="收入" fill="#10B981" />
                <Bar dataKey="expense" name="支出" fill="#EF4444" />
                <Bar dataKey="profit" name="利润" fill="#3B82F6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* 收入分类饼图 */}
        <Card>
          <CardHeader>
            <CardTitle>收入构成</CardTitle>
            <CardDescription>各类收入占比</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={incomeCategories}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) =>
                    `${name}: ${(percent * 100).toFixed(0)}%`
                  }
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {incomeCategories.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip formatter={value => formatCurrency(Number(value))} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* 支出分类饼图 */}
        <Card>
          <CardHeader>
            <CardTitle>支出构成</CardTitle>
            <CardDescription>各类支出占比</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={expenseCategories}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) =>
                    `${name}: ${(percent * 100).toFixed(0)}%`
                  }
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {expenseCategories.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip formatter={value => formatCurrency(Number(value))} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* 交易记录表格 */}
      <Card>
        <CardHeader>
          <CardTitle>交易记录</CardTitle>
          <CardDescription>最近的财务交易明细</CardDescription>
        </CardHeader>
        <CardContent>
          {loading  (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-2 text-gray-600">加载中..</span>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      交易时间
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      类型
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      分类
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      金额
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      描述
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      状                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {transactions.map(transaction => (
                    <tr key={transaction.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(transaction.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getTypeBadge(transaction.type)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {transaction.category}
                      </td>
                      <td
                        className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${
                          transaction.type === 'income'
                             'text-green-600'
                            : 'text-red-600'
                        }`}
                      >
                        {transaction.type === 'income' ? '+' : '-'}
                        {formatCurrency(Math.abs(transaction.amount))}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {transaction.description}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(transaction.status)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

