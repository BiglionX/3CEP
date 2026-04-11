# 📄 产品库数据导入模板

## CSV 文件格式说明

### 1. 整机产品导入模板 (complete_products.csv)

```csv
skuCode,brandId,name,type,description,specifications
MBP-2024-M3,brand-uuid-1,MacBook Pro 14-inch M3,complete,"Apple MacBook Pro with M3 Pro chip","{""cpu"":""M3 Pro"",""ram"":""18GB"",""storage"":""512GB SSD""}"
TP-X1-2024,brand-uuid-2,ThinkPad X1 Carbon,complete,"Lenovo ThinkPad X1 Carbon Gen 11","{""cpu"":""Intel i7-1355U"",""ram"":""16GB"",""storage"":""1TB SSD""}"
```

**必填字段**:

- `skuCode`: SKU编码（唯一）
- `brandId`: 品牌ID
- `name`: 产品名称
- `type`: 产品类型（固定为 "complete"）

**可选字段**:

- `description`: 产品描述
- `specifications`: 规格参数（JSON格式字符串）

---

### 2. 配件导入模板 (accessories.csv)

```csv
skuCode,brandId,name,type,description,compatibleProducts,specifications
CHARGER-65W,brand-uuid-1,65W USB-C Charger,accessory,"USB-C fast charger","[""product-uuid-1""]","{""power"":""65W"",""connector"":""USB-C""}"
CASE-MBP14,brand-uuid-1,MacBook Pro 14 Case,accessory,"Protective case for MacBook Pro 14","[""product-uuid-1""]","{""material"":""Silicone"",""color"":""Black""}"
```

**必填字段**:

- `skuCode`: SKU编码（唯一）
- `brandId`: 品牌ID
- `name`: 配件名称
- `type`: 产品类型（固定为 "accessory"）

**可选字段**:

- `description`: 配件描述
- `compatibleProducts`: 兼容的产品ID列表（JSON数组字符串）
- `specifications`: 规格参数（JSON格式字符串）

---

### 3. 部件导入模板 (components.csv)

```csv
skuCode,brandId,name,type,description,specifications
RAM-18GB-M3,brand-uuid-1,18GB Unified Memory,component,"Apple M3 Pro unified memory","{""capacity"":""18GB"",""type"":""LPDDR5""}"
SSD-512GB,brand-uuid-3,Samsung 512GB NVMe SSD,component,"High-speed NVMe SSD","{""capacity"":""512GB"",""interface"":""NVMe PCIe 4.0""}"
```

**必填字段**:

- `skuCode`: SKU编码（唯一）
- `brandId`: 品牌ID
- `name`: 部件名称
- `type`: 产品类型（固定为 "component"）

**可选字段**:

- `description`: 部件描述
- `specifications`: 规格参数（JSON格式字符串）

---

### 4. 零件导入模板 (parts.csv)

```csv
skuCode,brandId,name,type,description,material,dimensions,specifications
SCREW-M2x4,,M2x4 Screw,part,"Stainless steel screw","Stainless Steel","{""length"":4,""width"":2,""height"":2,""unit"":""mm""}","{""thread_pitch"":0.4}"
RESISTOR-10K,,10K Ohm Resistor,part,"Carbon film resistor","Carbon","{}","{""resistance"":""10k"",""tolerance"":""5%""}"
```

**必填字段**:

- `skuCode`: SKU编码（唯一）
- `name`: 零件名称
- `type`: 产品类型（固定为 "part"）

**可选字段**:

- `brandId`: 品牌ID（零件可以没有品牌）
- `description`: 零件描述
- `material`: 材质
- `dimensions`: 尺寸信息（JSON对象）
- `specifications`: 规格参数（JSON格式字符串）

---

## 混合导入模板 (all_products.csv)

可以在一个CSV文件中导入所有类型的产品，通过 `type` 字段区分：

```csv
skuCode,brandId,name,type,description,specifications,material,dimensions
MBP-2024-M3,brand-uuid-1,MacBook Pro 14-inch,complete,"Apple laptop","{""cpu"":""M3 Pro""}",,
CHARGER-65W,brand-uuid-1,65W Charger,accessory,"Fast charger","{""power"":""65W""}",,
RAM-18GB,brand-uuid-1,18GB Memory,component,"Unified memory","{""capacity"":""18GB""}",,
SCREW-M2x4,,M2x4 Screw,part,"Steel screw",,"Stainless Steel","{""length"":4,""width"":2,""height"":2,""unit"":""mm""}"
```

---

## 注意事项

### 1. 编码格式

- 使用 UTF-8 编码
- 建议使用 Excel 另存为 "CSV UTF-8 (逗号分隔)" 格式

### 2. 特殊字符处理

- 如果字段值包含逗号、换行符或双引号，需要用双引号包裹
- 双引号本身需要转义为两个双引号 `""`

### 3. JSON 字段

- `specifications`、`compatibleProducts`、`dimensions` 等字段必须是有效的 JSON 字符串
- 确保 JSON 中的双引号已正确转义

### 4. 数据验证

- SKU 编码必须唯一
- 品牌ID必须在数据库中存在
- 所有必填字段不能为空

### 5. 批量导入建议

- 单次导入不超过 1000 条记录
- 大文件建议分批导入
- 导入前先在测试环境验证

---

## 导入示例

### 使用 curl 命令导入

```bash
curl -X POST http://localhost:3000/api/product-library/import/csv \
  -F "file=@products.csv"
```

### 使用 JavaScript fetch

```javascript
const formData = new FormData();
formData.append('file', fileInput.files[0]);

const response = await fetch('/api/product-library/import/csv', {
  method: 'POST',
  body: formData,
});

const result = await response.json();
console.log(result);
```

---

## 导入结果说明

```json
{
  "success": true,
  "data": {
    "success": true,
    "totalRecords": 100,
    "successRecords": 95,
    "failedRecords": 5,
    "errors": [
      {
        "row": 10,
        "skuCode": "INVALID-SKU",
        "error": "SKU编码格式不正确"
      }
    ],
    "warnings": [
      {
        "row": 15,
        "skuCode": "PROD-001",
        "warning": "建议为整机产品指定类目"
      }
    ]
  },
  "message": "部分导入失败"
}
```

---

## 常见问题

### Q1: 如何处理重复的SKU？

A: 系统会自动检测并跳过已存在的SKU，在错误列表中会显示 "SKU xxx 已存在"

### Q2: 如何获取 brandId？

A: 先调用 `GET /api/product-library/brands` 获取品牌列表，找到对应的品牌ID

### Q3: specifications 字段格式是什么？

A: 必须是有效的 JSON 字符串，例如：`"{\"cpu\":\"M3\",\"ram\":\"18GB\"}"`

### Q4: 支持多大的文件？

A: 建议单个文件不超过 10MB，约 1000-2000 条记录

### Q5: 导入失败后数据会回滚吗？

A: 不会。已成功导入的记录会保留，失败的记录会在错误列表中显示

---

**准备好开始导入了吗？** 🚀
