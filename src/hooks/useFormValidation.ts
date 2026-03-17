'use client';
import { useState, useEffect } from 'react';

interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  customValidator?: (value: string) => boolean | string;
}

interface FieldValidation {
  value: string;
  error: string | null;
  isValid: boolean;
}

interface FormValidationState {
  [key: string]: FieldValidation;
}

export function useFormValidation(initialFields: Record<string, string>) {
  const [fields, setFields] = useState<FormValidationState>({});
  const [isValid, setIsValid] = useState(false);

  // 初始化字段
  useEffect(() => {
    const initialValidation: FormValidationState = {};
    Object.keys(initialFields).forEach(key => {
      initialValidation[key] = {
        value: initialFields[key],
        error: null,
        isValid: true,
      };
    });
    setFields(initialValidation);
  }, [initialFields]);

  const validateField = (
    _fieldName: string,
    value: string,
    rules: ValidationRule
  ): FieldValidation => {
    let error: string | null = null;

    // 必填验证
    if (rules.required && !value.trim()) {
      error = '此字段为必填项';
    }

    // 最小长度验证
    if (!error && rules.minLength && value.length < rules.minLength) {
      error = `最少需要${rules.minLength}个字符`;
    }

    // 最大长度验证
    if (!error && rules.maxLength && value.length > rules.maxLength) {
      error = `最多允许${rules.maxLength}个字符`;
    }

    // 正则表达式验证
    if (!error && rules.pattern && !rules.pattern.test(value)) {
      error = '输入格式不正确';
    }

    // 自定义验证器
    if (!error && rules.customValidator) {
      const customResult = rules.customValidator(value);
      if (typeof customResult === 'string') {
        error = customResult;
      } else if (customResult === false) {
        error = '输入不符合要求';
      }
    }

    return {
      value,
      error,
      isValid: error === null,
    };
  };

  const updateField = (
    fieldName: string,
    value: string,
    rules: ValidationRule
  ) => {
    const validation = validateField(fieldName, value, rules);
    setFields(prev => ({
      ...prev,
      [fieldName]: validation,
    }));
  };

  // 批量验证所有字段
  const validateAll = (
    validationRules: Record<string, ValidationRule>
  ): boolean => {
    const newFields: FormValidationState = {};
    let allValid = true;

    Object.keys(fields).forEach(fieldName => {
      const rules = validationRules[fieldName] || {};
      const validation = validateField(
        fieldName,
        fields[fieldName].value,
        rules
      );
      newFields[fieldName] = validation;
      if (!validation.isValid) {
        allValid = false;
      }
    });

    setFields(newFields);
    setIsValid(allValid);
    return allValid;
  };

  // 获取字段值
  const getFieldValues = (): Record<string, string> => {
    const values: Record<string, string> = {};
    Object.keys(fields).forEach(key => {
      values[key] = fields[key].value;
    });
    return values;
  };

  // 获取第一个错误字段
  const getFirstError = (): string | null => {
    for (const [fieldName, field] of Object.entries(fields)) {
      if (field.error) {
        return fieldName;
      }
    }
    return null;
  };

  return {
    fields,
    isValid,
    updateField,
    validateAll,
    getFieldValues,
    getFirstError,
    // 便捷方法
    getValue: (fieldName: string) => fields[fieldName]?.value || '',
    getError: (fieldName: string) => fields[fieldName]?.error || null,
    setValue: (fieldName: string, value: string) => {
      setFields(prev => ({
        ...prev,
        [fieldName]: { ...prev[fieldName], value },
      }));
    },
  };
}

// 预定义的常用验证规则
export const ValidationRules = {
  required: { required: true },
  email: {
    required: true,
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  },
  phone: {
    required: true,
    pattern: /^1[3-9]\d{9}$/,
  },
  companyName: {
    required: true,
    minLength: 2,
    maxLength: 50,
  },
  budget: {
    pattern: /^¥?\d{1,3}(,\d{3})*(\.\d{1,2})?$/,
    customValidator: (value: string) => {
      if (!value) return true;
      const cleanValue = value.replace(/¥|,/g, '');
      const num = parseFloat(cleanValue);
      return num > 0 ? true : '请输入有效的金额';
    },
  },
  productName: {
    required: true,
    minLength: 1,
    maxLength: 100,
  },
  quantity: {
    required: true,
    pattern: /^\d+([.]\d+)?\s*[件个套台批]*$/,
    customValidator: (value: string) => {
      const num = parseFloat(value);
      return num > 0 ? true : '请输入有效的数量';
    },
  },
};
