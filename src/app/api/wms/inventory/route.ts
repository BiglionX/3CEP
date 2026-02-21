/**
 * WMS库存同步API路由
 * 处理库存同步请求和状态查询
 */

import { InventoryMapper } from "@/lib/warehouse/inventory-mapper";
import { WMSManager } from "@/lib/warehouse/wms-manager";
import { wmsSyncScheduler } from "@/lib/warehouse/wms-sync-scheduler";
import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

const wmsManager = new WMSManager();
const inventoryMapper = new InventoryMapper();

// 初始化Supabase客户端
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const connectionId = searchParams.get("connectionId");
    const action = searchParams.get("action");

    if (action === "status") {
      // 获取同步任务状态
      const status = wmsSyncScheduler.getStatus();
      return NextResponse.json({
        success: true,
        data: status,
      });
    } else if (action === "statistics") {
      // 获取库存统计信息
      const stats = await inventoryMapper.getInventoryStatistics(
        connectionId || undefined
      );
      return NextResponse.json({
        success: true,
        data: stats,
      });
    } else if (action === "alerts") {
      // 获取库存预警
      const threshold = parseInt(searchParams.get("threshold") || "10", 10);
      const alerts = await inventoryMapper.getLowInventoryAlerts(threshold);
      return NextResponse.json({
        success: true,
        data: alerts,
      });
    } else if (action === "accuracy") {
      // 获取库存准确性报告
      const accuracyReport = await inventoryMapper.getInventoryAccuracyReport(
        connectionId || undefined
      );
      return NextResponse.json({
        success: true,
        data: accuracyReport,
      });
    } else if (connectionId) {
      // 获取特定连接的库存数据
      const inventory = await inventoryMapper.getConnectionInventory(
        connectionId
      );
      return NextResponse.json({
        success: true,
        data: inventory,
      });
    } else {
      // 获取所有库存数据（分页）
      const page = parseInt(searchParams.get("page") || "1", 10);
      const limit = parseInt(searchParams.get("limit") || "50", 10);
      const offset = (page - 1) * limit;

      const { data, error } = await supabase
        .from("wms_current_inventory")
        .select("*")
        .range(offset, offset + limit - 1);

      if (error) {
        return NextResponse.json(
          { error: "查询库存数据失败", details: error.message },
          { status: 500 }
        );
      }

      // 获取总数
      const { count, error: countError } = await supabase
        .from("wms_current_inventory")
        .select("*", { count: "exact", head: true });

      return NextResponse.json({
        success: true,
        data: {
          items: data,
          pagination: {
            page,
            limit,
            total: count || 0,
            totalPages: Math.ceil((count || 0) / limit),
          },
        },
      });
    }
  } catch (error) {
    console.error("获取库存数据失败:", error);
    return NextResponse.json(
      { error: "获取库存数据失败", details: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { connectionId, action, syncType = "incremental" } = body;

    if (action === "sync") {
      // 手动触发同步
      if (!connectionId) {
        return NextResponse.json(
          { error: "同步操作需要指定connectionId" },
          { status: 400 }
        );
      }

      const result = await wmsManager.syncWarehouseInventory(connectionId);

      if (result.success) {
        return NextResponse.json({
          success: true,
          data: {
            message: "库存同步成功",
            itemCount: result.data?.length || 0,
          },
        });
      } else {
        return NextResponse.json(
          { error: "库存同步失败", details: result.error },
          { status: 400 }
        );
      }
    } else if (action === "bulk-sync") {
      // 批量同步所有活跃仓库
      const result = await wmsManager.syncAllActiveWarehouses();

      if (result.success) {
        return NextResponse.json({
          success: true,
          data: {
            message: "批量同步成功",
            connectionCount: Object.keys(result.data || {}).length,
          },
        });
      } else {
        return NextResponse.json(
          { error: "批量同步失败", details: result.error },
          { status: 400 }
        );
      }
    } else if (action === "start-scheduler") {
      // 启动定时同步任务
      await wmsSyncScheduler.start();
      return NextResponse.json({
        success: true,
        data: {
          message: "定时同步任务已启动",
        },
      });
    } else if (action === "stop-scheduler") {
      // 停止定时同步任务
      wmsSyncScheduler.stop();
      return NextResponse.json({
        success: true,
        data: {
          message: "定时同步任务已停止",
        },
      });
    } else if (action === "manual-sync") {
      // 手动触发定时任务
      const result = await wmsSyncScheduler.triggerManualSync();

      if (result.success) {
        return NextResponse.json({
          success: true,
          data: {
            message: result.message,
          },
        });
      } else {
        return NextResponse.json({ error: result.message }, { status: 400 });
      }
    } else {
      return NextResponse.json({ error: "未知的操作类型" }, { status: 400 });
    }
  } catch (error) {
    console.error("库存同步操作失败:", error);
    return NextResponse.json(
      { error: "操作失败", details: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { connectionId, syncFrequency, alertThreshold } = body;

    if (syncFrequency !== undefined) {
      // 更新同步频率
      if (connectionId) {
        // 更新特定连接的同步频率
        const { error } = await supabase
          .from("wms_connections")
          .update({ sync_frequency: syncFrequency })
          .eq("id", connectionId);

        if (error) {
          return NextResponse.json(
            { error: "更新同步频率失败", details: error.message },
            { status: 500 }
          );
        }
      } else {
        // 更新全局同步配置
        wmsSyncScheduler.updateConfig({ intervalMinutes: syncFrequency });
      }

      return NextResponse.json({
        success: true,
        data: {
          message: "同步频率更新成功",
        },
      });
    }

    if (alertThreshold !== undefined) {
      // 更新预警阈值
      wmsSyncScheduler.updateConfig({ alertThreshold });

      return NextResponse.json({
        success: true,
        data: {
          message: "预警阈值更新成功",
        },
      });
    }

    return NextResponse.json({ error: "缺少有效的更新参数" }, { status: 400 });
  } catch (error) {
    console.error("更新同步配置失败:", error);
    return NextResponse.json(
      { error: "更新配置失败", details: (error as Error).message },
      { status: 500 }
    );
  }
}
