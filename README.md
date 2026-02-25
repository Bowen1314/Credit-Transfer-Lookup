# NJ Transfer Search / 新泽西转学学分查询 🎓

[![English](https://img.shields.io/badge/Language-English-blue?style=flat-square)](#english)
[![简体中文](https://img.shields.io/badge/Language-%E7%AE%80%E4%BD%93%E4%B8%AD%E6%96%87-red?style=flat-square)](#简体中文)

---

<a name="english"></a>
## English

A fast, static web application that allows students to easily find equivalent courses at 19 New Jersey Community Colleges based on Rutgers University course numbers.

🌍 **Live Demo:** [transfer.gotclass.xyz](https://transfer.gotclass.xyz)

### Features
- **Lightning Fast Search:** Real-time search by Rutgers course number, course name, or Community College course code.
- **Auto-Formatting:** Automatically formats Rutgers course numbers (e.g., `01198111` ➜ `01:198:111`).
- **Responsive Design:** Beautiful, mobile-friendly interface designed for phones, tablets, and desktops.
- **Visitor Analytics:** Built-in lightweight, privacy-friendly unique visitor counter.
- **No Database Required:** Pure static frontend HTML/CSS/JS with a tiny Node.js counter proxy.

### Project Structure
- `index.html` - The main user interface.
- `style.css` - Custom design system with CSS variables and responsive media queries.
- `app.js` - Search logic, input normalization, and DOM manipulation.
- `data.js` - Source data containing mapping rules for NJ community colleges.
- `counter.js` - A lightweight Node.js API that tracks unique visitors by IP.

### Deployment (Caddy + Node.js)
This project is designed to be served via Caddy with a tiny Node.js backend for the visitor counter.
1. Serve the static files (`index.html`, `app.js`, etc.) using Caddy.
2. Run `counter.js` with PM2 or systemd on port `3001`.
3. Configure Caddy to reverse proxy `/api/*` to `localhost:3001`.

---

<a name="简体中文"></a>
## 简体中文

这是一个纯静态的前端网页工具，帮助学生通过罗格斯大学 (Rutgers University) 的课程号，快速查找新泽西州 19 所社区大学 (Community Colleges) 中对应的转学分课程。

🌍 **在线预览:** [transfer.gotclass.xyz](https://transfer.gotclass.xyz)

### 项目特色
- **极速搜索:** 支持通过罗格斯大学课程号、课程名称或社区大学课程号进行实时筛选。
- **自动格式化:** 自动将 8 位数字转换为罗格斯的标准课程号格式（例如 `01198111` ➜ `01:198:111`）。
- **响应式设计:** 现代化 UI 界面，完美适配手机、iPad 和电脑端展示。
- **独立访客统计:** 内置了一个轻量级、保护隐私的访客计数器。
- **纯静态架构:** 前端仅使用 HTML/CSS/JS，辅以一个极简的 Node.js 计数器 API，部署成本极低。

### 文件结构
- `index.html` - 主应用界面。
- `style.css` - 全局样式表，包含深色主题和响应式布局。
- `app.js` - 核心逻辑，负责搜索过滤、输入流转和页面渲染。
- `data.js` - 静态数据源，包含转学分映射表。
- `counter.js` - 轻量级 Node.js 服务端，用于根据 IP 进行 UV (独立访客) 统计。

### 部署指南 (Caddy + Node.js)
本项目推荐使用 Caddy 托管静态文件，并反向代理访客计数 API。
1. 使用 Caddy 托管主目录下的静态文件 (`index.html`, `style.css` 等)。
2. 使用 PM2 或 systemd 在后台运行 `counter.js` (默认端口 `3001`)。
3. 在 Caddyfile 中配置反向代理，将 `/api/*` 请求转发至 `localhost:3001`。
