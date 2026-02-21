import { NextResponse } from "next/server";
import { quotationTemplateService } from "../../../../../b2b-procurement-agent/services/quotation-template.service";

export async function GET(request: Request) {
  try {
    // 获取用户ID（实际应用中应该从认证token获取）
    const userId = "test-user-id"; // 临时测试用

    const { searchParams } = new URL(request.url);
    const activeOnly = searchParams.get("activeOnly") !== "false";

    const templates = await quotationTemplateService.getTemplates(
      userId,
      activeOnly
    );

    return NextResponse.json({
      success: true,
      data: templates,
    });
  } catch (error) {
    console.error("获取询价模板列表错误:", error);
    return NextResponse.json(
      {
        success: false,
        error: (error as Error).message,
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const userId = "test-user-id"; // 临时测试用

    const template = await quotationTemplateService.createTemplate(
      body,
      userId
    );

    return NextResponse.json({
      success: true,
      data: template,
    });
  } catch (error) {
    console.error("创建询价模板错误:", error);
    return NextResponse.json(
      {
        success: false,
        error: (error as Error).message,
      },
      { status: 400 }
    );
  }
}
