/**
 * 修复 manual-page.tsx 文件中的编码问题
 */

const fs = require('fs');
const path = require('path');

const filePath = path.join(
  process.cwd(),
  'src/app/admin/content-review/manual/page.tsx'
);

if (!fs.existsSync(filePath)) {
  console.error(`❌ 文件不存在：${filePath}`);
  process.exit(1);
}

let content = fs.readFileSync(filePath, 'utf8');
const originalContent = content;

// 修复所有损坏的中文字符
const fixes = [
  [/置信\?/g, '置信度'],
  [/问\?/g, '问题'],
  [/检测到的问\?/g, '检测到的问题'],
  [/建议操作/g, '建议操作'],
  [/审核不通过的原因/g, '审核不通过的原因'],
  [/修改后重新提交/g, '修改后重新提交'],
  [/查看详情/g, '查看详情'],
  [/批量操作/g, '批量操作'],
  [/确认要批量通过/g, '确认要批量通过'],
  [/确认要批量拒绝/g, '确认要批量拒绝'],
  [/请选择要操作的/g, '请选择要操作的'],
  [/操作成功/g, '操作成功'],
  [/操作失败/g, '操作失败'],
  [/暂无数据/g, '暂无数据'],
  [/加载中/g, '加载中'],
  [/搜索/g, '搜索'],
  [/重置/g, '重置'],
  [/通过/g, '通过'],
  [/拒绝/g, '拒绝'],
  [/查看/g, '查看'],
  [/状态/g, '状态'],
  [/创建时间/g, '创建时间'],
  [/更新时间/g, '更新时间'],
  [/操作人/g, '操作人'],
  [/备注/g, '备注'],
  [/保存/g, '保存'],
  [/取消/g, '取消'],
  [/删除/g, '删除'],
  [/编辑/g, '编辑'],
  [/添加/g, '添加'],
  [/导入/g, '导入'],
  [/导出/g, '导出'],
  [/下载/g, '下载'],
  [/上传/g, '上传'],
  [/选择/g, '选择'],
  [/确定/g, '确定'],
];

// 应用所有修复
for (const [pattern, replacement] of fixes) {
  content = content.replace(pattern, replacement);
}

// 保存修复后的文件
if (content !== originalContent) {
  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`✅ 已修复文件中的编码问题`);

  // 统计修复数量
  let count = 0;
  for (const [pattern] of fixes) {
    const matches = originalContent.match(pattern);
    if (matches) {
      count += matches.length;
    }
  }
  console.log(`📊 共修复 ${count} 处编码问题`);
} else {
  console.log(`⚠️  无需修复`);
}

process.exit(0);
