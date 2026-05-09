# 物理题目知识点自动标注器

输入一道物理题，自动标注知识点、考查层次和难度。

## 快速启动

```bash
# 安装依赖
npm install

# 配置API Key（编辑.env文件）
# 免费注册：https://open.bigmodel.cn/usercenter/apikeys
AI_API_KEY=你的Key

# 启动
node server.js
```

然后浏览器访问 `http://localhost:3001`

Windows 用户也可以双击 `start.bat` 一键启动。

## 功能

| 场景 | 用法 |
|------|------|
| **课前** | 教师批量标注手头题目，快速了解知识点覆盖情况 |
| **课中** | 讲题时展示考点，帮助建立"题目→知识点"映射 |
| **课后** | 学生输入错题，查看对应薄弱知识点 |

## 技术栈

- Node.js + Express
- 智谱AI GLM-4-Flash（免费）
- 纯HTML/CSS/JS（CDN Tailwind CSS）

## 目录

```
physics-question-tagger/
├── server.js     # 主文件（API + 静态服务）
├── public/
│   └── index.html # 前端界面
├── .env           # API Key配置
└── start.bat      # Windows一键启动
```
