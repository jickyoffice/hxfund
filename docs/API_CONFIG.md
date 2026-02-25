# Qwen AI 功能配置说明

要使用Qwen AI功能，您需要：

1. 从阿里云DashScope获取API密钥：
   - 访问 https://dashscope.console.aliyun.com/
   - 注册并登录账户
   - 在控制台中找到API密钥管理
   - 创建一个新的API密钥

2. 将API密钥添加到环境变量：
   - 编辑项目根目录下的 `.env` 文件
   - 将 `QWEN_API_KEY=` 后面填入您的API密钥
   - 例如：`QWEN_API_KEY=your_actual_api_key_here`

3. 重启后端服务使配置生效：
   - 停止当前运行的服务（Ctrl+C）
   - 重新运行 `node server.js`

4. 启动前端服务：
   - 在另一个终端窗口运行 `python -m http.server 8080`

5. 访问 `http://localhost:8080` 并点击导航栏中的 "Qwen AI" 选项开始使用

注意：请妥善保管您的API密钥，不要将其泄露给他人。