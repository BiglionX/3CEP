/**
 * WMS连接管理API路由
 * 处理WMS连接的增删改查操作
 */

import { WMSManager } from "@/lib/warehouse/wms-manager";
import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

const wmsManager = new WMSManager();

// 初始化Supabase客户端
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const connectionId = searchParams.get("connectionId");

    if (connectionId) {
      // 获取单个连接详情
      const connection = wmsManager.getConnection(connectionId);
      if (!connection) {
        return NextResponse.json({ error: "连接不存在" }, { status: 404 });
      }

      // 获取连接健康状态
      const healthResult = wmsManager.getConnectionHealth(connectionId);

      return NextResponse.json({
        success: true,
        data: {
          ...connection,
          health: healthResult.success ? healthResult.data : null,
        },
      });
    } else {
      // 获取所有连接列表
      const connections = wmsManager.getConnections();

      // 补充数据库中的详细信息
      const connectionIds = connections.map((conn) => conn.id);
      if (connectionIds.length > 0) {
        const { data: dbConnections, error } = await supabase
          .from("wms_connections")
          .select("*")
          .in("id", connectionIds);

        if (!error && dbConnections) {
          // 合并内存和数据库信息
          const enrichedConnections = connections.map((conn) => {
            const dbConn = dbConnections.find((db) => db.id === conn.id);
            return {
              ...conn,
              ...dbConn,
              created_at: dbConn?.created_at,
              updated_at: dbConn?.updated_at,
            };
          });

          return NextResponse.json({
            success: true,
            data: enrichedConnections,
          });
        }
      }

      return NextResponse.json({
        success: true,
        data: connections,
      });
    }
  } catch (error) {
    console.error("获取WMS连接列表失败:", error);
    return NextResponse.json(
      { error: "获取连接列表失败", details: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      name,
      provider,
      warehouseId,
      baseUrl,
      clientId,
      clientSecret,
      isActive = true,
      syncFrequency = 5,
    } = body;

    // 参数验证
    if (
      !name ||
      !provider ||
      !warehouseId ||
      !baseUrl ||
      !clientId ||
      !clientSecret
    ) {
      return NextResponse.json(
        {
          error:
            "缺少必要参数: name, provider, warehouseId, baseUrl, clientId, clientSecret",
        },
        { status: 400 }
      );
    }

    // 验证提供商
    const validProviders = ["goodcang", "4px", "winit", "custom"];
    if (!validProviders.includes(provider)) {
      return NextResponse.json(
        { error: `不支持的提供商: ${provider}` },
        { status: 400 }
      );
    }

    // 加密密钥（简化处理，实际应该使用更强的加密）
    const encryptedSecret = Buffer.from(clientSecret).toString("base64");

    // 保存到数据库
    const { data: dbConnection, error: dbError } = await supabase
      .from("wms_connections")
      .insert({
        name,
        provider,
        warehouse_id: warehouseId,
        base_url: baseUrl,
        client_id: clientId,
        client_secret_encrypted: encryptedSecret,
        is_active: isActive,
        sync_frequency: syncFrequency,
      })
      .select("id")
      .single();

    if (dbError) {
      return NextResponse.json(
        { error: "保存连接配置失败", details: dbError.message },
        { status: 500 }
      );
    }

    // 添加到WMS管理器
    const config = {
      provider: provider as any,
      baseUrl,
      clientId,
      clientSecret,
      warehouseId,
    };

    const connectionInfo = {
      name,
      provider: provider as any,
      warehouseId,
      isActive,
    };

    const result = await wmsManager.addConnection(connectionInfo, config);

    if (!result.success) {
      // 如果添加失败，回滚数据库记录
      await supabase.from("wms_connections").delete().eq("id", dbConnection.id);

      return NextResponse.json(
        { error: "连接测试失败", details: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        connectionId: result.data,
        message: "WMS连接创建成功",
      },
    });
  } catch (error) {
    console.error("创建WMS连接失败:", error);
    return NextResponse.json(
      { error: "创建连接失败", details: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const connectionId = searchParams.get("connectionId");

    if (!connectionId) {
      return NextResponse.json({ error: "缺少连接ID参数" }, { status: 400 });
    }

    const body = await request.json();
    const {
      name,
      isActive,
      syncFrequency,
      clientSecret, // 可选更新
    } = body;

    // 检查连接是否存在
    const existingConnection = wmsManager.getConnection(connectionId);
    if (!existingConnection) {
      return NextResponse.json({ error: "连接不存在" }, { status: 404 });
    }

    // 构建更新数据
    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (isActive !== undefined) updateData.is_active = isActive;
    if (syncFrequency !== undefined) updateData.sync_frequency = syncFrequency;
    if (clientSecret) {
      updateData.client_secret_encrypted =
        Buffer.from(clientSecret).toString("base64");
    }

    // 更新数据库
    const { error: dbError } = await supabase
      .from("wms_connections")
      .update(updateData)
      .eq("id", connectionId);

    if (dbError) {
      return NextResponse.json(
        { error: "更新连接配置失败", details: dbError.message },
        { status: 500 }
      );
    }

    // 更新内存中的连接状态
    if (isActive !== undefined) {
      wmsManager.toggleConnection(connectionId, isActive);
    }

    return NextResponse.json({
      success: true,
      data: {
        message: "WMS连接更新成功",
      },
    });
  } catch (error) {
    console.error("更新WMS连接失败:", error);
    return NextResponse.json(
      { error: "更新连接失败", details: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const connectionId = searchParams.get("connectionId");

    if (!connectionId) {
      return NextResponse.json({ error: "缺少连接ID参数" }, { status: 400 });
    }

    // 检查连接是否存在
    const existingConnection = wmsManager.getConnection(connectionId);
    if (!existingConnection) {
      return NextResponse.json({ error: "连接不存在" }, { status: 404 });
    }

    // 从数据库删除
    const { error: dbError } = await supabase
      .from("wms_connections")
      .delete()
      .eq("id", connectionId);

    if (dbError) {
      return NextResponse.json(
        { error: "删除连接配置失败", details: dbError.message },
        { status: 500 }
      );
    }

    // 从内存中移除
    const result = wmsManager.removeConnection(connectionId);

    if (!result.success) {
      return NextResponse.json(
        { error: "移除连接失败", details: result.error },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        message: "WMS连接删除成功",
      },
    });
  } catch (error) {
    console.error("删除WMS连接失败:", error);
    return NextResponse.json(
      { error: "删除连接失败", details: (error as Error).message },
      { status: 500 }
    );
  }
}
