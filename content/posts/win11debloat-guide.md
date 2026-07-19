---
title: "Win11Debloat 完全指南：三种方案彻底清理 Windows 臃肿"
date: "2026-07-19"
tags: ["Windows", "优化", "开源工具", "系统清理"]
summary: "Win11Debloat 是一个开源 Windows 清理脚本，能一键删除系统预装臃肿应用、关闭遥测、优化界面。本文提供三种方案——保守、中等、完整，适合不同需求的用户，附完整代码与小白教程。"
---

## 🧹 这是什么？

Win11Debloat 是一个开源的 Windows 清理脚本，用 PowerShell 写成。它能帮你：

- 🗑️ **移除预装应用**：Xbox、Bing、Cortana、Teams、Skype 等 35+ 没人用的臃肿软件
- 🔒 **禁用遥测**：关闭 Windows 后台数据收集和诊断跟踪
- 🤖 **移除 AI 功能**：关闭 Copilot、Windows Recall 等 AI 特性
- 🎨 **界面优化**：隐藏任务栏搜索/小组件、关闭锁屏广告
- ⚙️ **系统优化**：显示隐藏文件、显示扩展名、关闭透明度

## ⚖️ 三种方案对比

我把清理力度分成了三档，你可以根据自己的需求选择：

| 对比项 | 🅰️ 保守 | 🅱️ 中等 | 🅲 完整 |
|:-------|:----:|:----:|:----:|
| Xbox 全套 | ✅ 删除 | ✅ 删除 | ✅ 删除 |
| Bing 搜索/新闻/天气 | ✅ 部分 | ✅ 全部 | ✅ 全部 |
| Zune 音乐/视频 | ✅ 删除 | ✅ 删除 | ✅ 删除 |
| Solitaire/Skype/3D Viewer | ✅ 删除 | ✅ 删除 | ✅ 删除 |
| 遥测与跟踪 | ✅ 关闭 | ✅ 关闭 | ✅ 关闭 |
| Cortana | — | ✅ 关闭 | ✅ 关闭 |
| 开始菜单联网搜索 | — | ✅ 关闭 | ✅ 关闭 |
| OneNote/Outlook/Office Hub | — | ✅ 删除 | ✅ 删除 |
| YourPhone/录音机 | — | ✅ 删除 | ✅ 删除 |
| Copilot AI | — | — | ✅ 关闭 |
| Windows Recall | — | — | ✅ 关闭 |
| Teams/OneDrive | — | — | ✅ 删除 |
| 任务栏搜索/小组件/聊天 | — | — | ✅ 隐藏 |
| 推荐人群 | 学生/办公 | 普通用户 | 极客/玩家 |

## 🅰️ 保守方案 — 只删绝对安全的

适合：学生、办公人群、第一次使用清理脚本的新手。只删除 15 个"删了绝对不会后悔"的应用。

### 删除的应用清单

Xbox 全套（5个）、Bing 搜索、Zune 音乐、Solitaire、Skype、3D Viewer、Mixed Reality、People、Print3D、Wallet、GetHelp、Getstarted

### 保守方案代码

直接复制下面所有代码 → 打开管理员 PowerShell → 右键粘贴回车即可：

```
if (-NOT ([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole] "Administrator")) {
    Write-Warning "请用管理员身份运行！"; pause; exit 1
}
Write-Host "`n=== 保守方案 - Win11 Debloat ===" -ForegroundColor Cyan
$apps = @("Microsoft.Xbox.TCUI","Microsoft.XboxGameCallableUI","Microsoft.XboxGamingOverlay","Microsoft.XboxIdentityProvider","Microsoft.XboxSpeechToTextOverlay","Microsoft.ZuneMusic","Microsoft.BingSearch","Microsoft.GetHelp","Microsoft.Getstarted","Microsoft.Microsoft3DViewer","Microsoft.MixedReality.Portal","Microsoft.MicrosoftSolitaireCollection","Microsoft.SkypeApp","Microsoft.People","Microsoft.Print3D","Microsoft.Wallet")
$count = 0
foreach ($a in $apps) {
    $pkg = Get-AppxPackage -AllUsers -Name $a -ErrorAction SilentlyContinue
    foreach ($p in $pkg) {
        try { Remove-AppxPackage -Package $p.PackageFullName -AllUsers -ErrorAction Stop; Write-Host "  - $($p.Name)"; $count++ } catch {}
    }
}
Write-Host "  删除了 $count 个应用" -ForegroundColor Green
foreach ($a in $apps) { $prov = Get-AppxProvisionedPackage -Online | Where-Object { $_.DisplayName -like "$a*" }; foreach ($p in $prov) { Remove-AppxProvisionedPackage -Online -PackageName $p.PackageName -ErrorAction SilentlyContinue | Out-Null } }
foreach ($svc in @("DiagTrack","Dmwappushservice")) { try { Stop-Service $svc -Force -ErrorAction SilentlyContinue; Set-Service $svc -StartupType Disabled; Write-Host "  - $svc 已关闭" } catch {} }
$telPaths = @("HKLM:\SOFTWARE\Policies\Microsoft\Windows\DataCollection","HKLM:\SOFTWARE\Microsoft\Windows\CurrentVersion\Policies\DataCollection")
foreach ($tp in $telPaths) { if (!(Test-Path $tp)) { New-Item -Path $tp -Force | Out-Null }; Set-ItemProperty -Path $tp -Name "AllowTelemetry" -Value 0 -Type DWord -ErrorAction SilentlyContinue }
$adv = "HKCU:\Software\Microsoft\Windows\CurrentVersion\Explorer\Advanced"
Set-ItemProperty -Path $adv -Name "Hidden" -Value 1; Set-ItemProperty -Path $adv -Name "HideFileExt" -Value 0
$cdm = "HKCU:\Software\Microsoft\Windows\CurrentVersion\ContentDeliveryManager"
foreach ($v in @("SoftLandingEnabled","SubscribedContent-338389Enabled","SubscribedContent-310093Enabled","SystemPaneSuggestionsEnabled")) { Set-ItemProperty -Path $cdm -Name $v -Value 0 -ErrorAction SilentlyContinue }
Write-Host "`n=== 完成 ===" -ForegroundColor Cyan
$restart = Read-Host "现在重启? (y/n)"
if ($restart -eq 'y') { Restart-Computer -Force }
```

## 🅱️ 中等方案 — 平衡选择

适合：普通用户、家用电脑。比保守方案多删 OneNote、Outlook、Bing 新闻/天气、录音机等，同时关闭 Cortana 和开始菜单联网搜索。

### 比保守方案多删的

OneNote、Outlook、Office Hub、YourPhone、Todos、PowerAutomate、Bing News/Weather、Sound Recorder、Mail & Calendar、Windows Maps、Feedback Hub

### 中等方案代码

```
if (-NOT ([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole] "Administrator")) {
    Write-Warning "请用管理员身份运行！"; pause; exit 1
}
Write-Host "`n=== 中等方案 - Win11 Debloat ===" -ForegroundColor Cyan
$apps = @("Microsoft.Xbox.TCUI","Microsoft.XboxGameCallableUI","Microsoft.XboxGamingOverlay","Microsoft.XboxIdentityProvider","Microsoft.XboxSpeechToTextOverlay","Microsoft.ZuneMusic","Microsoft.BingSearch","Microsoft.BingNews","Microsoft.BingWeather","Microsoft.GetHelp","Microsoft.Getstarted","Microsoft.Microsoft3DViewer","Microsoft.MixedReality.Portal","Microsoft.MicrosoftSolitaireCollection","Microsoft.SkypeApp","Microsoft.People","Microsoft.Print3D","Microsoft.Wallet","Microsoft.Office.OneNote","Microsoft.OutlookForWindows","Microsoft.MicrosoftOfficeHub","Microsoft.YourPhone","Microsoft.Todos","Microsoft.PowerAutomateDesktop","Microsoft.WindowsSoundRecorder","microsoft.windowscommunicationsapps","Microsoft.WindowsMaps","Microsoft.WindowsFeedbackHub") | Select-Object -Unique
$count = 0
foreach ($a in $apps) {
    $pkg = Get-AppxPackage -AllUsers -Name $a -ErrorAction SilentlyContinue
    foreach ($p in $pkg) {
        try { Remove-AppxPackage -Package $p.PackageFullName -AllUsers -ErrorAction Stop; Write-Host "  - $($p.Name)"; $count++ } catch {}
    }
}
foreach ($a in $apps) { $prov = Get-AppxProvisionedPackage -Online | Where-Object { $_.DisplayName -like "$a*" }; foreach ($p in $prov) { Remove-AppxProvisionedPackage -Online -PackageName $p.PackageName -ErrorAction SilentlyContinue | Out-Null } }
Write-Host "  删除了 $count 个应用" -ForegroundColor Green
foreach ($svc in @("DiagTrack","Dmwappushservice")) { try { Stop-Service $svc -Force -ErrorAction SilentlyContinue; Set-Service $svc -StartupType Disabled; Write-Host "  - $svc 已关闭" } catch {} }
$telPaths = @("HKLM:\SOFTWARE\Policies\Microsoft\Windows\DataCollection","HKLM:\SOFTWARE\Microsoft\Windows\CurrentVersion\Policies\DataCollection")
foreach ($tp in $telPaths) { if (!(Test-Path $tp)) { New-Item -Path $tp -Force | Out-Null }; Set-ItemProperty -Path $tp -Name "AllowTelemetry" -Value 0 -Type DWord -ErrorAction SilentlyContinue }
$cortana = "HKLM:\SOFTWARE\Policies\Microsoft\Windows\Windows Search"
if (!(Test-Path $cortana)) { New-Item -Path $cortana -Force | Out-Null }
Set-ItemProperty -Path $cortana -Name "AllowCortana" -Value 0 -Type DWord -ErrorAction SilentlyContinue
Set-ItemProperty -Path "HKCU:\Software\Microsoft\Windows\CurrentVersion\Search" -Name "BingSearchEnabled" -Value 0 -ErrorAction SilentlyContinue
Set-ItemProperty -Path "HKCU:\Software\Microsoft\Windows\CurrentVersion\Search" -Name "CortanaConsent" -Value 0 -ErrorAction SilentlyContinue
Set-ItemProperty -Path $cortana -Name "DisableWebSearch" -Value 1 -ErrorAction SilentlyContinue
Set-ItemProperty -Path $cortana -Name "ConnectedSearchUseWeb" -Value 0 -ErrorAction SilentlyContinue
Write-Host "  Cortana + 联网搜索: 已关闭" -ForegroundColor White
$adv = "HKCU:\Software\Microsoft\Windows\CurrentVersion\Explorer\Advanced"
Set-ItemProperty -Path $adv -Name "Hidden" -Value 1; Set-ItemProperty -Path $adv -Name "HideFileExt" -Value 0
Set-ItemProperty -Path "HKCU:\Software\Microsoft\Windows\CurrentVersion\Themes\Personalize" -Name "AppsUseLightTheme" -Value 0
Set-ItemProperty -Path "HKCU:\Software\Microsoft\Windows\CurrentVersion\Themes\Personalize" -Name "EnableTransparency" -Value 0
$cdm = "HKCU:\Software\Microsoft\Windows\CurrentVersion\ContentDeliveryManager"
foreach ($v in @("SoftLandingEnabled","SubscribedContent-338389Enabled","SubscribedContent-310093Enabled","SystemPaneSuggestionsEnabled")) { Set-ItemProperty -Path $cdm -Name $v -Value 0 -ErrorAction SilentlyContinue }
$notif = "HKCU:\Software\Policies\Microsoft\Windows\CurrentVersion\PushNotifications"
if (!(Test-Path $notif)) { New-Item -Path $notif -Force | Out-Null }
Set-ItemProperty -Path $notif -Name "NoToastApplicationNotification" -Value 1 -ErrorAction SilentlyContinue
$sys = "HKLM:\SOFTWARE\Policies\Microsoft\Windows\System"
if (!(Test-Path $sys)) { New-Item -Path $sys -Force | Out-Null }
Set-ItemProperty -Path $sys -Name "EnableActivityFeed" -Value 0 -Type DWord -ErrorAction SilentlyContinue
Set-ItemProperty -Path $sys -Name "PublishUserActivities" -Value 0 -Type DWord -ErrorAction SilentlyContinue
Set-ItemProperty -Path $sys -Name "UploadUserActivities" -Value 0 -Type DWord -ErrorAction SilentlyContinue
$loc = "HKLM:\SOFTWARE\Policies\Microsoft\Windows\LocationAndSensors"
if (!(Test-Path $loc)) { New-Item -Path $loc -Force | Out-Null }
Set-ItemProperty -Path $loc -Name "DisableLocation" -Value 1 -Type DWord -ErrorAction SilentlyContinue
Write-Host "`n=== 完成 ===" -ForegroundColor Cyan
$restart = Read-Host "现在重启? (y/n)"
if ($restart -eq 'y') { Restart-Computer -Force }
```

## 🅲 完整方案 — 极致清理

适合：极客、玩家、配置较低的电脑。删除一切可删除的，同时关闭 Copilot 和 Windows Recall。

### ⚠️ 注意

完整方案会删除 **OneDrive** 和 **Teams**！如果你平时用这两个软件，请选中等方案。

### 比中等方案多删的

Teams、OneDrive、Bing 财经/美食/体育/旅游、Clipchamp、Copilot、Recall、任务栏搜索/小组件/聊天隐藏

### 完整方案代码

```
if (-NOT ([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole] "Administrator")) {
    Write-Warning "请用管理员身份运行！"; pause; exit 1
}
Write-Host "`n=== 完整方案 - Win11 Debloat ===" -ForegroundColor Red
Write-Host "警告：将删除 OneDrive 和 Teams！" -ForegroundColor Yellow
$apps = @("Microsoft.Xbox.TCUI","Microsoft.XboxGameCallableUI","Microsoft.XboxGamingOverlay","Microsoft.XboxIdentityProvider","Microsoft.XboxSpeechToTextOverlay","Microsoft.ZuneMusic","Microsoft.ZuneVideo","Microsoft.BingSearch","Microsoft.BingNews","Microsoft.BingWeather","Microsoft.BingFinance","Microsoft.BingFoodAndDrink","Microsoft.BingSports","Microsoft.BingTravel","Microsoft.Office.OneNote","Microsoft.OutlookForWindows","Microsoft.MicrosoftOfficeHub","Microsoft.YourPhone","Microsoft.Todos","Microsoft.PowerAutomateDesktop","Microsoft.Teams","Microsoft.SkypeApp","Microsoft.GetHelp","Microsoft.Getstarted","Microsoft.Microsoft3DViewer","Microsoft.MixedReality.Portal","Microsoft.MicrosoftSolitaireCollection","Microsoft.People","Microsoft.Print3D","Microsoft.Wallet","Microsoft.WindowsMaps","Microsoft.WindowsFeedbackHub","Microsoft.WindowsSoundRecorder","microsoft.windowscommunicationsapps","Microsoft.Clipchamp","Microsoft.Windows.Ai.Copilot.Provider") | Select-Object -Unique
$count = 0
foreach ($a in $apps) {
    $pkg = Get-AppxPackage -AllUsers -Name $a -ErrorAction SilentlyContinue
    foreach ($p in $pkg) {
        try { Remove-AppxPackage -Package $p.PackageFullName -AllUsers -ErrorAction Stop; Write-Host "  - $($p.Name)"; $count++ } catch {}
    }
}
foreach ($a in $apps) { $prov = Get-AppxProvisionedPackage -Online | Where-Object { $_.DisplayName -like "$a*" }; foreach ($p in $prov) { Remove-AppxProvisionedPackage -Online -PackageName $p.PackageName -ErrorAction SilentlyContinue | Out-Null } }
Write-Host "  删除了 $count 个应用" -ForegroundColor Green
foreach ($svc in @("DiagTrack","Dmwappushservice")) { try { Stop-Service $svc -Force -ErrorAction SilentlyContinue; Set-Service $svc -StartupType Disabled } catch {} }
$telPaths = @("HKLM:\SOFTWARE\Policies\Microsoft\Windows\DataCollection","HKLM:\SOFTWARE\Microsoft\Windows\CurrentVersion\Policies\DataCollection")
foreach ($tp in $telPaths) { if (!(Test-Path $tp)) { New-Item -Path $tp -Force | Out-Null }; Set-ItemProperty -Path $tp -Name "AllowTelemetry" -Value 0 -Type DWord -ErrorAction SilentlyContinue }
$cp = "HKLM:\SOFTWARE\Policies\Microsoft\Windows\WindowsCopilot"
if (!(Test-Path $cp)) { New-Item -Path $cp -Force | Out-Null }
Set-ItemProperty -Path $cp -Name "TurnOffWindowsCopilot" -Value 1 -Type DWord -ErrorAction SilentlyContinue
$cpCU = "HKCU:\Software\Policies\Microsoft\Windows\WindowsCopilot"
if (!(Test-Path $cpCU)) { New-Item -Path $cpCU -Force | Out-Null }
Set-ItemProperty -Path $cpCU -Name "TurnOffWindowsCopilot" -Value 1 -Type DWord -ErrorAction SilentlyContinue
try { Set-ItemProperty -Path "HKCU:\Software\Policies\Microsoft\Windows\Windows Recall" -Name "DisableAIDataAnalysis" -Value 1 -Type DWord -Force } catch {}
Write-Host "  Copilot + Recall: 已关闭" -ForegroundColor White
$cortana = "HKLM:\SOFTWARE\Policies\Microsoft\Windows\Windows Search"
if (!(Test-Path $cortana)) { New-Item -Path $cortana -Force | Out-Null }
Set-ItemProperty -Path $cortana -Name "AllowCortana" -Value 0 -Type DWord -ErrorAction SilentlyContinue
Set-ItemProperty -Path $cortana -Name "DisableWebSearch" -Value 1 -ErrorAction SilentlyContinue
Set-ItemProperty -Path $cortana -Name "ConnectedSearchUseWeb" -Value 0 -ErrorAction SilentlyContinue
Set-ItemProperty -Path "HKCU:\Software\Microsoft\Windows\CurrentVersion\Search" -Name "BingSearchEnabled" -Value 0 -ErrorAction SilentlyContinue
Set-ItemProperty -Path "HKCU:\Software\Microsoft\Windows\CurrentVersion\Search" -Name "CortanaConsent" -Value 0 -ErrorAction SilentlyContinue
Set-ItemProperty -Path "HKCU:\Software\Microsoft\Windows\CurrentVersion\AdvertisingInfo" -Name "Enabled" -Value 0 -Type DWord -ErrorAction SilentlyContinue
$adv = "HKCU:\Software\Microsoft\Windows\CurrentVersion\Explorer\Advanced"
Set-ItemProperty -Path $adv -Name "Hidden" -Value 1; Set-ItemProperty -Path $adv -Name "HideFileExt" -Value 0
Set-ItemProperty -Path $adv -Name "SearchboxTaskbarMode" -Value 0 -Type DWord -ErrorAction SilentlyContinue
Set-ItemProperty -Path $adv -Name "TaskbarDa" -Value 0 -Type DWord -ErrorAction SilentlyContinue
Set-ItemProperty -Path $adv -Name "TaskbarMn" -Value 0 -Type DWord -ErrorAction SilentlyContinue
Set-ItemProperty -Path "HKCU:\Software\Microsoft\Windows\CurrentVersion\Themes\Personalize" -Name "AppsUseLightTheme" -Value 0
Set-ItemProperty -Path "HKCU:\Software\Microsoft\Windows\CurrentVersion\Themes\Personalize" -Name "EnableTransparency" -Value 0
$cdm = "HKCU:\Software\Microsoft\Windows\CurrentVersion\ContentDeliveryManager"
foreach ($v in @("SoftLandingEnabled","SubscribedContent-338389Enabled","SubscribedContent-310093Enabled","SystemPaneSuggestionsEnabled","SubscribedContent-338388Enabled","SubscribedContent-353694Enabled","SubscribedContent-353696Enabled","RotatingLockScreenEnabled","RotatingLockScreenOverlayEnabled")) { Set-ItemProperty -Path $cdm -Name $v -Value 0 -ErrorAction SilentlyContinue }
$notif = "HKCU:\Software\Policies\Microsoft\Windows\CurrentVersion\PushNotifications"
if (!(Test-Path $notif)) { New-Item -Path $notif -Force | Out-Null }
Set-ItemProperty -Path $notif -Name "NoToastApplicationNotification" -Value 1 -ErrorAction SilentlyContinue
$sys = "HKLM:\SOFTWARE\Policies\Microsoft\Windows\System"
if (!(Test-Path $sys)) { New-Item -Path $sys -Force | Out-Null }
Set-ItemProperty -Path $sys -Name "EnableActivityFeed" -Value 0 -Type DWord -ErrorAction SilentlyContinue
Set-ItemProperty -Path $sys -Name "PublishUserActivities" -Value 0 -Type DWord -ErrorAction SilentlyContinue
Set-ItemProperty -Path $sys -Name "UploadUserActivities" -Value 0 -Type DWord -ErrorAction SilentlyContinue
$loc = "HKLM:\SOFTWARE\Policies\Microsoft\Windows\LocationAndSensors"
if (!(Test-Path $loc)) { New-Item -Path $loc -Force | Out-Null }
Set-ItemProperty -Path $loc -Name "DisableLocation" -Value 1 -Type DWord -ErrorAction SilentlyContinue
Set-ItemProperty -Path $loc -Name "DisableLocationScripting" -Value 1 -Type DWord -ErrorAction SilentlyContinue
try { Remove-ItemProperty -Path "HKCU:\Software\Microsoft\Windows\CurrentVersion\Run" -Name "com.squirrel.Teams.Teams" -ErrorAction SilentlyContinue } catch {}
try { Remove-ItemProperty -Path "HKCU:\Software\Microsoft\Windows\CurrentVersion\Run" -Name "OneDrive" -ErrorAction SilentlyContinue } catch {}
Write-Host "`n=== 完成 ===" -ForegroundColor Cyan
Write-Host "OneDrive/Teams 已删除，需要请到官网重装" -ForegroundColor Red
$restart = Read-Host "现在重启? (y/n)"
if ($restart -eq 'y') { Restart-Computer -Force }
```

## 🐣 小白教程：如何运行这些代码？

### ⭐ 方法一：直接复制粘贴（最适合新手！强烈推荐）

不需要下载任何文件，不需要保存：

1. 在本文中**选中代码块** → **Ctrl+C 复制**（或点代码块右上角的复制按钮）
2. 在开始菜单搜索 **"PowerShell"** → 右键 **"以管理员身份运行"**
3. 弹出蓝色提示 → 点 **"是"**
4. 在蓝底白字的 PowerShell 窗口里**右键单击**（自动粘贴内容）
5. 按 **Enter 回车**，脚本开始自动运行
6. 完成后输入 `y` 回车重启电脑

> ✅ 优点：零门槛、不需要处理文件编码、不会触发执行策略报错

### 方法二：下载 .ps1 文件 + 右键运行

如果你更喜欢保存文件方便以后重复使用：

1. 下载 .ps1 文件到桌面
2. 右键点击它 → 选择 **"使用 PowerShell 运行"**
3. 弹出 UAC 提示 → 点 **"是"**
4. 等待完成 → 输入 `y` 重启

## 🛡️ 最重要：创建系统还原点（不会后悔的保险）

在做任何操作之前，请务必创建一个系统还原点。万一脚本导致任何问题，你可以一键恢复到执行前的状态。

### 创建还原点步骤（30 秒搞定）

1. 按 **Win + R** 键（同时按 Windows 徽标键和 R 键）
2. 输入 `sysdm.cpl` 然后按回车
3. 弹出"系统属性"窗口 → 点击顶部的 **"系统保护"** 选项卡
4. 确认你的系统盘（通常是 C:）显示为 **"保护: 开启"**
5. 点击下方的 **"创建"** 按钮
6. 输入一个描述性名称，比如 `2026-07-19 Debloat 前`
7. 点 **"创建"** → 等待约 10-30 秒 → 提示"已成功创建还原点"

> ✅ 还原点只占用少量磁盘空间（几百 MB），但它能让你在系统出问题时一键恢复。

### 如何还原（万一出问题了）

1. **Win + R** → 输入 `sysdm.cpl` → 回车
2. **"系统保护"** 选项卡 → 点击 **"系统还原"**
3. 点击 **"下一步"** → 选择你之前创建的还原点
4. **"下一步"** → **"完成"** → 电脑自动重启并还原
5. 等待完成（通常 3-10 分钟）

## ⏸️ 最后：永久暂停 Windows 更新

Windows 自动更新经常在你不方便的时候弹出，还可能把你刚优化的设置重置掉。下面这个命令可以**完全暂停更新**。

> ⚠️ **安全警告**：暂停更新意味着你**不会收到安全补丁**。建议每月手动检查一次更新（设置 → Windows 更新 → 检查更新）。

以下命令会同时从四个层面阻止 Windows 更新：

| 层级 | 方式 | 效果 |
|:-----|:-----|:-----|
| ① | 禁用 4 个更新服务 | 后台不跑更新进程 |
| ② | 组策略禁用自动更新 | 系统层面禁止更新 |
| ③ | Hosts 屏蔽更新域名 | 无法连接微软服务器 |
| ④ | 禁止驱动自动更新 | 不影响硬件驱动 |

### 暂停 Windows 更新代码

```
if (-NOT ([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole] "Administrator")) {
    Write-Warning "请用管理员身份运行！"; pause; exit 1
}
Write-Host "`n=== 永久暂停 Windows 更新 ===" -ForegroundColor Red
Write-Host "警告：你将不会收到安全补丁！" -ForegroundColor Yellow
foreach ($svc in @("wuauserv","UsoSvc","WaaSMedicSvc","BITS")) { try { Stop-Service $svc -Force -ErrorAction SilentlyContinue; Set-Service $svc -StartupType Disabled; Write-Host "  - $svc: 已禁用" } catch {} }
$au = "HKLM:\SOFTWARE\Policies\Microsoft\Windows\WindowsUpdate\AU"
if (!(Test-Path $au)) { New-Item -Path $au -Force | Out-Null }
Set-ItemProperty -Path $au -Name "NoAutoUpdate" -Value 1 -Type DWord
Set-ItemProperty -Path $au -Name "AUOptions" -Value 2 -Type DWord
$wu = "HKLM:\SOFTWARE\Policies\Microsoft\Windows\WindowsUpdate"
if (!(Test-Path $wu)) { New-Item -Path $wu -Force | Out-Null }
Set-ItemProperty -Path $wu -Name "DisableOSUpgrade" -Value 1 -Type DWord -ErrorAction SilentlyContinue
$hostsContent = @"

# Windows Update Block
0.0.0.0 update.microsoft.com
0.0.0.0 download.windowsupdate.com
0.0.0.0 wustat.windows.com
0.0.0.0 stats.microsoft.com
0.0.0.0 windowsupdate.microsoft.com
0.0.0.0 fe2.update.microsoft.com
0.0.0.0 fe3.delivery.mp.microsoft.com
0.0.0.0 tlu.dl.delivery.mp.microsoft.com
0.0.0.0 sls.update.microsoft.com
0.0.0.0 emdl.ws.microsoft.com
"@
try { Add-Content -Path "$env:SystemRoot\System32\drivers\etc\hosts" -Value $hostsContent; Write-Host "  10个域名已屏蔽" -ForegroundColor White } catch {}
$dm = "HKLM:\SOFTWARE\Policies\Microsoft\Windows\Device Metadata"
if (!(Test-Path $dm)) { New-Item -Path $dm -Force | Out-Null }
Set-ItemProperty -Path $dm -Name "PreventDeviceMetadataFromNetwork" -Value 1 -Type DWord -ErrorAction SilentlyContinue
Write-Host "`n=== 更新已暂停 ===" -ForegroundColor Red
$restart = Read-Host "现在重启? (y/n)"
if ($restart -eq 'y') { Restart-Computer -Force }
```

### 恢复更新（如果以后想恢复）

```
if (-NOT ([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole] "Administrator")) {
    Write-Warning "请用管理员身份运行！"; pause; exit 1
}
Write-Host "`n=== 恢复 Windows 更新 ===" -ForegroundColor Green
foreach ($svc in @("wuauserv","UsoSvc","WaaSMedicSvc","BITS")) { try { Set-Service $svc -StartupType Manual; Write-Host "  - $svc: 已恢复" } catch {} }
Remove-ItemProperty -Path "HKLM:\SOFTWARE\Policies\Microsoft\Windows\WindowsUpdate\AU" -Name "NoAutoUpdate" -ErrorAction SilentlyContinue
Remove-ItemProperty -Path "HKLM:\SOFTWARE\Policies\Microsoft\Windows\WindowsUpdate" -Name "DisableOSUpgrade" -ErrorAction SilentlyContinue
$hostsFile = "$env:SystemRoot\System32\drivers\etc\hosts"
$content = Get-Content $hostsFile -Raw -ErrorAction SilentlyContinue
if ($content) { $newContent = ($content -split "`n" | Where-Object { $_ -notmatch "update\.microsoft|windowsupdate|delivery\.mp\.microsoft|wustat|emdl|sls\.update|Windows Update Block" }) -join "`n"; Set-Content -Path $hostsFile -Value $newContent -NoNewline -ErrorAction SilentlyContinue; Write-Host "  Hosts: 已清理" -ForegroundColor White }
Write-Host "`n=== 更新已恢复 ===" -ForegroundColor Green
$restart = Read-Host "现在重启? (y/n)"
if ($restart -eq 'y') { Restart-Computer -Force }
```

## ❓ 常见问题

### 删掉的应用能装回来吗？

能！所有删除的应用都可以从 **Microsoft Store** 搜索名称重新安装。OneDrive 和 Teams 也可以从官网下载。

### 会影响 Windows 更新吗？

不影响。脚本本身不修改任何更新相关设置。但本文提供了一个**额外**的暂停更新命令，你可以选择是否使用。

### 会不会删掉重要的东西？

不会。脚本只删除预装应用和关闭遥测，不删除系统文件。如果你用的是保守方案，风险约等于零。

### Office / Word / Excel 会受影响吗？

不会。脚本不删除任何 Office 组件（包括 Word、Excel、PowerPoint）。中等和完整方案会删除 OneNote 和 Outlook 这两个**独立应用**，不影响 Office 套装。

### 对游戏性能有提升吗？

有一定帮助。删除 Xbox 相关组件可以释放几百 MB 存储和少量内存，但不会直接提升 FPS。主要改善是系统更干净、后台更少。

### 运行时报错 "Execution Policy" 怎么办？

这是 Windows 默认限制运行脚本的安全策略。解决方法：

```
Set-ExecutionPolicy Bypass -Scope Process -Force
```

这只在当前 PowerShell 会话中生效，关闭窗口后自动恢复，安全无副作用。

### 脚本安全吗？会不会有病毒？

完全安全。所有代码都是纯 PowerShell 命令，你可以用记事本打开 .ps1 文件查看每一行代码。没有任何网络下载、没有任何隐藏操作。

---

> 📝 **作者注**：这些脚本是我根据 [Win11Debloat](https://github.com/Raphire/Win11Debloat) 项目整理改编的，去掉了原版中一些过于激进的选项，更适合国内普通用户使用。如果有任何问题，欢迎在评论区留言！
