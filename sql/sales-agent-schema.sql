-- 销售智能体模块数据库表结构
-- 创建时间：2026-03-02
-- 版本：v1.0.0

-- 客户表
CREATE TABLE IF NOT EXISTS sales_customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_name VARCHAR(255) NOT NULL,
  contact_person VARCHAR(100),
  email VARCHAR(255),
  phone VARCHAR(50),
  industry VARCHAR(100),
  scale VARCHAR(50),
  grade VARCHAR(20) DEFAULT 'D',
  source VARCHAR(50),
  status VARCHAR(20) DEFAULT 'active',
  total_revenue DECIMAL(15,2) DEFAULT 0,
  last_order_date TIMESTAMP,
  credit_score INTEGER,
  payment_terms VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 报价表
CREATE TABLE IF NOT EXISTS sales_quotations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quote_number VARCHAR(50) UNIQUE NOT NULL,
  customer_id UUID REFERENCES sales_customers(id) ON DELETE CASCADE,
  product_items JSONB NOT NULL,
  subtotal DECIMAL(15,2),
  tax_rate DECIMAL(5,4) DEFAULT 0.13,
  tax_amount DECIMAL(15,2),
  total_amount DECIMAL(15,2),
  valid_until DATE,
  status VARCHAR(20) DEFAULT 'draft',
  notes TEXT,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 合同表
CREATE TABLE IF NOT EXISTS sales_contracts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contract_number VARCHAR(50) UNIQUE NOT NULL,
  quotation_id UUID REFERENCES sales_quotations(id),
  customer_id UUID REFERENCES sales_customers(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  content TEXT,
  amount DECIMAL(15,2),
  start_date DATE,
  end_date DATE,
  payment_terms JSONB,
  delivery_terms JSONB,
  status VARCHAR(20) DEFAULT 'draft',
  signed_at TIMESTAMP WITH TIME ZONE,
  signed_by_customer VARCHAR(100),
  signed_by_company VARCHAR(100),
  document_url VARCHAR(500),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 订单表
CREATE TABLE IF NOT EXISTS sales_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number VARCHAR(50) UNIQUE NOT NULL,
  contract_id UUID REFERENCES sales_contracts(id),
  customer_id UUID REFERENCES sales_customers(id) ON DELETE CASCADE,
  items JSONB NOT NULL,
  total_amount DECIMAL(15,2),
  paid_amount DECIMAL(15,2) DEFAULT 0,
  status VARCHAR(20) DEFAULT 'pending',
  shipping_address JSONB,
  tracking_number VARCHAR(100),
  expected_delivery_date DATE,
  actual_delivery_date DATE,
  customer_feedback TEXT,
  satisfaction_score INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引
CREATE INDEX idx_sales_customers_grade ON sales_customers(grade);
CREATE INDEX idx_sales_customers_status ON sales_customers(status);
CREATE INDEX idx_sales_quotations_customer_id ON sales_quotations(customer_id);
CREATE INDEX idx_sales_quotations_status ON sales_quotations(status);
CREATE INDEX idx_sales_contracts_customer_id ON sales_contracts(customer_id);
CREATE INDEX idx_sales_contracts_status ON sales_contracts(status);
CREATE INDEX idx_sales_orders_customer_id ON sales_orders(customer_id);
CREATE INDEX idx_sales_orders_status ON sales_orders(status);
