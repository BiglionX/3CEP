import { NextRequest, NextResponse } from 'next/server';

// 妯℃嫙浜ゆ槗鏁版嵁
const mockTransactions = [
  {
    id: 'txn_001',
    type: 'income',
    category: '缁翠慨鏈嶅姟,
    amount: 288.0,
    description: 'iPhone 12 Pro灞忓箷鏇存崲',
    status: 'completed',
    created_at: '2024-02-28T10:30:00Z',
    updated_at: '2024-02-28T10:30:00Z',
  },
  {
    id: 'txn_002',
    type: 'income',
    category: '閰嶄欢閿€,
    amount: 156.0,
    description: '鍘熻鐢垫睜 + 鏁版嵁绾垮,
    status: 'completed',
    created_at: '2024-02-28T14:15:00Z',
    updated_at: '2024-02-28T14:15:00Z',
  },
  {
    id: 'txn_003',
    type: 'expense',
    category: '閰嶄欢閲囪喘',
    amount: 890.0,
    description: '閲囪喘iPhone 13绯诲垪閰嶄欢',
    status: 'completed',
    created_at: '2024-02-27T09:20:00Z',
    updated_at: '2024-02-27T09:20:00Z',
  },
  {
    id: 'txn_004',
    type: 'income',
    category: '缁翠慨鏈嶅姟,
    amount: 420.0,
    description: 'MacBook Pro閿洏缁翠慨',
    status: 'completed',
    created_at: '2024-02-27T16:45:00Z',
    updated_at: '2024-02-27T16:45:00Z',
  },
  {
    id: 'txn_005',
    type: 'expense',
    category: '浜哄伐鎴愭湰',
    amount: 1200.0,
    description: '鎶€甯堝伐,
    status: 'completed',
    created_at: '2024-02-26T17:00:00Z',
    updated_at: '2024-02-26T17:00:00Z',
  },
  {
    id: 'txn_006',
    type: 'income',
    category: '鏁版嵁鎭㈠',
    amount: 880.0,
    description: 'iPhone鏁版嵁鎭㈠鏈嶅姟',
    status: 'completed',
    created_at: '2024-02-26T11:30:00Z',
    updated_at: '2024-02-26T11:30:00Z',
  },
  {
    id: 'txn_007',
    type: 'expense',
    category: '鎴跨姘寸數',
    amount: 3500.0,
    description: '搴楅摵绉熼噾鍙婃按鐢佃垂',
    status: 'completed',
    created_at: '2024-02-25T08:00:00Z',
    updated_at: '2024-02-25T08:00:00Z',
  },
  {
    id: 'txn_008',
    type: 'income',
    category: '缁翠慨鏈嶅姟,
    amount: 198.0,
    description: '鍗庝负鎵嬫満鍏呯數鍙ｇ淮,
    status: 'pending',
    created_at: '2024-02-28T15:20:00Z',
    updated_at: '2024-02-28T15:20:00Z',
  },
  {
    id: 'txn_009',
    type: 'expense',
    category: '钀ラ攢鎺ㄥ箍',
    amount: 500.0,
    description: '绾夸笂骞垮憡鎶曟斁',
    status: 'completed',
    created_at: '2024-02-24T10:00:00Z',
    updated_at: '2024-02-24T10:00:00Z',
  },
  {
    id: 'txn_010',
    type: 'income',
    category: '閰嶄欢閿€,
    amount: 234.0,
    description: 'AirPods Pro鑰虫満',
    status: 'completed',
    created_at: '2024-02-28T13:45:00Z',
    updated_at: '2024-02-28T13:45:00Z',
  },
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get('days') || '30');

    // 鏍规嵁澶╂暟杩囨护浜ゆ槗鏁版嵁
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    const filteredTransactions = mockTransactions.filter(
      txn => new Date(txn.created_at) >= cutoffDate
    );

    // 璁＄畻璐㈠姟姹    const completedTransactions = filteredTransactions.filter(
      txn => txn.status === 'completed'
    );

    const total_income = completedTransactions
      .filter(txn => txn.type === 'income')
      .reduce((sum, txn) => sum + txn.amount, 0);

    const total_expense = completedTransactions
      .filter(txn => txn.type === 'expense')
      .reduce((sum, txn) => sum + txn.amount, 0);

    const net_profit = total_income - total_expense;
    const transaction_count = completedTransactions.length;
    const avg_transaction_amount =
      transaction_count > 0
         (total_income + total_expense) / transaction_count
        : 0;

    return NextResponse.json({
      success: true,
      data: {
        total_income,
        total_expense,
        net_profit,
        transaction_count,
        avg_transaction_amount,
      },
    });
  } catch (error) {
    console.error('鑾峰彇璐㈠姟姹囨€诲け', error);
    return NextResponse.json(
      { success: false, error: '鑾峰彇璐㈠姟姹囨€诲け, data: null },
      { status: 500 }
    );
  }
}

