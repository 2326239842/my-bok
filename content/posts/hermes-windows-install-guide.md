---
title: "Hermes Agent Windows 安装指南：从踩坑到跑通的完整记录"
date: 2026-06-12
tags: ["Hermes", "Windows", "AI Agent", "安装教程", "Python"]
summary: "记录在 Windows 11 上安装 Hermes Agent 的全过程，包括前置条件、Python 版本踩坑、环境变量配置、Web UI 搭建，以及实际使用中的问题解决方案。"
---

## 为什么选择 Hermes

Hermes Agent 是 Nous Research 开源的 AI Agent 框架，支持多平台消息网关（Telegram、飞书、Discord 等）、多模型切换（DeepSeek、小米 MiMo、NVIDIA 等）、持久化记忆和技能系统。简单说，它让你的 AI 能跨平台记住你、帮你干活。

本文记录在 Windows 11 上从零搭建 Hermes 的完整过程，包括所有踩过的坑。

## 前置条件

| 项目 | 要求 | 说明 |
|------|------|------|
| 操作系统 | Windows 10/11 | 需要 Git Bash 或 WSL |
| Python | **3.11 ~ 3.13**（必须） | Python 3.14+ 会导致依赖冲突 |
| Node.js | 18+ | 用于 Web UI 和 PM2 |
| Git | 2.x | 用于克隆仓库 |
| 包管理器 | pip | Python 包安装 |

### ⚠️ Python 版本是最常见的坑

Hermes 依赖 pydantic_core，而 pydantic_core 目前**不支持 Python 3.14**。如果你的系统同时装了 3.14 和 3.13，必须明确指定用 3.13：

```powershell
# 检查当前 Python 版本
python --version

# 如果显示 3.14，需要安装 3.13
winget install Python.Python.3.13

# 用 py launcher 指定版本安装
py -3.13 -m pip install git+https://github.com/NousResearch/hermes-agent.git
```

**不要用 `pip install hermes-cli`**——PyPI 上那个包是别人发布的旧版本（v0.0.1.4），和 NousResearch 的 Hermes 完全无关。

## 安装步骤

### 1. 克隆仓库

```bash
git clone https://github.com/NousResearch/hermes-agent.git
cd hermes-agent
```

如果 GitHub 端口 22 被封（国内常见），用 HTTPS 而不是 SSH：

```bash
# SSH 会报错 "Connection refused"
git clone git@github.com:NousResearch/hermes-agent.git  # ❌

# HTTPS 正常工作
git clone https://github.com/NousResearch/hermes-agent.git  # ✅
```

### 2. 安装依赖

```powershell
py -3.13 -m pip install -e .
```

如果遇到网络问题，可以用清华镜像：

```powershell
py -3.13 -m pip install -e . -i https://pypi.tuna.tsinghua.edu.cn/simple
```

### 3. 配置模型

Hermes 支持多个 LLM 提供商。在 `~/.hermes/.env` 中设置 API Key：

```env
DEEPSEEK_API_KEY=sk-...
XIAOMI_API_KEY=tp-...
NVIDIA_API_KEY=nvapi-...
```

然后设置默认模型：

```bash
# 正确写法（用 dict 格式）
hermes config set model.default mimo-v2.5
hermes config set model.provider xiaomi

# ❌ 错误写法（会破坏 provider 路由）
hermes config set model mimo-v2.5
```

**为什么不能直接 `hermes config set model xxx`？** 因为这会把 model 设置成纯字符串，Hermes 无法正确路由到对应的 provider，导致请求跑到 OpenRouter 然后报 402 错误。

### 4. 验证安装

```bash
hermes doctor
```

应该看到类似输出：

```
✓ DeepSeek (key configured)
✓ xiaomi (key configured)
✓ NVIDIA NIM (key configured)
```

## Windows 特有问题

### SSL 证书验证失败

Windows 上 Node.js 可能报 `unable to verify the first certificate`。解决方案：

```javascript
// 在脚本开头添加
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
```

或者设置系统环境变量：

```powershell
set NODE_TLS_REJECT_UNAUTHORIZED=0
```

### 编码问题

Windows 中文系统的默认编码是 GBK，而 Hermes 输出 UTF-8。如果看到乱码：

```powershell
# 设置终端编码为 UTF-8
chcp 65001
```

### .bat 文件编码

如果你写批处理脚本，**文件内容必须是纯 ASCII**。中文字符在 .bat 文件中会导致乱码。解决方案是写两个文件：

1. `run.bat`（纯 ASCII）——调用 PowerShell 脚本
2. `run.ps1`（UTF-8）——实际逻辑

### 进程管理

Linux 用 systemd 管理进程，Windows 没有。推荐用 **PM2**：

```bash
# 安装 PM2
npm install -g pm2

# 启动 Hermes gateway
pm2 start "hermes gateway run" --name hermes-gateway

# 开机自启
pm2 save
pm2 startup
```

## Web UI 搭建

Hermes 有一个 Web 界面（Hermes Studio），用于可视化管理对话、技能和配置。

### Python 版本不匹配问题

Web UI 的 Python bridge 进程需要和 Hermes 使用同一个 Python 版本。如果系统有多个 Python，需要设置环境变量：

```powershell
# 设置系统环境变量
setx HERMES_AGENT_BRIDGE_PYTHON "D:\path\to\python3.13.exe"
setx HERMES_AGENT_ROOT "D:\path\to\Lib\site-packages"
```

这样 Web UI 会用 Python 3.13 而不是系统默认的 3.14。

### 启动 Web UI

```bash
hermes-web-ui
```

访问 `http://localhost:8648` 即可。

## 实际使用中的问题

### 技能太多导致响应慢

Hermes 的技能系统很强大，但每个启用的技能都会增加系统提示词的 token 数。如果你启用了 100+ 个技能，系统提示词可能达到 50-80K tokens，加上对话历史，总输入可能超过 100K，导致每次 API 调用需要 20-110 秒。

**解决方案**：禁用不常用的技能：

```yaml
# ~/.hermes/config.yaml
skills:
  disabled:
    - marketing/instagram-curator
    - marketing/tiktok-strategist
    # ... 其他不常用的技能
```

### Provider 选择建议

| 场景 | 推荐 Provider | 原因 |
|------|--------------|------|
| 日常对话 | 小米 MiMo v2.5 | 性价比高，中文好 |
| 复杂推理 | DeepSeek V4 Pro | 推理能力强 |
| 速度优先 | DeepSeek V4 Flash | 响应最快（3-5 秒） |
| 免费额度 | OpenRouter :free 模型 | 无需付费 |

## 总结

在 Windows 上安装 Hermes 的核心要点：

1. **Python 版本必须是 3.11-3.13**，3.14 不兼容
2. **不要用 PyPI 上的 hermes-cli**，从 GitHub 克隆安装
3. **model 配置用 dict 格式**，不要用纯字符串
4. **Windows 用 PM2 管理进程**，替代 systemd
5. **技能太多会拖慢响应**，定期清理不常用的技能

Hermes 的跨平台记忆和技能系统确实很强大，一旦配置好，它会成为你真正的 AI 助手。
