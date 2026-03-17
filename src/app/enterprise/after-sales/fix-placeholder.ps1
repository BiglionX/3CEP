$content = Get-Content page.tsx -Raw
$content = $content -replace '请输入产品型
"','请输入产品型号"
'
Set-Content page.tsx -Value $content
