require('dotenv').config();
const express = require('express');
const path = require('path');
const https = require('https');

const app = express();
app.use(express.json({ limit: '10mb' }));
app.use(express.static(path.join(__dirname, 'public')));

const PORT = process.env.PORT || 3001;
const API_KEY = process.env.AI_API_KEY;
if (!API_KEY) { console.error('请设置 AI_API_KEY 环境变量'); process.exit(1); }
const API_HOST = 'open.bigmodel.cn';
const API_PATH = '/api/paas/v4/chat/completions';

// 调用智谱API（文本）
function callGLM(messages, maxTokens = 800, temp = 0.3) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({
      model: 'glm-4-flash',
      messages,
      max_tokens: maxTokens,
      temperature: temp
    });
    const req = https.request({
      hostname: API_HOST, path: API_PATH, method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${API_KEY}` },
      timeout: 30000
    }, res => {
      let body = '';
      res.on('data', c => body += c);
      res.on('end', () => {
        try {
          const r = JSON.parse(body);
          if (r.error) reject(new Error(r.error.message));
          else resolve(r.choices[0].message.content);
        } catch (e) { reject(new Error('parse fail')); }
      });
    });
    req.on('error', e => reject(e));
    req.write(data); req.end();
  });
}

// 调用智谱多模态（图片识别）
function callGLMVision(imageBase64, prompt, maxTokens = 500) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({
      model: 'glm-4v-flash',
      messages: [{
        role: 'user',
        content: [
          { type: 'text', text: prompt },
          { type: 'image_url', image_url: { url: imageBase64 } }
        ]
      }],
      max_tokens: maxTokens,
      temperature: 0.3
    });
    const req = https.request({
      hostname: API_HOST, path: API_PATH, method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${API_KEY}` },
      timeout: 30000
    }, res => {
      let body = '';
      res.on('data', c => body += c);
      res.on('end', () => {
        try {
          const r = JSON.parse(body);
          if (r.error) reject(new Error(r.error.message));
          else resolve(r.choices[0].message.content);
        } catch (e) { reject(new Error('parse fail')); }
      });
    });
    req.on('error', e => reject(e));
    req.write(data); req.end();
  });
}

// ===== API 1: 题目标注（支持文字+图片） =====
app.post('/api/tag', async (req, res) => {
  const { question, imageBase64 } = req.body || {};

  try {
    let qText = question || '';

    // 如果有图片，先用多模态识别
    if (imageBase64) {
      const ocrResult = await callGLMVision(imageBase64,
        '请识别并提取这张图片中的物理题目文字。只返回题目文字，不要额外解释。', 400);
      qText = ocrResult.trim();
    }

    if (!qText) return res.json({ error: '未能识别到题目内容' });

    // 用文本模型标注
    const content = [{ type: 'text', text:
      '你是高中物理题目分析专家。分析以下题目，返回JSON：\n题目：' + qText +
      '\n返回格式:{"知识点":[],"子知识点":[],"考查层次":"记忆/理解/应用/分析/综合","难度":"简单/中等/较难","解题思路":["步骤"],"答案":""}' +
      '\n知识范围:运动学/牛顿力学/动量能量/振动波/电学/热学/光学/原子物理。只返回JSON，不返回markdown。'
    }];
    const text = await callGLM([{ role: 'user', content }], 800);
    const m = text.match(/\{[\s\S]*\}/);
    if (!m) return res.json({ error: '解析失败', raw: text, ocrText: qText });
    res.json({ success: true, ocrText: qText, ...JSON.parse(m[0]) });
  } catch (e) { res.json({ error: e.message }); }
});

// ===== API 2: 解题分析 =====
app.post('/api/analyze', async (req, res) => {
  const { question, studentAnswer, imageBase64 } = req.body || {};

  try {
    let qText = question || '';
    let aText = studentAnswer || '';

    // 如果有图片，识别题目和解题过程
    if (imageBase64) {
      const ocrResult = await callGLMVision(imageBase64,
        '这是学生的物理题目和解题过程图片。请分别提取【题目】和【学生解题过程】。格式：\n【题目】...\n【解题过程】...', 600);
      // 尝试解析
      const qMatch = ocrResult.match(/【题目】([\s\S]*?)(?=【解题过程】|$)/);
      const aMatch = ocrResult.match(/【解题过程】([\s\S]*)/);
      if (qMatch && !qText) qText = qMatch[1].trim();
      if (aMatch && !aText) aText = aMatch[1].trim();
      if (!qMatch && !aMatch) {
        // 如果格式解析失败，整体当题目
        qText = ocrResult.trim();
      }
    }

    if (!qText) return res.json({ error: '未能识别题目' });

    const content = [{ type: 'text', text:
      '分析学生解题：\n【题目】' + qText +
      (aText ? '\n【学生解题过程】' + aText : '（学生未提供解题过程，请仅标注题目）') +
      '\n返回JSON:{"知识点覆盖":[],"正确步骤":[],"错误步骤":[],"薄弱知识点":[],"学习建议":"200字","推荐练习":""}。只返回JSON。'
    }];
    const text = await callGLM([{ role: 'user', content }], 1000);
    const m = text.match(/\{[\s\S]*\}/);
    if (!m) return res.json({ error: '解析失败', raw: text });
    res.json({ success: true, ocrText: qText, ...JSON.parse(m[0]) });
  } catch (e) { res.json({ error: e.message }); }
});

// ===== API 3: 苏格拉底对话 =====
app.post('/api/chat', async (req, res) => {
  const { question, messages } = req.body || {};
  if (!messages || !Array.isArray(messages)) return res.json({ error: '缺少messages' });
  try {
    const sys = { role: 'system', content:
      '你是高中物理苏格拉底导师。纪律严明：1.绝对禁止说出任何公式、数字、结论。你只能说"换个角度想想""你觉得这里的关键是什么"这类话。用户算对了也只能说"你可以自己验证一下"然后给新方向。2.每轮必须有至少一个引导提问。3.末尾必须给延伸思考，标记💡。4.末尾必须有鼓励（试试看/已经很接近了/再想想/这个方向有意思）。5.每次回复必须60-100字，不可超出。6.风格像好奇的朋友聊天。' +
      (question ? '当前题目：' + question : '')
    };
    const llmMessages = [sys, ...messages.slice(-10)];
    const text = await callGLM(llmMessages, 600, 0.7);
    res.json({ success: true, reply: text });
  } catch (e) { res.json({ error: e.message }); }
});

app.listen(PORT, () => console.log('http://localhost:' + PORT));
