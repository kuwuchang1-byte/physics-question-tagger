# 🎓 物理学习助手

拍题识别 · 知识点标注 · 解题分析 · 苏格拉底对话

基于智谱AI GLM-4-Flash 多模态大模型，支持文字和图片输入，帮助教师和学生快速分析物理题目。

## 功能

| 标签页 | 功能 |
|--------|------|
| 📝 题目标注 | 输入题目（文字或图片），自动标注知识点、子知识点、考查层次、难度、解题思路 |
| 🔍 解题分析 | 分析学生解题过程，定位正误步骤、薄弱知识点，生成学习建议和推荐练习 |
| 💬 对话助手 | 苏格拉底式引导对话，不直接给答案，通过提问激发学生自主思考 |

图片识别基于 GLM-4V-Flash 多模态能力，支持拍照/截图上传后自动提取文字。

## 快速启动

```bash
# 1. 安装依赖
npm install

# 2. 配置 API Key（编辑 .env 文件）
#    免费获取：https://open.bigmodel.cn/usercenter/apikeys
AI_API_KEY=你的Key

# 3. 启动服务
node server.js
```

浏览器访问 `http://localhost:3001`

Windows 用户也可双击 `start.bat` 一键启动。

## 部署到 Vercel（可选）

项目已预配 Vercel 部署文件：

```bash
# 1. 将代码推送到 GitHub 仓库

# 2. 在 Vercel Dashboard（https://vercel.com）中：
#    - 点 Add New → Project
#    - 关联该 GitHub 仓库
#    - Framework Preset 选 Other
#    - 在 Environment Variables 中添加 AI_API_KEY（与 .env 相同）
#    - 点 Deploy

# 3. 部署完成后即可通过 Vercel 域名访问
```

## 使用场景

| 场景 | 用法 |
|------|------|
| **课前备课** | 批量标注手头题目，快速了解知识点覆盖情况，调整教学重点 |
| **课上讲题** | 展示题目考点，帮助学生建立"题目 → 知识点"的映射思维 |
| **课后辅导** | 学生输入错题或上传解题过程，查看对应薄弱知识点和学习建议 |
| **一对一答疑** | 使用苏格拉底对话模式引导学生自主思考，替代直接给答案 |

## 技术栈

- Node.js + Express 5
- 智谱AI GLM-4-Flash / GLM-4V-Flash（免费额度）
- Tailwind CSS（CDN）
- Vercel（可选部署平台）

## 项目结构

```
physics-question-tagger/
├── server.js         # 服务端（API + 静态服务）
├── public/
│   └── index.html   # 前端界面（三个标签页）
├── .env              # API Key 配置（不提交到 Git）
├── .env.example      # 环境变量模板
├── start.bat         # Windows 一键启动
├── vercel.json       # Vercel 部署配置
├── Procfile          # Railway/其他平台部署配置
└── package.json
```
