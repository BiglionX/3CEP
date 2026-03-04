/**
 * FCX系统数据验证? */

import {
  TRANSACTION_CONSTANTS,
  ORDER_CONSTANTS,
  STAKING_CONSTANTS,
  REWARD_CONSTANTS,
} from './constants';
import {
  FcxTransactionType,
  OrderStatus,
  AllianceLevel,
  CreateFcxAccountDTO,
  FcxTransferDTO,
  PurchaseFcxDTO,
  StakeFcxDTO,
  CreateRepairOrderDTO,
  CompleteRepairOrderDTO,
} from '../models/fcx-account.model';

/**
 * 验证创建FCX账户的数? */
export function validateCreateAccountDto(dto: CreateFcxAccountDTO): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!dto.userId) {
    errors.push('用户ID不能为空');
  }

  if (!dto.accountType) {
    errors.push('账户类型不能为空');
  }

  if (dto.initialBalance !== undefined && dto.initialBalance < 0) {
    errors.push('初始余额不能为负?);
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * 验证FCX转账数据
 */
export function validateTransferDto(dto: FcxTransferDTO): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!dto.fromAccountId) {
    errors.push('发送方账户ID不能为空');
  }

  if (!dto.toAccountId) {
    errors.push('接收方账户ID不能为空');
  }

  if (dto.fromAccountId === dto.toAccountId) {
    errors.push('发送方和接收方不能是同一账户');
  }

  if (!dto.amount || dto.amount <= 0) {
    errors.push('转账金额必须大于0');
  }

  if (dto.amount < TRANSACTION_CONSTANTS.MIN_TRANSFER_AMOUNT) {
    errors.push(`转账金额不能小于${TRANSACTION_CONSTANTS.MIN_TRANSFER_AMOUNT}`);
  }

  if (dto.amount > TRANSACTION_CONSTANTS.MAX_TRANSFER_AMOUNT) {
    errors.push(`转账金额不能大于${TRANSACTION_CONSTANTS.MAX_TRANSFER_AMOUNT}`);
  }

  if (!Object.values(FcxTransactionType).includes(dto.transactionType)) {
    errors.push('无效的交易类?);
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * 验证FCX购买数据
 */
export function validatePurchaseDto(dto: PurchaseFcxDTO): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!dto.userId) {
    errors.push('用户ID不能为空');
  }

  if (!dto.amountUSD || dto.amountUSD <= 0) {
    errors.push('购买金额必须大于0');
  }

  if (!dto.paymentMethod) {
    errors.push('支付方式不能为空');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * 验证质押数据
 */
export function validateStakeDto(dto: StakeFcxDTO): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!dto.accountId) {
    errors.push('账户ID不能为空');
  }

  if (!dto.shopId) {
    errors.push('店铺ID不能为空');
  }

  if (!dto.amount || dto.amount <= 0) {
    errors.push('质押金额必须大于0');
  }

  if (dto.amount < STAKING_CONSTANTS.MIN_AMOUNT) {
    errors.push(`质押金额不能小于${STAKING_CONSTANTS.MIN_AMOUNT}`);
  }

  if (dto.amount > STAKING_CONSTANTS.MAX_AMOUNT) {
    errors.push(`质押金额不能大于${STAKING_CONSTANTS.MAX_AMOUNT}`);
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * 验证创建工单数据
 */
export function validateCreateOrderDto(dto: CreateRepairOrderDTO): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!dto.consumerId) {
    errors.push('消费者ID不能为空');
  }

  if (!dto.repairShopId) {
    errors.push('维修店ID不能为空');
  }

  if (!dto.deviceInfo || Object.keys(dto.deviceInfo).length === 0) {
    errors.push('设备信息不能为空');
  }

  if (!dto.faultDescription) {
    errors.push('故障描述不能为空');
  }

  if (dto.faultDescription.length > ORDER_CONSTANTS.MAX_ORDER_DESCRIPTION) {
    errors.push(`故障描述不能超过${ORDER_CONSTANTS.MAX_ORDER_DESCRIPTION}字符`);
  }

  if (!dto.fcxAmount || dto.fcxAmount <= 0) {
    errors.push('FCX金额必须大于0');
  }

  if (!dto.factoryId) {
    errors.push('工厂ID不能为空');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * 验证完成工单数据
 */
export function validateCompleteOrderDto(dto: CompleteRepairOrderDTO): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!dto.orderId) {
    errors.push('工单ID不能为空');
  }

  if (dto.rating === undefined || dto.rating === null) {
    errors.push('评分不能为空');
  }

  if (
    dto.rating < ORDER_CONSTANTS.MIN_RATING ||
    dto.rating > ORDER_CONSTANTS.MAX_RATING
  ) {
    errors.push(
      `评分必须?{ORDER_CONSTANTS.MIN_RATING}-${ORDER_CONSTANTS.MAX_RATING}之间`
    );
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * 验证评分数据
 */
export function validateRating(rating: number): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (rating === undefined || rating === null) {
    errors.push('评分不能为空');
  }

  if (typeof rating !== 'number') {
    errors.push('评分必须是数?);
  }

  if (rating < ORDER_CONSTANTS.MIN_RATING) {
    errors.push(`评分不能小于${ORDER_CONSTANTS.MIN_RATING}`);
  }

  if (rating > ORDER_CONSTANTS.MAX_RATING) {
    errors.push(`评分不能大于${ORDER_CONSTANTS.MAX_RATING}`);
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * 验证邮箱格式
 */
export function validateEmail(email: string): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!email) {
    errors.push('邮箱不能为空');
  } else if (!emailRegex.test(email)) {
    errors.push('邮箱格式不正?);
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * 验证手机号格? */
export function validatePhone(phone: string): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  const phoneRegex = /^1[3-9]\d{9}$/; // 中国手机号验?
  if (!phone) {
    errors.push('手机号不能为?);
  } else if (!phoneRegex.test(phone)) {
    errors.push('手机号格式不正确');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * 验证用户名格? */
export function validateUsername(username: string): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!username) {
    errors.push('用户名不能为?);
  } else if (username.length < 2) {
    errors.push('用户名至?个字?);
  } else if (username.length > 20) {
    errors.push('用户名不能超?0个字?);
  } else if (!/^[a-zA-Z0-9_\u4e00-\u9fa5]+$/.test(username)) {
    errors.push('用户名只能包含字母、数字、下划线和中?);
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * 验证密码强度
 */
export function validatePassword(password: string): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!password) {
    errors.push('密码不能为空');
  } else {
    if (password.length < 8) {
      errors.push('密码至少8个字?);
    }

    if (password.length > 32) {
      errors.push('密码不能超过32个字?);
    }

    if (!/(?=.*[a-z])/.test(password)) {
      errors.push('密码必须包含小写字母');
    }

    if (!/(?=.*[A-Z])/.test(password)) {
      errors.push('密码必须包含大写字母');
    }

    if (!/(?=.*\d)/.test(password)) {
      errors.push('密码必须包含数字');
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * 批量验证多个字段
 */
export function validateMultiple(
  validators: Array<() => { isValid: boolean; errors: string[] }>
): {
  isValid: boolean;
  errors: string[];
} {
  const allErrors: string[] = [];

  validators.forEach(validator => {
    const result = validator();
    if (!result.isValid) {
      allErrors.push(...result.errors);
    }
  });

  return {
    isValid: allErrors.length === 0,
    errors: allErrors,
  };
}

/**
 * 验证对象必填字段
 */
export function validateRequiredFields(
  obj: Record<string, any>,
  requiredFields: string[]
): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  requiredFields.forEach(field => {
    if (obj[field] === undefined || obj[field] === null || obj[field] === '') {
      errors.push(`${field} 为必填项`);
    }
  });

  return {
    isValid: errors.length === 0,
    errors,
  };
}
