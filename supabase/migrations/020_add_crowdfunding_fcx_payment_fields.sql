-- 众筹FCX支付功能数据库迁移脚本
-- 创建时间: 2026-02-20
-- 功能: 为众筹支持记录表添加FCX支付相关字段

-- 1. 添加FCX支付相关字段到众筹支持记录表
ALTER TABLE crowdfunding_pledges 
ADD COLUMN IF NOT EXISTS fcx_payment_amount DECIMAL(12,2) DEFAULT NULL,
ADD COLUMN IF NOT EXISTS fcx_deduction_amount DECIMAL(12,2) DEFAULT NULL,
ADD COLUMN IF NOT EXISTS fiat_payment_amount DECIMAL(12,2) DEFAULT NULL,
ADD COLUMN IF NOT EXISTS fcx_transaction_id TEXT DEFAULT NULL,
ADD COLUMN IF NOT EXISTS payment_status VARCHAR(20) DEFAULT 'pending' 
  CHECK (payment_status IN ('pending', 'processing', 'completed', 'failed', 'cancelled'));

-- 2. 更新状态约束，添加新的状态值
ALTER TABLE crowdfunding_pledges 
DROP CONSTRAINT IF EXISTS crowdfunding_pledges_status_check;

ALTER TABLE crowdfunding_pledges 
ADD CONSTRAINT crowdfunding_pledges_status_check 
CHECK (status IN ('pending', 'confirmed', 'cancelled', 'refunded', 'paid'));

-- 3. 创建索引以提高查询性能
CREATE INDEX IF NOT EXISTS idx_crowdfunding_pledges_fcx_transaction 
ON crowdfunding_pledges(fcx_transaction_id) 
WHERE fcx_transaction_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_crowdfunding_pledges_payment_status 
ON crowdfunding_pledges(payment_status);

CREATE INDEX IF NOT EXISTS idx_crowdfunding_pledges_user_payment 
ON crowdfunding_pledges(user_id, payment_status);

-- 4. 添加注释
COMMENT ON COLUMN crowdfunding_pledges.fcx_payment_amount IS '使用FCX支付的数量';
COMMENT ON COLUMN crowdfunding_pledges.fcx_deduction_amount IS 'FCX抵扣的法币金额';
COMMENT ON COLUMN crowdfunding_pledges.fiat_payment_amount IS '法币支付金额';
COMMENT ON COLUMN crowdfunding_pledges.fcx_transaction_id IS 'FCX交易ID';
COMMENT ON COLUMN crowdfunding_pledges.payment_status IS '支付状态: pending, processing, completed, failed, cancelled';

-- 5. 创建视图：众筹支付统计
CREATE OR REPLACE VIEW crowdfunding_payment_stats AS
SELECT 
    project_id,
    COUNT(*) as total_pledges,
    COUNT(CASE WHEN status = 'paid' THEN 1 END) as paid_pledges,
    SUM(amount) as total_amount,
    SUM(CASE WHEN status = 'paid' THEN amount ELSE 0 END) as paid_amount,
    SUM(COALESCE(fcx_deduction_amount, 0)) as total_fcx_value_used,
    SUM(COALESCE(fiat_payment_amount, 0)) as total_fiat_paid,
    AVG(CASE WHEN status = 'paid' THEN amount ELSE NULL END) as avg_paid_amount
FROM crowdfunding_pledges
GROUP BY project_id;

-- 6. 创建函数：更新项目筹集金额（考虑FCX支付）
CREATE OR REPLACE FUNCTION update_project_amount_with_fcx()
RETURNS TRIGGER AS $$
BEGIN
    -- 只有当支付状态变为completed时才更新项目金额
    IF NEW.payment_status = 'completed' AND OLD.payment_status != 'completed' THEN
        UPDATE crowdfunding_projects 
        SET current_amount = current_amount + NEW.amount,
            progress_percentage = ROUND(((current_amount + NEW.amount) / target_amount * 100)::numeric, 2)
        WHERE id = NEW.project_id;
    ELSIF NEW.payment_status != 'completed' AND OLD.payment_status = 'completed' THEN
        -- 如果支付状态从completed变为其他状态，则减少金额
        UPDATE crowdfunding_projects 
        SET current_amount = current_amount - OLD.amount,
            progress_percentage = ROUND(((current_amount - OLD.amount) / target_amount * 100)::numeric, 2)
        WHERE id = OLD.project_id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 7. 创建触发器：监听支付状态变化
DROP TRIGGER IF EXISTS trigger_update_project_on_payment_change ON crowdfunding_pledges;

CREATE TRIGGER trigger_update_project_on_payment_change
    AFTER UPDATE OF payment_status ON crowdfunding_pledges
    FOR EACH ROW
    EXECUTE FUNCTION update_project_amount_with_fcx();

-- 8. 创建函数：获取用户FCX支付统计
CREATE OR REPLACE FUNCTION get_user_fcx_payment_stats(user_id_param UUID)
RETURNS TABLE(
    total_fcx_spent DECIMAL(12,2),
    total_usd_saved DECIMAL(12,2),
    successful_payments INTEGER,
    projects_supported INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COALESCE(SUM(p.fcx_payment_amount), 0) as total_fcx_spent,
        COALESCE(SUM(p.fcx_deduction_amount), 0) as total_usd_saved,
        COUNT(CASE WHEN p.payment_status = 'completed' THEN 1 END) as successful_payments,
        COUNT(DISTINCT p.project_id) as projects_supported
    FROM crowdfunding_pledges p
    WHERE p.user_id = user_id_param 
    AND p.fcx_payment_amount IS NOT NULL 
    AND p.fcx_payment_amount > 0;
END;
$$ LANGUAGE plpgsql;

-- 9. 验证迁移结果
DO $$
BEGIN
    -- 检查字段是否存在
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'crowdfunding_pledges' 
        AND column_name = 'fcx_payment_amount'
    ) THEN
        RAISE EXCEPTION 'Migration failed: fcx_payment_amount column not created';
    END IF;
    
    RAISE NOTICE 'Crowdfunding FCX payment migration completed successfully';
END $$;