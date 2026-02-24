const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// 中间件
app.use(cors());
app.use(bodyParser.json());

// 提供静态文件
app.use(express.static('.'));

// Qwen API 代理端点
app.post('/api/qwen', async (req, res) => {
  try {
    const { prompt, model = 'qwen-turbo', temperature = 0.7, hasImage = false, image, imageType } = req.body;

    // 从环境变量获取API密钥
    const apiKey = process.env.QWEN_API_KEY;

    if (!apiKey) {
      return res.status(500).json({ error: '服务器未配置API密钥' });
    }

    const url = 'https://coding.dashscope.aliyuncs.com/v1/chat/completions';  // OpenAI兼容协议

    // 根据是否有图片构建消息内容
    let messageContent;
    if (hasImage && image) {
      // 多模态消息格式
      messageContent = [
        {
          type: "text",
          text: prompt
        },
        {
          type: "image_url",
          image_url: {
            url: `data:${imageType};base64,${image}`
          }
        }
      ];
    } else {
      // 纯文本消息
      messageContent = [
        {
          type: "text",
          text: prompt
        }
      ];
    }

    const requestBody = {
      model: model,
      messages: [
        {
          role: "system",
          content: "你是通义千问，由通义实验室研发的超大规模语言模型。你专注于提供关于黄氏家族寻根、族谱、历史文化方面的专业信息。"
        },
        {
          role: "user",
          content: messageContent
        }
      ],
      temperature: temperature
    };

    const apiResponse = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    if (!apiResponse.ok) {
      const errorData = await apiResponse.json();
      throw new Error(errorData.message || `API请求失败: ${apiResponse.status}`);
    }

    const data = await apiResponse.json();

    if (data.choices && data.choices.length > 0) {
      res.json({ response: data.choices[0].message.content });
    } else {
      throw new Error('API返回格式异常');
    }
  } catch (error) {
    console.error('API调用错误:', error);
    res.status(500).json({ error: `API调用失败: ${error.message}` });
  }
});

app.listen(PORT, () => {
  console.log(`服务器运行在 http://localhost:${PORT}`);
});