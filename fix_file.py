# -*- coding: utf-8 -*-
import codecs

# 读取文件
with codecs.open('src/app/scan/[id]/page.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# 输出第123行的Unicode字符
lines = content.split('\n')
print("Line 123:", repr(lines[122]))

# 替换所有特殊字符
replacements = [
    # 替换三元运算符
    (r'(\w+)\s+\u00a0\s*\(', r'\1 ? ('),
    (r'\)\s+\u00a0\s*\(', r') ? ('),
    (r"Error\s+\u00a0\s+err", r'Error ? err'),

    # 替换反斜杠
    (r'getCurrentLanguageManuals\(\)\\\.length', r'getCurrentLanguageManuals().length'),

    # 修复 API URL
    (r'profileqrcodeId=', r'profile?qrcodeId='),

    # 修复 product 为 null 的情况
    (r'if \(!product\.manuals\)', r'if (!product || !product.manuals)'),

    # 添加可选链
    (r'\bdetectedDevice\.brand(?!\?)', r'detectedDevice?.brand'),
    (r'\bdetectedDevice\.model(?!\?)', r'detectedDevice?.model'),
    (r'\bdetectedDevice\.deviceType(?!\?)', r'detectedDevice?.deviceType'),
    (r'\bdetectedDevice\.confidence(?!\?)', r'detectedDevice?.confidence'),

    (r'\bdeviceProfile\.productModel(?!\?)', r'deviceProfile?.productModel'),
    (r'\bdeviceProfile\.brandName(?!\?)', r'deviceProfile?.brandName'),
    (r'\bdeviceProfile\.serialNumber(?!\?)', r'deviceProfile?.serialNumber'),
    (r'\bdeviceProfile\.manufacturingDate(?!\?)', r'deviceProfile?.manufacturingDate'),
    (r'\bdeviceProfile\.currentStatus(?!\?)', r'deviceProfile?.currentStatus'),
    (r'\bdeviceProfile\.firstActivatedAt(?!\?)', r'deviceProfile?.firstActivatedAt'),
    (r'\bdeviceProfile\.lastEventAt(?!\?)', r'deviceProfile?.lastEventAt'),
    (r'\bdeviceProfile\.currentLocation(?!\?)', r'deviceProfile?.currentLocation'),
    (r'\bdeviceProfile\.totalRepairCount(?!\?)', r'deviceProfile?.totalRepairCount'),
    (r'\bdeviceProfile\.totalPartReplacementCount(?!\?)', r'deviceProfile?.totalPartReplacementCount'),
    (r'\bdeviceProfile\.totalTransferCount(?!\?)', r'deviceProfile?.totalTransferCount'),
]

import re
for pattern, replacement in replacements:
    content = re.sub(pattern, replacement, content)

# 写回文件
with codecs.open('src/app/scan/[id]/page.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("File fixed successfully")
