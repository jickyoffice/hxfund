# Qwen AI 客户端配置说明

## 设置步骤

1. **安装依赖**：
   ```bash
   npm install
   ```

2. **配置API密钥**：
   - 复制 `.env.example` 文件为 `.env`
   - 在 `.env` 文件中填入您的Qwen API密钥
   ```bash
   QWEN_API_KEY=your_actual_api_key_here
   ```

3. **启动后端服务**：
   ```bash
   npm start
   ```
   
   或者在开发模式下启动（需要先安装nodemon）：
   ```bash
   npm install -g nodemon
   npm run dev
   ```

4. **启动前端服务**：
   在另一个终端窗口中：
   ```bash
   python -m http.server 8080
   ```

5. **访问应用**：
   打开浏览器访问 `http://localhost:8080`

## API配置说明

- 本项目使用OpenAI兼容协议访问Qwen API
- Base URL: `https://coding.dashscope.aliyuncs.com/v1`
- 支持的模型: qwen-max, qwen-plus, qwen-turbo, qwen-mini 等

## 注意事项

- API密钥存储在服务器端的环境变量中，不会暴露给前端，确保安全性
- 前端通过 `/api/qwen` 端点与后端通信
- 后端负责与Qwen API的实际通信
- 使用OpenAI兼容协议，确保与最新API标准兼容

## 故障排除

如果遇到问题：
- 确保API密钥正确填写
- 检查后端服务是否正常运行
- 查看浏览器开发者工具中的网络请求
- 检查后端服务的日志输出