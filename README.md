# AI 设计稿生成器

一个基于 AI 的 UI 设计稿生成工具，通过 OpenRouter 统一调用多个 AI 模型。

## 功能特性

- 🎨 **提示词优化** - 使用 Gemini 2.5 Flash 自动优化用户输入为4个专业设计提示词
- 🖼️ **多模型图像生成** - 支持3个高质量图像生成模型：
  - **Gemini 2.5 Flash** - Google Gemini，快速生成，性价比高
  - **Flux.2 Pro** - Black Forest Labs，顶级画质，细节丰富
  - **GPT-5 Image** - OpenAI GPT-5，智能理解，创意生成
- 📱 **多设备适配** - 支持 iPhone、Android、PC 网页设计稿
- 💾 **历史记录** - 自动保存生成历史（最多100条）
- ⭐ **收藏功能** - 收藏喜欢的设计稿

## 技术栈

- React 19 + TypeScript
- Vite 6.0
- TailwindCSS
- OpenRouter API (统一调用多个AI模型)
- Vitest + Testing Library (测试覆盖率 ~90%)

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 配置 API Key

复制环境变量模板：

```bash
cp .env.local.example .env.local
```

编辑 `.env.local` 并填入您的 OpenRouter API Key：

```bash
# 获取API Key: https://openrouter.ai/keys
# 注意: 需要先充值才能使用
VITE_OPENROUTER_API_KEY=your-openrouter-api-key-here

# 可选: 站点URL用于API追踪
VITE_SITE_URL=https://aidesign.app
```

**获取 OpenRouter API Key:**
1. 访问 [OpenRouter](https://openrouter.ai/)
2. 注册/登录账户
3. 进入 [API Keys](https://openrouter.ai/keys) 页面创建密钥
4. **重要**: 需要充值余额才能使用

### 3. 启动开发服务器

```bash
npm run dev
```

### 4. 运行测试

```bash
# 运行所有测试
npm test

# 运行测试并查看覆盖率
npm run test:coverage

# 测试UI模式
npm run test:ui
```

## 使用说明

1. **输入设计需求** - 描述您想要的UI界面
2. **生成布局建议** - AI自动优化为4个不同风格的提示词
3. **选择设备类型** - iPhone / Android / PC
4. **选择生成模型** - 根据需要选择1-3个模型
5. **选择提示词** - 选择喜欢的提示词方案
6. **开始生成** - AI生成设计稿（每个模型生成4张）
7. **查看结果** - 预览、下载、收藏生成的设计稿

## 项目结构

```
aidesign/
├── services/         # AI服务层
│   ├── aiService.ts          # 统一AI接口
│   ├── openRouterService.ts  # OpenRouter API封装
│   └── storageService.ts     # 本地存储
├── components/       # React组件
├── tests/           # 测试文件
│   ├── unit/        # 单元测试
│   └── integration/ # 集成测试
└── README.md
```

## 开发

本项目采用 TDD (测试驱动开发) 流程：

- ✅ **163个测试用例**，100%通过
- ✅ **代码覆盖率 ~90%**
- ✅ **持续集成测试**

## License

MIT
