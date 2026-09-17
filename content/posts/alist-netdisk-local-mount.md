---
title: "把 5 个网盘挂成一个本地 Z 盘：AList 部署全记录（含 12 个坑与反思）"
date: 2026-09-17
draft: false
tags: ["AList", "网盘", "rclone", "Windows", "自建服务", "踩坑记录"]
collection: "自建服务"
summary: "用 AList 把百度网盘、两个夸克账号、中国移动云盘、电信天翼云盘聚合成一个站点，再通过 rclone + WinFsp 挂成本地 Z 盘，开机自动挂载、崩溃自动重启。这篇文章完整记录了从服务化、挂载、测速到排查的全过程，并总结了 12 个真实踩过的坑（含一次触发百度风控的事故）和几条方法论反思。"
---

这篇文章是一次完整的实操记录：把 5 个网盘聚合进 AList，再挂成本地磁盘，全程开机自启。里面所有数字都是本机实测，不是抄的文档。

**读完你能得到什么**：一套可直接照抄的部署流程、一张"网盘到底慢在哪"的测速方法、12 个真实踩坑与修法、以及遇到"播放太卡"时的判断思路。

---

## 一、最终成果

| 项目 | 结果 |
|:---|:---|
| 网盘数量 | 5 个（百度 / 夸克 ×2 个账号 / 中国移动云盘 / 电信天翼云盘）|
| 访问方式 | ① 网页 `http://localhost:5244` ② 本地磁盘 `Z:`（只读）|
| 开机自启 | AList 注册为 Windows 服务（延迟自动启动），Z 盘随登录自动挂载 |
| 自愈能力 | 服务崩溃 5 秒后自动拉起；挂载进程退出 20 秒后自动重启 |
| 实测速度 | 139 云盘最高 **33 MB/s**；天翼/夸克/百度受账号级限速（详见第五节）|
| 本地缓存 | 20 GB（D 盘），看过的片段回拖不用重新下载，实测命中 **834 MB/s** |

AList 的存储管理页里，五个网盘的状态全是 `work`：

![AList 存储管理页：五个网盘全部处于 work 状态](/images/alist-storage-panel.png)

整体架构是这样的：

```
                        ┌──────────────────────────┐
   浏览器 / PotPlayer ──▶│  Z: 盘（rclone + WinFsp） │
                        └───────────┬──────────────┘
                                    │ WebDAV
                                    ▼
   ┌────────────────────────────────────────────────┐
   │           AList（Windows 服务，:5244）          │
   └───┬────────┬────────┬─────────┬────────┬───────┘
       ▼        ▼        ▼         ▼        ▼
      百度    夸克①     夸克②    移动云盘   天翼云盘
```

## 二、环境与选型

| 项 | 值 |
|:---|:---|
| 系统 | Windows 11 家庭中文版 25H2（build 26200）|
| 网络 | 兰州电信（宿舍宽带，23:30 断电断网）|
| AList | v3.64.0，装在 `D:\alist\`，端口 5244 |
| 服务托管 | NSSM 2.24 |
| 挂载方案 | rclone v1.75.1 + WinFsp 2025 v2.1 |

**为什么不用"双击 exe 启动"**：手动启动的进程一重启就没了，而且它占用着终端窗口。做成服务后，开机就跑，崩了自动重启，跟系统里的其他服务一样对待。

**为什么不用 Windows 自带的 `sc create` 建服务**：`sc` 建出来的服务工作目录是 `C:\Windows\System32`，而 AList 是按相对路径找 `data\config.json` 的——它会去 System32 底下找配置，找不到就给你生成一套全新的，**所有网盘挂载凭空消失**。这是本机历史上真的发生过的事故。NSSM 可以把"工作目录"显式设定，这是选它的唯一理由，也是最关键的一条。

## 三、第一步：把 AList 装成 Windows 服务

### 3.1 安装 NSSM 并注册服务

```powershell
# 以管理员身份运行 PowerShell
$nssm = 'D:\alist\nssm\nssm-2.24\win64\nssm.exe'

# 注册服务（工作目录必须显式指定！）
& $nssm install AList 'D:\alist\alist.exe' 'server'
& $nssm set AList AppDirectory 'D:\alist'
& $nssm set AList DisplayName 'AList'
& $nssm set AList Start SERVICE_AUTO_START
& $nssm set AList AppExit Default Restart   # 崩溃后自动重启
& $nssm set AList AppRestartDelay 5000      # 5 秒后重启
& $nssm set AList AppStdout 'D:\alist\data\log\service-out.log'
& $nssm set AList AppStderr 'D:\alist\data\log\service-err.log'
& $nssm set AList AppRotateBytes 10485760   # 日志 10 MB 轮转
& $nssm start AList
```

### 3.2 验证（三步都要做）

```powershell
Get-Service AList | Select-Object Name,Status,StartType
Get-Process alist | Select-Object Id,StartTime
netstat -ano | findstr 5244
```

看到 `Running` + `Automatic` + `0.0.0.0:5244 LISTENING`，才算成功。

### 3.3 一个容易忽略的细节：延迟启动

AList 是开机就启动的服务，但**网络（Wi-Fi 关联、DNS）往往比它更晚就绪**。这个时间差会导致部分网盘驱动初始化失败——第六节的第 2 号坑就是这么来的。解决办法：

```powershell
sc config AList start= delayed-auto
```

改成"自动（延迟启动）"后，服务会等系统启动完再跑，网络通常已就绪。

## 四、第二步：把网盘挂进 AList

AList 支持几十种网盘驱动，难点从来不是点网页，而是**凭据类型对不对**。这是本机 5 个网盘的对照表：

| 挂载路径 | 网盘 | 驱动 | 需要的凭据 |
|:---|:---|:---|:---|
| `/baidu` | 百度网盘 | `BaiduNetdisk` | `refresh_token`（OAuth 授权换取，cookie 完全无效）|
| `/quark` | 夸克网盘（账号一）| `Quark` | 浏览器里整串 Cookie |
| `/quark2` | 夸克网盘（账号二）| `Quark` | 浏览器里整串 Cookie |
| `/139yun` | 中国移动云盘 | `139Yun` | `Authorization` 里 `Basic` 之后那串 base64 |
| `/189yun` | 电信天翼云盘 | `189CloudPC` | 手机号 + 密码（客户端驱动）|

几条经验：

- **挂载路径只写英文和数字**，不要写中文、更不要写空格。有人会把"备注"写进路径（比如 `/quark 我的号`），结果是这个路径直接失效，报 `storage not found`。备注请写在"备注"字段里。
- **填占位凭证会真的发一次请求**：像 `FILL_ME` 这种串，AList 在保存时就会拿它去对方服务器试一次登录，可能触发对方风控或锁定。要用户自己填的字段，**先留空**。
- **状态看 `work`**：AList 存储列表里每个存储都有状态字段，`work` 才代表驱动初始化成功。状态里如果是一段报错原文（比如 `dial tcp: lookup xxx: no such host`），说明它初始化失败，界面能点进去但什么都读不出来。

## 五、第三步：先测速，再决定怎么优化（这一节最值钱）

网上关于"AList 慢"的讨论 90% 是瞎猜（改缓存、改并发、换播放器）。正确做法是**先量出来，再决定动手**。

### 5.1 测速方法：限时计数法

不要"下完一个文件算总耗时"——慢盘会把测试卡死。正确做法是：**固定跑 10 秒，数拿到了多少字节**。

```python
# 核心逻辑：固定时间窗口内累计字节数
t0 = time.time(); n = 0
while time.time() - t0 < 10:
    chunk = response.read(65536)
    if not chunk: break
    n += len(chunk)
speed = n / (time.time() - t0) / 1024 / 1024   # MB/s
```

三个维度一起看：

| 维度 | 怎么看 | 说明 |
|:---|:---|:---|
| 单连接速度 | 1 个连接跑 10 秒 | 决定在线播放能不能看 |
| 多连接聚合 | 8 个连接同时跑 | 叠加后几乎不涨 = 服务端按账号限速，客户端无解 |
| 拖动响应 | 请求文件 60% 位置的 64 KB，量首字节时间 | 关系到进度条拖动卡不卡 |

### 5.2 本机实测数据

| 网盘 | 单连接 | 8 连接聚合 | 性质 |
|:---|:---|:---|:---|
| 中国移动云盘（139）| **6 ~ 33 MB/s** | — | 无限速，流畅在线播放 |
| 夸克（非会员）| 0.03 ~ 0.11 MB/s | 0.22 MB/s（约 2 倍）| 账号级限速，**改配置无效** |
| 百度网盘（非会员）| 74 ~ 80 KB/s | 约 105 KB/s | 账号级限速，**改配置无效** |

![各网盘实测下载速度对比（对数刻度）](/images/netdisk-speed-test.jpg)

**结论的判据很硬**：同一时刻、同一套 AList、同一台机器，139 云盘能跑 33 MB/s（约 264 Mbps，跑满宽带），说明 AList 的转发和本机网络都没问题。而慢盘加 8 个连接只涨一倍——这是典型的"服务端令牌桶限速"，客户端做任何事都绕不过去。

### 5.3 顺手排除的两个常见嫌疑

- **代理/梯子**：如果 VPN 开着"全局模式"或 TUN 模式，网盘 CDN 会被绕到国外节点，那才是真的爆慢。本机确认系统代理关闭、FlClash 未运行后才开始测速。
- **AList 自身的限速参数**：全局设置里的 `max_server_download_speed`、`max_client_download_speed` 默认是 `-1`（不限速）。如果被改动过，那就会无差别限速所有盘。

## 六、第四步：挂成本地 Z 盘（rclone + WinFsp）

### 6.1 安装两个组件

国内下载 GitHub Release 经常会卡在 `InternetOpenUrl() failed 0x80072ee7`（winget 也一样），实测加个镜像前缀就能过：

```powershell
# rclone
curl.exe -L -o rclone.zip https://ghproxy.net/https://github.com/rclone/rclone/releases/download/v1.75.1/rclone-v1.75.1-windows-amd64.zip
# WinFsp（rclone 在 Windows 上挂载必须有它）
curl.exe -L -o winfsp.msi https://ghproxy.net/https://github.com/winfsp/winfsp/releases/download/v2.1/winfsp-2.1.25156.msi
```

装之前先验签（安全习惯）：

```powershell
Get-AuthenticodeSignature .\winfsp.msi | Select-Object Status,SignerCertificate
# Status 应为 Valid，签名者是 NAVIMATICS LLC
msiexec /i winfsp.msi /qn /norestart
```

### 6.2 用站点令牌免密码挂载（关键技巧）

一般教程会让你在 rclone 里填 AList 的账号密码。其实不用——AList 的 WebDAV 中间件**直接接受站点令牌**（`Authorization: Bearer <token>`），并且直接按管理员身份放行。

令牌在 AList 数据库 `data/data.db` 的 `x_setting_items` 表里，`key='token'` 那行，形如 `alist-xxxxxxxx`。把它写进 rclone 配置即可：

```ini
[alist]
type = webdav
url = http://127.0.0.1:5244/dav
vendor = other
bearer_token = alist-你的站点令牌
```

> ⚠️ 这个令牌等价于管理员密码，别泄露、别贴进聊天窗口、别提交到 Git。

### 6.3 一个反直觉的发现：WebDAV 根目录列不出网盘

用 `PROPFIND /dav/` 请求根目录（哪怕 `Depth: infinity`），只会返回它自己，一个网盘都看不到；但 `/dav/139yun/` 这种子路径完全正常。也就是说**AList 的 WebDAV 根目录不枚举挂载点**。

解决办法是用 rclone 的 `combine` 后端**拼一个虚拟根**：

```ini
[alist-all]
type = combine
upstreams = "139云盘=alist:/139yun" "天翼云盘=alist:/189yun" "夸克=alist:/quark" "夸克2=alist:/quark2" "百度=alist:/baidu"
```

这样挂出来的 `Z:` 根目录就是 5 个漂亮的中文文件夹。（试过 `union` 后端，它会把 5 个盘的根目录混成一层，重名文件互相打架，不如 `combine`。）

### 6.4 挂载命令

```batch
rclone mount alist-all: Z: ^
  --vfs-cache-mode full ^
  --cache-dir D:\alist\vfs-cache ^
  --vfs-cache-max-size 20G ^
  --vfs-cache-max-age 24h ^
  --dir-cache-time 10m ^
  --buffer-size 64M ^
  --vfs-read-ahead 128M ^
  --read-only ^
  --vfs-disk-space-total-size 30T ^
  --volname AList-Netdisk
```

参数逐个说：

| 参数 | 作用 |
|:---|:---|
| `--vfs-cache-mode full` | 读写都走本地缓存，支持随机读（拖动进度条的前提）|
| `--vfs-read-ahead 128M` | 提前预读 128 MB，播放器体验明显更稳 |
| `--read-only` | **只读挂载**，防止误删网盘文件（网盘删除通常没有回收站）|
| `--vfs-disk-space-total-size 30T` | 伪造显示容量（见 6.6）|
| `--dir-cache-time 10m` | 目录缓存 10 分钟，减少网盘 API 请求 |

### 6.5 开机自启 + 自愈（这一段是整个方案最"工程"的部分）

登录时启动一个隐藏的 VBS，它去跑一个批处理，批处理做三件事然后常驻：

```batch
rem 1) 等网络：能解析网盘域名为止（最多 5 分钟）
:waitnet
ping -n 1 cloud.189.cn >nul 2>&1
if not errorlevel 1 goto netok
...

rem 2) 等 AList 服务响应 + 重新加载所有存储（见第 2 号坑）
curl.exe -s -m 30 -X POST -H "Authorization: %TOK%" http://127.0.0.1:5244/api/admin/storage/load_all

rem 3) 挂载，退出就 20 秒后重来
:loop
rclone mount alist-all: Z: ...
ping -n 21 127.0.0.1 >nul
goto loop
```

为什么要"等网络"和"重新加载存储"？因为 AList 服务是开机启动的，它初始化网盘驱动时网络可能还没就绪——**初始化失败过一次的存储，AList 不会自动重试**，界面看起来正常，实际那个网盘永远是空的。登录时补一次"重新加载"，这个问题就自动消失了（详见坑 #2）。

### 6.6 关于"显示容量"的诚实说明

Windows 里 Z 盘原来显示"1 PB 可用"（rclone 对没有容量信息的云端远程的默认值），看着很假。可以改成任意数字：

```
--vfs-disk-space-total-size 30T     # 显示 30 TB
```

但**"已用"伪造不了**。rclone 只有一个"总容量"开关，Windows 的"已用"是算出来的：

```
已用 = 总容量 - 可用
可用 = 总容量                      （云端不报容量时）
```

所以设了 30T 之后，显示是"30 TB 总容量 / 0 已用 / 30 TB 可用"。想要"已用 15 TB"的效果，只有把 Z 盘换成一层本地 NTFS 虚拟磁盘 + 配额限制这种重方案，纯装饰、代价高，不值得。

## 七、第五步：验证（千万别只看"能不能列目录"）

**最容易骗过自己的验证方式就是"能列出文件"**。缓存会让一个已经死掉的网盘看起来完好无损。正确的验证是**真的读一个文件出来**：

```powershell
# 从每个盘各读 2 KB，读得出来才算通
python -c "open(r'Z:\139云盘\某文件.pdf','rb').read(2048)"

# 或者绕过所有缓存，直连 WebDAV 读
rclone cat alist:/quark/某文件.pdf --count 1
```

本机最终验证结果：

| 盘 | 列目录 | 实际读取 |
|:---|:---|:---|
| 139 云盘 | 15 项 | ✅ 2048 字节 |
| 天翼云盘 | 9 项 | ✅ 2048 字节 |
| 夸克（个人号）| 8 项 | ✅ 2048 字节 |
| 夸克2（影视库）| 28 项 | ✅ 2048 字节 |
| 百度网盘 | 22 项 | ✅ 2048 字节 |

播放性能实测（139 云盘上 2.9 GB 的 2160p 影片，经 Z 盘直读）：

| 场景 | 速度 |
|:---|:---|
| 顺序读取 | 16 MB/s |
| 拖动到 50% 位置 | 1.7 MB/s |
| 拖动到 1 GB 位置 | 7 MB/s |
| 重复读取（命中本地缓存）| **834 MB/s** |

## 八、12 个真实踩过的坑

按踩坑顺序编号，每一条都是"现象 → 根因 → 修法"。

### 坑 1：用 `sc create` 建服务，配置全丢

- **现象**：重启后 AList 变成了全新实例，所有网盘挂载消失。
- **根因**：`sc` 建的服务工作目录是 `C:\Windows\System32`，AList 按相对路径找不到 `data\config.json`，于是重新生成了一套默认配置。
- **修法**：改用 NSSM，显式设置 `AppDirectory`。

### 坑 2：某个网盘永远是空的（"为什么天翼云盘没东西"）

- **现象**：AList 里天翼云盘的存储状态是 `work`，但列目录 500，报 `storage not init: dial tcp: lookup cloud.189.cn: no such host`；Z 盘里那个文件夹是空的。
- **根因**：把报错里 URL 的时间戳换算一下——正好是**开机后 18 秒**。AList 服务开机就起，那时网络还没就绪，天翼驱动初始化时登录失败，**而 AList 对初始化失败过的存储不会自动重试**。（其他网盘驱动初始化时不需要联网，所以躲过了这个时间窗。）
- **修法**（三件套）：
  1. 立刻恢复：`POST /api/admin/storage/load_all`，不用重启服务；
  2. 治本：`sc config AList start= delayed-auto`；
  3. 兜底：登录自启脚本里先等网络、再自动调一次 `load_all`。

### 坑 3：批处理文件必须是 CRLF 换行

- **现象**：`mount-alist.cmd` 里从配置文件读令牌的 `for /f` 语句静默失效，日志里变量是空的，但脚本"看起来"在正常运行。
- **根因**：用工具写出的文件是 LF（Unix）换行。cmd.exe 解析 LF-only 的批处理时，`for /f`、`%变量%` 展开、`if` 块这些结构会**静默出错**——不报错，就是拿不到值。
- **修法**：写完统一转 CRLF，并确认：`file mount-alist.cmd` 输出要包含 `with CRLF line terminators`。

### 坑 4：启动文件夹里的 VBS 点不动（进程挂着但不干活）

- **现象**：验证开机自启时，`Start-Process wscript.exe -ArgumentList '<带空格的路径>'` 之后什么都没发生，日志空白。
- **根因**：PowerShell 的 `-ArgumentList` **不会自动给参数补引号**，路径里的空格把脚本路径切碎了，wscript 弹了个"找不到脚本文件"的模态框——**窗口是隐藏的，进程就一直挂着**，看起来像"没反应"。
- **修法**：用 `Start-Process -FilePath '<vbs路径>'`（走 ShellExecute，系统自己处理引号）；调试脚本时用 `cscript //nologo //B xxx.vbs` 可以在控制台看到真实错误。

### 坑 5：幽灵目录——文件明明在，点开就报错

- **现象**：某个网盘 Cookie 已经失效，但 Z 盘里那个文件夹**仍然显示着 28 个目录、还能一层层展开**；一点开文件就报 `OSError [Errno 22] Invalid argument`。
- **根因**：rclone 的目录缓存 + 本地 VFS 元数据缓存。后端已经不可用了，前端还在拿缓存糊弄你。
- **修法**：**永远别用"列目录"判断存储是否可用**，要真读一个文件，或者直接查 API。另外，重启 rclone 也未必能清干净磁盘上的 VFS 缓存。

### 坑 6：在同一个浏览器里切换网盘账号，旧会话立刻作废

- **现象**：为了拿第二个夸克账号的 Cookie，在同一浏览器里登录了另一个号；结果上一条存储立刻报 `token [st invalid, code:50051]`。
- **根因**：多数网盘在检测到新登录时会**作废旧会话**。你存在 AList 里的那串 Cookie 就是旧会话，当场失效。
- **修法**：取第二个账号的凭据要**换一个浏览器、或同一个浏览器另开一个"配置文件"**，别在同一浏览器里登出登入。

### 坑 7：把"浏览器标识"当成"账号标识"，误判两个号是同一个

- **现象**：两个夸克账号的 Cookie 里 `b-user-id` 完全一样，据此判断"这是同一个账号，纯属重复挂载"。
- **根因**：`b-user-id` 是**浏览器级**的标识，同浏览器下不同账号会拿到同一个值。真正的账号标识是 `__uid`。
- **修法**：判断两个网盘挂载是否同账号，比 `__uid`，再比两边目录内容是否逐项相同。

### 坑 8：把备注写进挂载路径

- **现象**：为了区分两个夸克号，把挂载路径写成了 `/quark 不愿风如初`（带昵称和空格），结果原来的 `/quark` 直接 500：`failed get storage: storage not found; rawPath: /quark`。
- **根因**：路径里的空格让原路径失效，所有依赖旧路径的客户端（包括 Z 盘挂载）一起挂掉。
- **修法**：路径只用英文数字；区分账号用"备注"字段；Z 盘的显示名由 rclone `combine` 的 upstream 名决定，想叫什么叫什么。

### 坑 9：⚠️ 尝试"破解接口"提速，触发了账号风控（本次最严重的事故）

- **动机**：百度非会员只有 74 KB/s，而 AList 的百度驱动提供了三种下载接口（`official` / `crack` / `crack_video`），其中 `crack_video` 走的是客户端/视频接口。
- **过程**：切换后实测**真的跑到了 10.7 MB/s——快了 145 倍**。但几分钟内百度就风控了账号：

  ```
  status: 403  {"error_code":31329,"error_msg":"hit black userlist, hit illeage dlna"}
  ```

  随后这些链接全部 403 或超时。
- **处置**：**立刻改回 `official`**，验证账号恢复正常（列表正常、读取返回 206、速度回到 74 KB/s）。风控只落在 dlna 那类链路上，没有牵连账号本身。
- **教训**：**不要碰会触发风控的"外挂接口"**。风险不是落在这台机器上，是落在你的账号上。任何"能绕过服务商限速"的方案，都要先想清楚：代价是谁承担。

### 坑 10：浏览器播放器"加载很慢"，其实是根本不支持

- **现象**：某些视频在 AList 网页里点开一直转圈，被当成"网络慢"。
- **根因**：挂的影视资源几乎都是 `.mkv`（H.265 + AC3 音轨），**浏览器内置播放器根本不支持这些编码**，跟网速无关。
- **修法**：换本地播放器（PotPlayer / VLC / MPV），通过挂载的 Z 盘直接打开。

### 坑 11：把"卡"当成玄学，而没有翻译成"码率 vs 带宽"

- **现象**：网课播放在线卡顿，反复重连。
- **数据**：AList 日志里播放请求持续了 6 分 19 秒、5 分 45 秒后报 `local proxy error: context canceled`（浏览器等不下去，主动断开）。
- **算账**：那个视频 600 MB、约 45 分钟，码率约 **1.8 Mbps ≈ 需要 225 KB/s**；而百度给 **74 KB/s**。**追不上是数学问题**，不是配置问题。
- **修法**：要么换快的盘，要么先下载再本地看，要么开会员。别再折腾播放器参数了。

### 坑 12：国内下载 GitHub Release 失败

- **现象**：`winget install` 拉 rclone 时失败：`InternetOpenUrl() failed 0x80072ee7`。
- **修法**：给下载地址加镜像前缀（本次用 `https://ghproxy.net/` + 原始地址）实测可用，速度约 0.3 MB/s。二进制一定要先验签名再安装。

## 九、反思

**1. 先测量，再动手。**
这次最有价值的一步不是任何一个配置项，而是"限时计数法测速 + 多连接对比 + 拖动首字节测试"。在拿到数据之前，"AList 慢"是一团迷雾；拿到数据之后，它变成了三行结论：哪个盘快、哪个盘被限速、是不是本机问题。**凡是性能问题，先把"感觉"翻译成数字。**

**2. "看起来正常"是最危险的信号。**
幽灵目录（坑 5）、`work` 状态但实际不可用（坑 2）、静默失效的批处理（坑 3）——三次都是"界面看起来没问题，实际全废"。所以验证必须**打到端到端**：不是"能列出目录"，而是"能把文件的字节读出来"。

**3. 不要为了速度去碰风控接口。**
10.7 MB/s 的诱惑让我试了 `crack_video`，代价是用户的百度账号被标记。就算这次侥幸没被封号，也绝不该用别人的账号去赌。**这类操作在动手前必须先讲清风险并取得同意**，而不是"先试试看效果"。

**4. 伪造的数字要说清边界。**
用户希望 Z 盘显示"30 TB，已用 15 TB"。能做的（改总容量）我做了，做不到的（伪造已用）我说清了原因和替代方案的代价，没有用"看起来能行"的方案糊弄过去。

**5. 自启动脚本必须能自愈。**
开机自启不是"加个快捷方式"就完了。真实的开机顺序里，网络比服务晚、服务比登录晚、网盘驱动可能初始化失败且不会重试。所以自启脚本要写成一个小的状态机：**等网络 → 等服务 → 修状态 → 再挂载 → 崩了重来**。这套逻辑现在跑得很稳，实测断电重启后 50 秒内 Z 盘自动恢复。

**6. 改动要可回滚，危险动作要留退路。**
挂载默认只读（防误删）、配置改动前先备份原值、破坏性操作前先说明——这几点让本次几次"改坏了"都能在 1 分钟内恢复，没有造成不可逆损失。

## 十、速查表（以后直接翻这里）

| 我要做什么 | 怎么做 |
|:---|:---|
| 看 AList 服务状态 | `Get-Service AList` |
| 重启 AList 服务 | 管理员：`sc stop AList` 然后 `sc start AList` |
| 某个网盘空了 | 调一次"全部重新加载"（网页端"存储"页有按钮，或 `POST /api/admin/storage/load_all`）|
| 重启 Z 盘挂载 | 杀掉 rclone 进程，自启脚本会在 20 秒内重新拉起 |
| 看挂载日志 | `D:\alist\data\log\rclone-mount.log` |
| 看 AList 日志 | `D:\alist\data\log\log.log` |
| 看服务日志 | `D:\alist\data\log\service-err.log` |
| 本地缓存占太大 | 清空 `D:\alist\vfs-cache` |
| 想改成可写挂载 | 编辑 `mount-alist.cmd`，删掉 `--read-only` |
| 改显示容量 | `mount-alist.cmd` 里改 `--vfs-disk-space-total-size` |

关键路径：

```
D:\alist\mount-alist.cmd                    挂载命令（要改参数就改这里）
D:\alist\mount-alist.vbs                    隐藏运行上者
启动文件夹\AList-Netdisk-Mount.vbs           开机自启入口（上者的副本）
%APPDATA%\rclone\rclone.conf                rclone 配置（含站点令牌）
D:\alist\data\log\                          全部日志
```

## 十一、还能怎么拓展

### 11.1 让手机、电视也能用

AList 本身就是个 Web 服务，同一个局域网里手机浏览器直接访问 `http://电脑IP:5244` 就能看。更进一步：

- **支持 WebDAV 的播放器**（nPlayer、Infuse、VLC）：填 `http://电脑IP:5244/dav`，用户名填 AList 账号，密码填登录密码（或直接用站点令牌）。
- **电视机顶盒**：装个支持 WebDAV 的文件管理器，或者干脆用 DLNA/投屏。

### 11.2 加新网盘

1. AList 网页 → 存储 → 添加，选驱动；
2. **先看驱动字段说明再填**（AList 有"驱动信息"页会列出每个字段的类型和必填项），别凭印象猜；
3. 凭据类型对照本文第四节——整串 Cookie / refresh_token / Authorization，选错了永远挂不上；
4. 保存后确认状态是 `work`，然后**读一个文件**才算通；
5. 最后把它加进 `rclone.conf` 的 `alist-all` 里，重启挂载。

### 11.3 "卡"到底该怪谁：一张判断表

| 现象 | 大概率原因 | 怎么办 |
|:---|:---|:---|
| 所有盘都慢 | 本机网络 / 代理劫持 | 关掉全局代理，测其他网站速度 |
| 只有某个盘慢，8 连接也不涨 | 账号级限速 | 换盘 / 下载后看 / 会员 |
| 只有某类文件转圈（mkv） | 浏览器不支持该编码 | 用 PotPlayer 等本地播放器 |
| 能播但拖动卡 | 拖动位置首字节慢 | 检查是否支持 Range、开本地缓存 |
| 网盘目录都打不开 | 驱动初始化失败 | 看存储状态里的报错原文、重新加载 |
| 之前能看，现在打不开 | Cookie 过期 / 会话被作废 | 重新取凭据 |

### 11.4 更进阶的方向

- **影视库**：把网盘挂载目录喂给 Emby / Jellyfin，得到一个带海报墙的私人影院（注意：仍然受网盘限速制约，适合放在速度快的盘上）。
- **外网访问**：AList 自带 frp 相关设置，可以用内网穿透把它暴露到公网（**务必配好权限和强密码**，否则等于把网盘挂到公网上）。
- **离线转存**：用 AList 的复制/离线下载任务，把慢盘里的东西后台搬到快盘，夜里挂着跑，第二天就能流畅看。

## 十二、写在最后

这套方案的本质，是**用一层自建服务，把"散落在各个网盘里的文件"重新变成"我电脑上的文件"**。它解决的是体验问题——统一入口、本地化操作、开机即用。

但有一件事它永远解决不了：**服务商的限速**。数据从哪来，速度就由哪个平台决定。这一点上，能做的选择只有三个——换平台、买会员、或者先下载。认清这条边界，比学会任何一个命令都重要。

如果你也在折腾网盘聚合，欢迎在评论区聊聊你踩过的坑。
