# 以管理员身份运行 PowerShell，然后执行：
#   Set-ExecutionPolicy -Scope Process Bypass
#   .\scripts\open-firewall.ps1

$ruleName = 'Vite Dev Server 5173'

$existing = Get-NetFirewallRule -DisplayName $ruleName -ErrorAction SilentlyContinue
if ($existing) {
  Write-Host "防火墙规则已存在：$ruleName"
  exit 0
}

New-NetFirewallRule `
  -DisplayName $ruleName `
  -Direction Inbound `
  -Action Allow `
  -Protocol TCP `
  -LocalPort 5173 `
  -Profile Private, Domain

Write-Host "已添加防火墙入站规则，允许 TCP 5173"
Write-Host "请重新运行 npm run dev:host，再用手机访问 Network 地址"
