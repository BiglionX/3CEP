$content = Get-Content page.tsx -Raw
$content = $content -replace '请输入产品名
"','请输入产品名称"
'
Set-Content page.tsx -Value $content
