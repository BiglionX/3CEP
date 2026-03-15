/**
 * 鑷姩瀹℃牳API璺敱
 * FixCycle 6.0 鍐呭瀹℃牳鎺ュ彛
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  autoModerationService,
  ContentItem,
  ModerationResult,
} from '@/lib/auto-moderation-service';
import { logger } from '@/tech/utils/logger';

// GET /api/moderation/auto - 鑾峰彇瀹℃牳鏈嶅姟鐘舵€佸拰閰嶇疆
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action') || 'status';

    switch (action) {
      case 'status':
        // 鑾峰彇鏈嶅姟鐘        const stats = autoModerationService.getStatistics();
        return NextResponse.json({
          success: true,
          service: 'auto_moderation',
          status: 'running',
          statistics: stats,
          timestamp: new Date().toISOString(),
        });

      case 'rules':
        // 鑾峰彇瀹℃牳瑙勫垯
        const rules = autoModerationService.getAllRules();
        return NextResponse.json({
          success: true,
          rules: rules.map(rule => ({
            id: rule.id,
            name: rule.name,
            type: rule.type,
            enabled: rule.enabled,
            contentTypes: rule.contentTypes,
            weight: rule.weight,
          })),
          count: rules.length,
          timestamp: new Date().toISOString(),
        });

      case 'health':
        // 鍋ュ悍妫€        return NextResponse.json({
          success: true,
          status: 'healthy',
          service: 'auto-moderation',
          version: '1.0.0',
          timestamp: new Date().toISOString(),
        });

      default:
        return NextResponse.json(
          { success: false, error: '鏈煡鐨勬搷浣滅被 },
          { status: 400 }
        );
    }
  } catch (error: any) {
    logger.error('鑷姩瀹℃牳API GET閿欒:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || '鍐呴儴鏈嶅姟鍣ㄩ敊,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

// POST /api/moderation/auto - 鎵ц鍐呭瀹℃牳
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, content, batch } = body;

    switch (action) {
      case 'moderate':
        // 瀹℃牳鍗曚釜鍐呭
        if (!content) {
          return NextResponse.json(
            { success: false, error: '鍐呭鏁版嵁涓嶈兘涓虹┖' },
            { status: 400 }
          );
        }

        // 楠岃瘉蹇呴渶瀛楁
        if (!content.id || !content.content || !content.authorId) {
          return NextResponse.json(
            { success: false, error: '缂哄皯蹇呴渶鐨勫唴瀹瑰瓧 },
            { status: 400 }
          );
        }

        const contentItem: ContentItem = {
          id: content.id,
          type: content.type || 'text',
          content: content.content,
          title: content.title,
          description: content.description,
          tags: content.tags,
          authorId: content.authorId,
          submittedAt: content.submittedAt || Date.now(),
          context: content.context,
        };

        const result = await autoModerationService.moderateContent(contentItem);

        logger.info(`Content moderated: ${contentItem.id}`, {
          result: result.status,
          score: result.score,
          issues: result.issues.length,
        });

        return NextResponse.json({
          success: true,
          result,
          timestamp: new Date().toISOString(),
        });

      case 'moderate_batch':
        // 鎵归噺瀹℃牳鍐呭
        if (!batch || !Array.isArray(batch) || batch.length === 0) {
          return NextResponse.json(
            { success: false, error: '鎵归噺鍐呭鏁版嵁涓嶈兘涓虹┖' },
            { status: 400 }
          );
        }

        // 楠岃瘉鎵归噺鍐呭
        const invalidItems = batch.filter(
          item => !item.id || !item.content || !item.authorId
        );

        if (invalidItems.length > 0) {
          return NextResponse.json(
            {
              success: false,
              error: `鎵归噺鍐呭涓湁${invalidItems.length}椤圭己灏戝繀闇€瀛楁`,
            },
            { status: 400 }
          );
        }

        const contentItems: ContentItem[] = batch.map(item => ({
          id: item.id,
          type: item.type || 'text',
          content: item.content,
          title: item.title,
          description: item.description,
          tags: item.tags,
          authorId: item.authorId,
          submittedAt: item.submittedAt || Date.now(),
          context: item.context,
        }));

        const results =
          await autoModerationService.moderateContents(contentItems);

        const summary = {
          total: results.length,
          approved: results.filter(r => r.status === 'approved').length,
          rejected: results.filter(r => r.status === 'rejected').length,
          flagged: results.filter(r => r.status === 'flagged').length,
          manual_review: results.filter(r => r.status === 'manual_review')
            .length,
          average_score:
            results.reduce((sum, r) => sum + r.score, 0) / results.length,
        };

        logger.info('Batch content moderation completed', summary);

        return NextResponse.json({
          success: true,
          results,
          summary,
          timestamp: new Date().toISOString(),
        });

      case 'add_rule':
        // 娣诲姞瀹℃牳瑙勫垯
        if (!body.rule) {
          return NextResponse.json(
            { success: false, error: '瑙勫垯鏁版嵁涓嶈兘涓虹┖' },
            { status: 400 }
          );
        }

        const ruleData = {
          id: body.rule.id || `rule_${Date.now()}`,
          name: body.rule.name,
          type: body.rule.type,
          enabled: body.rule.enabled !== false,
          contentTypes: body.rule.contentTypes || ['text'],
          config: body.rule.config || {},
          weight: body.rule.weight || 1.0,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };

        autoModerationService.addRule(ruleData);

        logger.info(`New moderation rule added: ${ruleData.name}`);

        return NextResponse.json({
          success: true,
          message: '瀹℃牳瑙勫垯娣诲姞鎴愬姛',
          rule: {
            id: ruleData.id,
            name: ruleData.name,
            type: ruleData.type,
          },
          timestamp: new Date().toISOString(),
        });

      case 'test_content':
        // 娴嬭瘯鍐呭瀹℃牳锛堜笉璁板綍鍒版寮忓鏍稿巻鍙诧級
        if (!content) {
          return NextResponse.json(
            { success: false, error: '娴嬭瘯鍐呭涓嶈兘涓虹┖' },
            { status: 400 }
          );
        }

        const testContent: ContentItem = {
          id: `test_${Date.now()}`,
          type: content.type || 'text',
          content: content.content,
          title: content.title,
          description: content.description,
          tags: content.tags,
          authorId: 'test_user',
          submittedAt: Date.now(),
          context: content.context,
        };

        const testResult =
          await autoModerationService.moderateContent(testContent);

        return NextResponse.json({
          success: true,
          test_result: testResult,
          timestamp: new Date().toISOString(),
        });

      default:
        return NextResponse.json(
          { success: false, error: '鏈煡鐨勬搷浣滅被 },
          { status: 400 }
        );
    }
  } catch (error: any) {
    logger.error('鑷姩瀹℃牳API POST閿欒:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || '鍐呴儴鏈嶅姟鍣ㄩ敊,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

// PUT /api/moderation/auto - 鏇存柊瀹℃牳閰嶇疆
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, ruleId, updates } = body;

    switch (action) {
      case 'update_rule':
        // 鏇存柊瀹℃牳瑙勫垯
        if (!ruleId || !updates) {
          return NextResponse.json(
            { success: false, error: '瑙勫垯ID鍜屾洿鏂版暟鎹笉鑳戒负 },
            { status: 400 }
          );
        }

        const success = autoModerationService.updateRule(ruleId, updates);

        if (success) {
          logger.info(`Moderation rule updated: ${ruleId}`);
          return NextResponse.json({
            success: true,
            message: '瀹℃牳瑙勫垯鏇存柊鎴愬姛',
            rule_id: ruleId,
            timestamp: new Date().toISOString(),
          });
        } else {
          return NextResponse.json(
            { success: false, error: '瑙勫垯涓嶅 },
            { status: 404 }
          );
        }

      case 'toggle_rule':
        // 鍒囨崲瑙勫垯鍚敤鐘        if (!ruleId) {
          return NextResponse.json(
            { success: false, error: '瑙勫垯ID涓嶈兘涓虹┖' },
            { status: 400 }
          );
        }

        const rule = autoModerationService
          .getAllRules()
          .find(r => r.id === ruleId);
        if (!rule) {
          return NextResponse.json(
            { success: false, error: '瑙勫垯涓嶅 },
            { status: 404 }
          );
        }

        const toggleSuccess = autoModerationService.updateRule(ruleId, {
          enabled: !rule.enabled,
        });

        if (toggleSuccess) {
          logger.info(
            `Moderation rule ${ruleId} ${rule.enabled  'disabled' : 'enabled'}`
          );
          return NextResponse.json({
            success: true,
            message: `瀹℃牳瑙勫垯{rule.enabled  '绂佺敤' : '鍚敤'}`,
            rule_id: ruleId,
            enabled: !rule.enabled,
            timestamp: new Date().toISOString(),
          });
        }

      default:
        return NextResponse.json(
          { success: false, error: '鏈煡鐨勬搷浣滅被 },
          { status: 400 }
        );
    }
  } catch (error: any) {
    logger.error('鑷姩瀹℃牳API PUT閿欒:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || '鍐呴儴鏈嶅姟鍣ㄩ敊,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

// DELETE /api/moderation/auto - 鍒犻櫎瀹℃牳瑙勫垯
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    const ruleId = searchParams.get('rule_id');

    if (action === 'delete_rule') {
      if (!ruleId) {
        return NextResponse.json(
          { success: false, error: '瑙勫垯ID涓嶈兘涓虹┖' },
          { status: 400 }
        );
      }

      const success = autoModerationService.deleteRule(ruleId);

      if (success) {
        logger.info(`Moderation rule deleted: ${ruleId}`);
        return NextResponse.json({
          success: true,
          message: '瀹℃牳瑙勫垯鍒犻櫎鎴愬姛',
          rule_id: ruleId,
          timestamp: new Date().toISOString(),
        });
      } else {
        return NextResponse.json(
          { success: false, error: '瑙勫垯涓嶅 },
          { status: 404 }
        );
      }
    }

    return NextResponse.json(
      { success: false, error: '鏈煡鐨勬搷浣滅被 },
      { status: 400 }
    );
  } catch (error: any) {
    logger.error('鑷姩瀹℃牳API DELETE閿欒:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || '鍐呴儴鏈嶅姟鍣ㄩ敊,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

