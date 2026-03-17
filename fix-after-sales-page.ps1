# 修复脚本：fix-after-sales-page.ps1
# 用途：修复 d:/BigLionX/3cep/src/app/enterprise/after-sales/page.tsx 中的语法错误

$ErrorActionPreference = "Stop"
$filePath = "d:/BigLionX/3cep/src/app/enterprise/after-sales/page.tsx"
$backupPath = "$filePath.backup"

# 备份原文件
if (Test-Path $filePath) {
    Copy-Item $filePath $backupPath
    Write-Host "已备份原文件到: $backupPath" -ForegroundColor Green
} else {
    Write-Host "错误：找不到文件 $filePath" -ForegroundColor Red
    exit 1
}

$content = Get-Content $filePath -Raw -Encoding UTF8

$fixes = 0

# ===== 修复JSX标签 =====

# 修复 CardTitle 标签
if ($content -match '多语言说明/CardTitle>') {
    $content = $content -replace '多语言说明/CardTitle>', '多语言说明书</CardTitle>'
    $fixes++
}

if ($content -match '二维码批量生\s+</CardTitle>') {
    $content = $content -replace '二维码批量生\s+</CardTitle>', '二维码批量生成</CardTitle>'
    $fixes++
}

if ($content -match '智能知识\s+</CardTitle>') {
    $content = $content -replace '智能知识\s+</CardTitle>', '智能知识库</CardTitle>'
    $fixes++
}

if ($content -match '说明书列/CardTitle>') {
    $content = $content -replace '说明书列/CardTitle>', '说明书列表</CardTitle>'
    $fixes++
}

if ($content -match '维修技巧列/CardTitle>') {
    $content = $content -replace '维修技巧列/CardTitle>', '维修技巧列表</CardTitle>'
    $fixes++
}

if ($content -match '软件升级包列/CardTitle>') {
    $content = $content -replace '软件升级包列/CardTitle>', '软件升级包列表</CardTitle>'
    $fixes++
}

if ($content -match '进行/CardTitle>') {
    $content = $content -replace '进行/CardTitle>', '进行中</CardTitle>'
    $fixes++
}

if ($content -match '总参与人/CardTitle>') {
    $content = $content -replace '总参与人/CardTitle>', '总参与人数</CardTitle>'
    $fixes++
}

if ($content -match '参与/CardTitle>') {
    $content = $content -replace '参与/CardTitle>', '参与人数</CardTitle>'
    $fixes++
}

if ($content -match '浏览/CardTitle>') {
    $content = $content -replace '浏览/CardTitle>', '浏览次数</CardTitle>'
    $fixes++
}

# 修复 th 标签
if ($content -match '工单/th>') {
    $content = $content -replace '工单/th>', '工单号</th>'
    $fixes++
}

if ($content -match '状/th>') {
    $content = $content -replace '状/th>', '状态</th>'
    $fixes++
}

if ($content -match '优先/th>') {
    $content = $content -replace '优先/th>', '优先级</th>'
    $fixes++
}

if ($content -match '状\s+</th>') {
    $content = $content -replace '状\s+</th>', '状态</th>'
    $fixes++
}

if ($content -match '浏览\s+</th>') {
    $content = $content -replace '浏览\s+</th>', '浏览量</th>'
    $fixes++
}

if ($content -match '技巧信\s+</th>') {
    $content = $content -replace '技巧信\s+</th>', '技巧信息</th>'
    $fixes++
}

if ($content -match '升级包信\s+</th>') {
    $content = $content -replace '升级包信\s+</th>', '升级包信息</th>'
    $fixes++
}

if ($content -match '下载\s+</th>') {
    $content = $content -replace '下载\s+</th>', '下载量</th>'
    $fixes++
}

# 修复 Button 标签
if ($content -match '批量生成二维/Button>') {
    $content = $content -replace '批量生成二维/Button>', '批量生成二维码</Button>'
    $fixes++
}

# 修复 div 标签
if ($content -match '次浏/div>') {
    $content = $content -replace '次浏/div>', '次浏览</div>'
    $fixes++
}

# ===== 修复字符串截断 =====

# 修复状态文本
if ($content -match "'待处}") {
    $content = $content -replace "'待处}", "'待处理'"
    $fixes++
}

if ($content -match "'处理}") {
    $content = $content -replace "'处理}", "'处理中'"
    $fixes++
}

if ($content -match "'已解}") {
    $content = $content -replace "'已解}", "'已解决'"
    $fixes++
}

if ($content -match "'已关}") {
    $content = $content -replace "'已关}", "'已关闭'"
    $fixes++
}

# 修复优先级文本
if ($content -match "{ticket\.priority === 'low' && ''}") {
    $content = $content -replace "{ticket\.priority === 'low' && ''}", "{ticket.priority === 'low' && '低'}"
    $fixes++
}

if ($content -match "{ticket\.priority === 'medium' && ''}") {
    $content = $content -replace "{ticket\.priority === 'medium' && ''}", "{ticket.priority === 'medium' && '中'}"
    $fixes++
}

if ($content -match "{ticket\.priority === 'high' && ''}") {
    $content = $content -replace "{ticket\.priority === 'high' && ''}", "{ticket.priority === 'high' && '高'}"
    $fixes++
}

if ($content -match "'紧}") {
    $content = $content -replace "'紧}", "'紧急'"
    $fixes++
}

# 修复常见问题
if ($content -match "'如何重置设备密码,") {
    $content = $content -replace "'如何重置设备密码,", "'如何重置设备密码？'"
    $fixes++
}

if ($content -match "'电池续航时间短的原因,") {
    $content = $content -replace "'电池续航时间短的原因,", "'电池续航时间短的原因'"
    $fixes++
}

# 修复多语言配置
if ($content -match "{ lang: '日本, flag: '🇯🇵' }") {
    $content = $content -replace "{ lang: '日本, flag: '🇯🇵' }", "{ lang: '日本', flag: '🇯🇵' }"
    $fixes++
}

if ($content -match "{ lang: '한국, flag: '🇰🇷' }") {
    $content = $content -replace "{ lang: '한국, flag: '🇰🇷' }", "{ lang: '한국어', flag: '🇰🇷' }"
    $fixes++
}

# 修复icon配置
if ($content -match "{ id: 'quiz', name: '有奖问答', icon: ' }") {
    $content = $content -replace "{ id: 'quiz', name: '有奖问答', icon: ' }", "{ id: 'quiz', name: '有奖问答', icon: '🎯' }"
    $fixes++
}

# 修复文本描述
if ($content -match "支持多种语言的电子说明书和操作指\s+") {
    $content = $content -replace "支持多种语言的电子说明书和操作指\s+", "支持多种语言的电子说明书和操作指导"
    $fixes++
}

if ($content -match '{/\* 二维码管\*/}') {
    $content = $content -replace '{/\* 二维码管\*/}', '{/* 二维码管理 */}'
    $fixes++
}

if ($content -match "扫码查看设备完整服务历史和维护记\s+") {
    $content = $content -replace "扫码查看设备完整服务历史和维护记\s+", "扫码查看设备完整服务历史和维护记录"
    $fixes++
}

if ($content -match '{/\* 子标签导\*/}') {
    $content = $content -replace '{/\* 子标签导\*/}', '{/* 子标签导航 */}'
    $fixes++
}

# 修复错误消息
if ($content -match "获取说明书列表失\);") {
    $content = $content -replace "获取说明书列表失\);", "获取说明书列表失败');"
    $fixes++
}

if ($content -match "获取说明书列表错") {
    $content = $content -replace "获取说明书列表错", "获取说明书列表错误"
    $fixes++
}

if ($content -match "// 创建说明  const createManual") {
    $content = $content -replace "// 创建说明  const createManual", "// 创建说明书  const createManual"
    $fixes++
}

if ($content -match "创建说明书失") {
    $content = $content -replace "创建说明书失", "创建说明书失败"
    $fixes++
}

if ($content -match "获取维修技巧列表失\);") {
    $content = $content -replace "获取维修技巧列表失\);", "获取维修技巧列表失败');"
    $fixes++
}

if ($content -match "获取维修技巧列表错") {
    $content = $content -replace "获取维修技巧列表错", "获取维修技巧列表错误"
    $fixes++
}

if ($content -match "// 创建维修技  const createRepairTip") {
    $content = $content -replace "// 创建维修技  const createRepairTip", "// 创建维修技巧  const createRepairTip"
    $fixes++
}

if ($content -match "创建维修技巧失") {
    $content = $content -replace "创建维修技巧失", "创建维修技巧失败"
    $fixes++
}

if ($content -match "获取软件升级包列表失\);") {
    $content = $content -replace "获取软件升级包列表失\);", "获取软件升级包列表失败');"
    $fixes++
}

if ($content -match "获取软件升级包列表错") {
    $content = $content -replace "获取软件升级包列表错", "获取软件升级包列表错误"
    $fixes++
}

if ($content -match "// 创建软件升级到  const createSoftwareUpdate") {
    $content = $content -replace "// 创建软件升级到  const createSoftwareUpdate", "// 创建软件升级包  const createSoftwareUpdate"
    $fixes++
}

if ($content -match "创建软件升级包失") {
    $content = $content -replace "创建软件升级包失", "创建软件升级包失败"
    $fixes++
}

# 修复三元运算符语法错误
if ($content -match '\{part\.price  `') {
    $content = $content -replace '\{part\.price  `', "{part.price ? `"
    $fixes++
}

if ($content -match 'placeholder="请输入HTML格式的图文内$') {
    $content = $content -replace 'placeholder="请输入HTML格式的图文内$', 'placeholder="请输入HTML格式的图文内容"'
    $fixes++
}

# 保存修复后的文件
$content | Out-File -FilePath $filePath -Encoding UTF8 -NoNewline

Write-Host "`n修复完成！" -ForegroundColor Green
Write-Host "共修复 $fixes 处错误" -ForegroundColor Cyan
Write-Host "修复后的文件: $filePath" -ForegroundColor Cyan
Write-Host "原文件备份: $backupPath" -ForegroundColor Yellow
