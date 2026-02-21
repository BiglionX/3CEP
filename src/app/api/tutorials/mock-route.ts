import { NextResponse } from "next/server";

// Mock数据 - 用于开发和测试
const mockTutorials = [
  {
    id: "1",
    device_model: "iPhone 14 Pro",
    fault_type: "screen_broken",
    title: "iPhone 14 Pro 屏幕更换详细教程",
    description:
      "从拆机到安装的完整iPhone 14 Pro屏幕更换指南，包含所需工具和注意事项",
    steps: [
      {
        id: "step1",
        title: "准备工作",
        description: "关闭设备电源，准备好所有必要工具",
        image_url: "https://example.com/step1.jpg",
        estimated_time: 5,
      },
      {
        id: "step2",
        title: "拆卸屏幕",
        description: "使用吸盘和撬棒小心分离屏幕组件",
        image_url: "https://example.com/step2.jpg",
        estimated_time: 15,
      },
      {
        id: "step3",
        title: "断开连接",
        description: "断开屏幕排线连接器",
        image_url: "https://example.com/step3.jpg",
        estimated_time: 10,
      },
      {
        id: "step4",
        title: "安装新屏幕",
        description: "连接新屏幕排线并测试显示功能",
        image_url: "https://example.com/step4.jpg",
        estimated_time: 20,
      },
      {
        id: "step5",
        title: "最终组装",
        description: "重新组装设备并进行全面测试",
        image_url: "https://example.com/step5.jpg",
        estimated_time: 10,
      },
    ],
    video_url: "https://www.youtube.com/watch?v=screen_repair_demo",
    tools: ["螺丝刀套装", "吸盘", "撬棒", "镊子", "热风枪"],
    parts: ["iPhone 14 Pro原装屏幕", "屏幕胶"],
    cover_image: "https://example.com/iphone14pro-screen-cover.jpg",
    difficulty_level: 4,
    estimated_time: 60,
    view_count: 1250,
    like_count: 89,
    status: "published",
    created_at: "2026-02-15T10:00:00Z",
    updated_at: "2026-02-15T10:00:00Z",
  },
  {
    id: "2",
    device_model: "Samsung Galaxy S23",
    fault_type: "battery_issue",
    title: "三星Galaxy S23 电池更换指南",
    description: "详细的三星Galaxy S23电池更换步骤，适合有一定动手能力的用户",
    steps: [
      {
        id: "step1",
        title: "关机并准备工具",
        description: "完全关闭手机电源，准备精密螺丝刀和撬棒",
        image_url: "https://example.com/s23_step1.jpg",
        estimated_time: 3,
      },
      {
        id: "step2",
        title: "拆卸后盖",
        description: "加热后盖边缘使其软化，然后小心撬开",
        image_url: "https://example.com/s23_step2.jpg",
        estimated_time: 12,
      },
      {
        id: "step3",
        title: "移除旧电池",
        description: "断开电池连接器，小心取出旧电池",
        image_url: "https://example.com/s23_step3.jpg",
        estimated_time: 8,
      },
      {
        id: "step4",
        title: "安装新电池",
        description: "放入新电池并重新连接电池排线",
        image_url: "https://example.com/s23_step4.jpg",
        estimated_time: 10,
      },
      {
        id: "step5",
        title: "测试和组装",
        description: "开机测试电池功能，重新安装后盖",
        image_url: "https://example.com/s23_step5.jpg",
        estimated_time: 7,
      },
    ],
    video_url: "https://www.bilibili.com/video/BV123456789",
    tools: ["精密螺丝刀", "塑料撬棒", "热风枪", "吸盘"],
    parts: ["三星S23原装电池", "后盖胶"],
    cover_image: "https://example.com/s23-battery-cover.jpg",
    difficulty_level: 3,
    estimated_time: 40,
    view_count: 890,
    like_count: 67,
    status: "published",
    created_at: "2026-02-14T14:30:00Z",
    updated_at: "2026-02-14T14:30:00Z",
  },
  {
    id: "3",
    device_model: "Huawei Mate 50",
    fault_type: "water_damage",
    title: "华为Mate 50 进水应急处理方案",
    description: "手机意外进水后的紧急处理步骤和专业维修建议",
    steps: [
      {
        id: "step1",
        title: "立即断电",
        description: "第一时间关闭手机电源，避免短路损坏",
        image_url: "https://example.com/mate50_step1.jpg",
        estimated_time: 1,
      },
      {
        id: "step2",
        title: "取出SIM卡和存储卡",
        description: "尽快取出所有可拆卸部件",
        image_url: "https://example.com/mate50_step2.jpg",
        estimated_time: 2,
      },
      {
        id: "step3",
        title: "清洁表面水分",
        description: "用干净布料轻轻擦拭表面水分",
        image_url: "https://example.com/mate50_step3.jpg",
        estimated_time: 3,
      },
      {
        id: "step4",
        title: "干燥处理",
        description: "放置在干燥通风处自然晾干至少48小时",
        image_url: "https://example.com/mate50_step4.jpg",
        estimated_time: 2880,
      },
      {
        id: "step5",
        title: "专业检测",
        description: "联系专业维修店进行全面检测",
        image_url: "https://example.com/mate50_step5.jpg",
        estimated_time: 30,
      },
    ],
    video_url: null,
    tools: ["干净毛巾", "干燥剂", "吹风机(冷风)"],
    parts: [],
    cover_image: "https://example.com/mate50-water-cover.jpg",
    difficulty_level: 2,
    estimated_time: 30,
    view_count: 2100,
    like_count: 156,
    status: "published",
    created_at: "2026-02-13T09:15:00Z",
    updated_at: "2026-02-13T09:15:00Z",
  },
  {
    id: "4",
    device_model: "Xiaomi Redmi Note 12",
    fault_type: "charging_issue",
    title: "红米Note 12 充电问题解决方案",
    description: "详细解决红米Note 12充电慢、无法充电等问题",
    steps: [
      {
        id: "step1",
        title: "检查充电线和充电器",
        description: "首先检查使用的充电线和充电器是否正常工作",
        image_url: "https://example.com/redmi_step1.jpg",
        estimated_time: 5,
      },
      {
        id: "step2",
        title: "清洁充电口",
        description: "使用软毛刷清洁手机充电口内的灰尘和杂物",
        image_url: "https://example.com/redmi_step2.jpg",
        estimated_time: 10,
      },
      {
        id: "step3",
        title: "检查软件设置",
        description: "查看手机充电相关设置是否正常",
        image_url: "https://example.com/redmi_step3.jpg",
        estimated_time: 8,
      },
    ],
    video_url: "https://www.youtube.com/watch?v=redmi_charging",
    tools: ["软毛刷", "放大镜"],
    parts: [],
    cover_image: "https://example.com/redmi-charging-cover.jpg",
    difficulty_level: 2,
    estimated_time: 25,
    view_count: 654,
    like_count: 42,
    status: "published",
    created_at: "2026-02-12T16:45:00Z",
    updated_at: "2026-02-12T16:45:00Z",
  },
];

// GET /api/tutorials - 获取教程列表（Mock版本）
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    // 获取查询参数
    const page = parseInt(searchParams.get("page") || "1");
    const pageSize = parseInt(searchParams.get("pageSize") || "10");
    const deviceModel = searchParams.get("deviceModel");
    const faultType = searchParams.get("faultType");
    const status = searchParams.get("status") || "published";
    const search = searchParams.get("search");

    // 计算偏移量
    const offset = (page - 1) * pageSize;

    // 过滤数据
    let filteredTutorials = mockTutorials.filter(
      (tutorial) => tutorial.status === status
    );

    // 添加过滤条件
    if (deviceModel) {
      filteredTutorials = filteredTutorials.filter(
        (t) => t.device_model === deviceModel
      );
    }

    if (faultType) {
      filteredTutorials = filteredTutorials.filter(
        (t) => t.fault_type === faultType
      );
    }

    if (search) {
      const searchTerm = search.toLowerCase();
      filteredTutorials = filteredTutorials.filter(
        (t) =>
          t.title.toLowerCase().includes(searchTerm) ||
          t.description.toLowerCase().includes(searchTerm) ||
          t.device_model.toLowerCase().includes(searchTerm)
      );
    }

    // 计算分页信息
    const totalCount = filteredTutorials.length;
    const totalPages = Math.ceil(totalCount / pageSize);
    const paginatedTutorials = filteredTutorials.slice(
      offset,
      offset + pageSize
    );

    return NextResponse.json({
      tutorials: paginatedTutorials,
      pagination: {
        currentPage: page,
        pageSize,
        totalCount,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    });
  } catch (error) {
    console.error("API错误:", error);
    return NextResponse.json({ error: "服务器内部错误" }, { status: 500 });
  }
}

// GET /api/tutorials/[id] - 获取单个教程详情（Mock版本）
export async function GET_BY_ID(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // 查找教程
    const tutorial = mockTutorials.find(
      (t) => t.id === id && t.status === "published"
    );

    if (!tutorial) {
      return NextResponse.json(
        { error: "教程不存在或未发布" },
        { status: 404 }
      );
    }

    // 模拟增加浏览次数
    const tutorialWithViews = {
      ...tutorial,
      view_count: tutorial.view_count + 1,
    };

    return NextResponse.json({
      tutorial: tutorialWithViews,
    });
  } catch (error) {
    console.error("API错误:", error);
    return NextResponse.json({ error: "服务器内部错误" }, { status: 500 });
  }
}
