import { NextRequest, NextResponse } from 'next/server';
import { dataPipeline } from '@/lib/data-pipeline-service';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, data } = body;

    switch (action) {
      case 'collect':
        if (!data.metricName || data.value === undefined) {
          return NextResponse.json(
            { error: 'Missing required fields: metricName, value' },
            { status: 400 }
          );
        }

        dataPipeline.collect(
          data.metricName,
          data.value,
          data.dimensions || {},
          data.source || 'api'
        );

        return NextResponse.json({ success: true, message: 'Data collected' });

      case 'collectBatch':
        if (!Array.isArray(data)) {
          return NextResponse.json(
            { error: 'Data must be an array' },
            { status: 400 }
          );
        }

        dataPipeline.collectBatch(data);
        return NextResponse.json({
          success: true,
          message: 'Batch data collected',
        });

      case 'flush':
        await dataPipeline.flushBuffer();
        return NextResponse.json({ success: true, message: 'Buffer flushed' });

      case 'cleanup':
        const deletedCount = await dataPipeline.cleanupOldData();
        return NextResponse.json({
          success: true,
          message: 'Old data cleaned',
          deletedCount,
        });

      default:
        return NextResponse.json(
          {
            error:
              'Invalid action. Supported actions: collect, collectBatch, flush, cleanup',
          },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Data pipeline error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    const metricNames = searchParams.get('metrics').split(',') || [];
    const startTime = searchParams.get('startTime');
    const endTime = searchParams.get('endTime');
    const granularity = searchParams.get('granularity') || 'day';

    if (
      action === 'aggregated' &&
      metricNames.length > 0 &&
      startTime &&
      endTime
    ) {
      const aggregatedData = await dataPipeline.getAggregatedMetrics(
        metricNames,
        new Date(startTime),
        new Date(endTime),
        granularity as 'hour' | 'day' | 'week'
      );

      return NextResponse.json({
        success: true,
        data: aggregatedData,
      });
    }

    if (action === 'export' && startTime && endTime) {
      const format = searchParams.get('format') || 'json';
      const exportedData = await dataPipeline.exportData(
        new Date(startTime),
        new Date(endTime),
        format as 'csv' | 'json'
      );

      return new NextResponse(exportedData, {
        headers: {
          'Content-Type': format === 'csv'  'text/csv' : 'application/json',
          'Content-Disposition': `attachment; filename=data-export.${format}`,
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Data Pipeline API',
      endpoints: {
        POST: '/api/data-pipeline',
        GET: '/api/data-pipelineaction=aggregated&metrics=metric1,metric2&startTime=...&endTime=...',
        GET_export:
          '/api/data-pipelineaction=export&startTime=...&endTime=...&format=json',
      },
    });
  } catch (error) {
    console.error('Data pipeline GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
