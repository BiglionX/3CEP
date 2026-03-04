/**
 * 物流商客户端适配器集合
 * 实现多家物流商API的具体对接逻辑
 */

import {
  CarrierConfig,
  LogisticsCarrier,
  LogisticsCarrierClient,
  ShipmentTracking,
  TrackingNode,
  TrackingStatus,
  UnifiedTrackingResponse,
} from "../models/logistics.model";

// 导出客户端接口
export type { LogisticsCarrierClient };

// 生成UUID的简单实现
function generateUUID(): string {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c == "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

// 17track客户端适配器
export class Track17Client implements LogisticsCarrierClient {
  private config: CarrierConfig;

  constructor(config: CarrierConfig) {
    this.config = config;
  }

  getCarrierName(): string {
    return "17TRACK";
  }

  validateTrackingNumber(trackingNumber: string): boolean {
    // 17track支持多种物流商，不做严格格式验证
    return trackingNumber.length >= 8 && trackingNumber.length <= 32;
  }

  async getTrackingInfo(
    trackingNumber: string
  ): Promise<UnifiedTrackingResponse> {
    const requestId = generateUUID();

    try {
      // 构造17track API请求
      const requestBody = {
        guid: requestId,
        tracking_number: trackingNumber,
        carrier_code: "", // 空值表示自动识别
      };

      const controller = new AbortController();
      const timeoutId = setTimeout(
        () => controller.abort(),
        this.config.timeout
      );

      const response = await fetch(
        "https://api.17track.net/track/v1/gettrackinfo",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "17token": this.config.apiKey,
          },
          body: JSON.stringify([requestBody]),
          signal: controller.signal,
        }
      );

      clearTimeout(timeoutId);

      if (!response.ok) {
        return {
          success: false,
          error: {
            code: `HTTP_${response.status}`,
            message: `17track API请求失败: ${response.statusText}`,
          },
          requestId,
          timestamp: new Date(),
        };
      }

      const result = await response.json();

      if (!result || !result.data || result.data.length === 0) {
        return {
          success: false,
          error: {
            code: "NO_DATA",
            message: "未找到轨迹信息",
          },
          requestId,
          timestamp: new Date(),
        };
      }

      const trackData = result.data[0];

      if (trackData.error) {
        return {
          success: false,
          error: {
            code: trackData.error.code || "TRACKING_ERROR",
            message: trackData.error.message || "轨迹查询失败",
          },
          requestId,
          timestamp: new Date(),
        };
      }

      // 转换为统一格式
      const trackingInfo: ShipmentTracking =
        this.convertToUnifiedFormat(trackData);

      return {
        success: true,
        tracking: trackingInfo,
        requestId,
        timestamp: new Date(),
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: "NETWORK_ERROR",
          message: "网络请求失败",
          details: (error as Error).message,
        },
        requestId,
        timestamp: new Date(),
      };
    }
  }

  async getBatchTrackingInfo(
    trackingNumbers: string[]
  ): Promise<UnifiedTrackingResponse[]> {
    const promises = trackingNumbers.map((trackingNumber) =>
      this.getTrackingInfo(trackingNumber)
    );
    return Promise.all(promises);
  }

  getSupportedCarriers(): LogisticsCarrier[] {
    // 17track支持几乎所有主流物流商
    return [
      LogisticsCarrier.SF_EXPRESS,
      LogisticsCarrier.YTO,
      LogisticsCarrier.ZTO,
      LogisticsCarrier.STO,
      LogisticsCarrier.EMS,
      LogisticsCarrier.YUNDA,
      LogisticsCarrier.JD_LOGISTICS,
      LogisticsCarrier.DHL,
      LogisticsCarrier.FEDEX,
      LogisticsCarrier.UPS,
    ];
  }

  private convertToUnifiedFormat(data: any): ShipmentTracking {
    const timeline: TrackingNode[] = [];

    if (
      data.track_info &&
      data.track_info.origin_info &&
      data.track_info.origin_info.trackinfo
    ) {
      data.track_info.origin_info.trackinfo.forEach((item: any) => {
        timeline.push({
          timestamp: new Date(item.Date),
          location: item.Location || "",
          status: this.mapStatus(item.Status),
          description: item.Content || "",
          operator: item.CheckpointAddress || undefined,
        });
      });
    }

    // 按时间倒序排列（最新的在前面）
    timeline.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

    const latestStatus =
      timeline.length > 0 ? timeline[0].status : TrackingStatus.PENDING;

    return {
      trackingNumber: data.tracking_number,
      carrier: this.detectCarrier(data.carrier_code),
      carrierName: data.carrier_name || "未知承运商",
      status: latestStatus,
      origin: data.track_info?.origin_info?.AcceptTime
        ? new Date(data.track_info.origin_info.AcceptTime).toLocaleDateString()
        : "",
      destination: "",
      estimatedDelivery: data.track_info?.destination_info
        ?.EstimatedDeliveryTime
        ? new Date(data.track_info.destination_info.EstimatedDeliveryTime)
        : undefined,
      timeline,
      lastUpdated: new Date(),
      isDelivered: latestStatus === TrackingStatus.DELIVERED,
    };
  }

  private mapStatus(status: string): TrackingStatus {
    const statusMap: Record<string, TrackingStatus> = {
      Pending: TrackingStatus.PENDING,
      Collected: TrackingStatus.COLLECTED,
      "In Transit": TrackingStatus.IN_TRANSIT,
      "Out for Delivery": TrackingStatus.OUT_FOR_DELIVERY,
      Delivered: TrackingStatus.DELIVERED,
      Exception: TrackingStatus.EXCEPTION,
      Returned: TrackingStatus.RETURNED,
      "Failed Attempt": TrackingStatus.FAILED,
    };

    return statusMap[status] || TrackingStatus.IN_TRANSIT;
  }

  private detectCarrier(carrierCode: string): LogisticsCarrier {
    const carrierMap: Record<string, LogisticsCarrier> = {
      "100001": LogisticsCarrier.SF_EXPRESS,
      "100002": LogisticsCarrier.YTO,
      "100003": LogisticsCarrier.ZTO,
      "100004": LogisticsCarrier.STO,
      "100005": LogisticsCarrier.EMS,
      "100006": LogisticsCarrier.YUNDA,
      "100007": LogisticsCarrier.JD_LOGISTICS,
      "100008": LogisticsCarrier.DHL,
      "100009": LogisticsCarrier.FEDEX,
      "100010": LogisticsCarrier.UPS,
    };

    return carrierMap[carrierCode] || LogisticsCarrier.OTHER;
  }
}

// 快递鸟客户端适配器
export class KdniaoClient implements LogisticsCarrierClient {
  private config: CarrierConfig;

  constructor(config: CarrierConfig) {
    this.config = config;
  }

  getCarrierName(): string {
    return "快递鸟";
  }

  validateTrackingNumber(trackingNumber: string): boolean {
    // 快递鸟支持多种物流商，不做严格格式验证
    return trackingNumber.length >= 8 && trackingNumber.length <= 32;
  }

  async getTrackingInfo(
    trackingNumber: string
  ): Promise<UnifiedTrackingResponse> {
    const requestId = generateUUID();

    try {
      const requestData = {
        OrderCode: "",
        ShipperCode: "", // 空值表示自动识别
        LogisticCode: trackingNumber,
      };

      const requestDataStr = JSON.stringify(requestData);
      const dataSign = this.encrypt(requestDataStr, this.config.apiKey);

      const formData = new FormData();
      formData.append("RequestData", requestDataStr);
      formData.append("EBusinessID", this.config.customerId || "");
      formData.append("RequestType", "1002");
      formData.append("DataSign", dataSign);
      formData.append("DataType", "2");

      const controller = new AbortController();
      const timeoutId = setTimeout(
        () => controller.abort(),
        this.config.timeout
      );

      const response = await fetch(
        "http://api.kdniao.com/Ebusiness/EbusinessOrderHandle.aspx",
        {
          method: "POST",
          body: formData,
          signal: controller.signal,
        }
      );

      clearTimeout(timeoutId);

      if (!response.ok) {
        return {
          success: false,
          error: {
            code: `HTTP_${response.status}`,
            message: `快递鸟API请求失败: ${response.statusText}`,
          },
          requestId,
          timestamp: new Date(),
        };
      }

      const result = await response.json();

      if (!result.Success) {
        return {
          success: false,
          error: {
            code: result.Reason || "TRACKING_ERROR",
            message: result.Reason || "轨迹查询失败",
          },
          requestId,
          timestamp: new Date(),
        };
      }

      const trackingInfo: ShipmentTracking =
        this.convertToUnifiedFormat(result);

      return {
        success: true,
        tracking: trackingInfo,
        requestId,
        timestamp: new Date(),
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: "NETWORK_ERROR",
          message: "网络请求失败",
          details: (error as Error).message,
        },
        requestId,
        timestamp: new Date(),
      };
    }
  }

  async getBatchTrackingInfo(
    trackingNumbers: string[]
  ): Promise<UnifiedTrackingResponse[]> {
    const promises = trackingNumbers.map((trackingNumber) =>
      this.getTrackingInfo(trackingNumber)
    );
    return Promise.all(promises);
  }

  getSupportedCarriers(): LogisticsCarrier[] {
    return [
      LogisticsCarrier.SF_EXPRESS,
      LogisticsCarrier.YTO,
      LogisticsCarrier.ZTO,
      LogisticsCarrier.STO,
      LogisticsCarrier.EMS,
      LogisticsCarrier.YUNDA,
      LogisticsCarrier.JD_LOGISTICS,
    ];
  }

  private convertToUnifiedFormat(data: any): ShipmentTracking {
    const timeline: TrackingNode[] = [];

    if (data.Traces) {
      data.Traces.forEach((trace: any) => {
        timeline.push({
          timestamp: new Date(trace.AcceptTime),
          location: trace.AcceptStation || "",
          status: this.mapStatus(trace.Action),
          description: trace.Remark || trace.AcceptStation || "",
          operator: trace.Operator || undefined,
        });
      });
    }

    // 按时间倒序排列
    timeline.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

    const latestStatus =
      timeline.length > 0 ? timeline[0].status : TrackingStatus.PENDING;

    return {
      trackingNumber: data.LogisticCode,
      carrier: this.detectCarrier(data.ShipperCode),
      carrierName: data.ShipperName || "未知承运商",
      status: latestStatus,
      origin: timeline.length > 0 ? timeline[timeline.length - 1].location : "",
      destination: "",
      timeline,
      lastUpdated: new Date(),
      isDelivered: latestStatus === TrackingStatus.DELIVERED,
    };
  }

  private mapStatus(action: string): TrackingStatus {
    const actionMap: Record<string, TrackingStatus> = {
      "1": TrackingStatus.COLLECTED,
      "2": TrackingStatus.IN_TRANSIT,
      "3": TrackingStatus.OUT_FOR_DELIVERY,
      "4": TrackingStatus.DELIVERED,
      "5": TrackingStatus.EXCEPTION,
      "6": TrackingStatus.RETURNED,
    };

    return actionMap[action] || TrackingStatus.IN_TRANSIT;
  }

  private detectCarrier(shipperCode: string): LogisticsCarrier {
    const carrierMap: Record<string, LogisticsCarrier> = {
      SF: LogisticsCarrier.SF_EXPRESS,
      YTO: LogisticsCarrier.YTO,
      ZTO: LogisticsCarrier.ZTO,
      STO: LogisticsCarrier.STO,
      EMS: LogisticsCarrier.EMS,
      YD: LogisticsCarrier.YUNDA,
      JD: LogisticsCarrier.JD_LOGISTICS,
    };

    return carrierMap[shipperCode] || LogisticsCarrier.OTHER;
  }

  private encrypt(content: string, key: string): string {
    // 简化的加密实现，实际应使用快递鸟官方SDK
    // 这里仅作示例
    return Buffer.from(content + key).toString("base64");
  }
}

// 顺丰速运官方客户端适配器
export class SfExpressClient implements LogisticsCarrierClient {
  private config: CarrierConfig;

  constructor(config: CarrierConfig) {
    this.config = config;
  }

  getCarrierName(): string {
    return "顺丰速运";
  }

  validateTrackingNumber(trackingNumber: string): boolean {
    // 顺丰运单号通常为12位数字
    return /^\d{12}$/.test(trackingNumber);
  }

  async getTrackingInfo(
    trackingNumber: string
  ): Promise<UnifiedTrackingResponse> {
    const requestId = generateUUID();

    try {
      // 顺丰API调用逻辑
      const controller = new AbortController();
      const timeoutId = setTimeout(
        () => controller.abort(),
        this.config.timeout
      );

      const response = await fetch(
        `${
          this.config.endpoint || "https://sfapi.sf-express.com"
        }/track/waybill`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${this.config.apiKey}`,
          },
          body: JSON.stringify({
            trackingNumber: trackingNumber,
            language: "zh-CN",
          }),
          signal: controller.signal,
        }
      );

      clearTimeout(timeoutId);

      if (!response.ok) {
        return {
          success: false,
          error: {
            code: `HTTP_${response.status}`,
            message: `顺丰API请求失败: ${response.statusText}`,
          },
          requestId,
          timestamp: new Date(),
        };
      }

      const result = await response.json();

      if (result.code !== "S01") {
        return {
          success: false,
          error: {
            code: result.code || "TRACKING_ERROR",
            message: result.message || "轨迹查询失败",
          },
          requestId,
          timestamp: new Date(),
        };
      }

      const trackingInfo: ShipmentTracking =
        this.convertToUnifiedFormat(result);

      return {
        success: true,
        tracking: trackingInfo,
        requestId,
        timestamp: new Date(),
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: "NETWORK_ERROR",
          message: "网络请求失败",
          details: (error as Error).message,
        },
        requestId,
        timestamp: new Date(),
      };
    }
  }

  async getBatchTrackingInfo(
    trackingNumbers: string[]
  ): Promise<UnifiedTrackingResponse[]> {
    const promises = trackingNumbers.map((trackingNumber) =>
      this.getTrackingInfo(trackingNumber)
    );
    return Promise.all(promises);
  }

  getSupportedCarriers(): LogisticsCarrier[] {
    return [LogisticsCarrier.SF_EXPRESS];
  }

  private convertToUnifiedFormat(data: any): ShipmentTracking {
    const timeline: TrackingNode[] = [];

    if (data.routes) {
      data.routes.forEach((route: any) => {
        timeline.push({
          timestamp: new Date(route.acceptTime),
          location: route.acceptAddress || "",
          status: this.mapStatus(route.remark),
          description: route.remark || "",
          operator: route.opCode || undefined,
        });
      });
    }

    // 按时间排序
    timeline.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

    const latestStatus =
      timeline.length > 0
        ? timeline[timeline.length - 1].status
        : TrackingStatus.PENDING;

    return {
      trackingNumber: data.trackingNumber,
      carrier: LogisticsCarrier.SF_EXPRESS,
      carrierName: "顺丰速运",
      status: latestStatus,
      origin: timeline.length > 0 ? timeline[0].location : "",
      destination:
        timeline.length > 0 ? timeline[timeline.length - 1].location : "",
      estimatedDelivery: data.estimatedDeliveryTime
        ? new Date(data.estimatedDeliveryTime)
        : undefined,
      timeline,
      lastUpdated: new Date(),
      isDelivered: latestStatus === TrackingStatus.DELIVERED,
    };
  }

  private mapStatus(remark: string): TrackingStatus {
    if (remark.includes("已签收")) return TrackingStatus.DELIVERED;
    if (remark.includes("派送")) return TrackingStatus.OUT_FOR_DELIVERY;
    if (remark.includes("运输")) return TrackingStatus.IN_TRANSIT;
    if (remark.includes("揽收")) return TrackingStatus.COLLECTED;
    if (remark.includes("异常")) return TrackingStatus.EXCEPTION;
    return TrackingStatus.IN_TRANSIT;
  }
}
