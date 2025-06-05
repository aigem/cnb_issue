# 现代博客网站

一个使用 Next.js 15 构建的现代博客网站，通过 Issues API 进行内容管理，支持完整的发布工作流和高度可定制的配置系统。

## 🌟 主要功能

### 📝 内容管理与发布
- **多状态文章管理**: 草稿 → 已发布 → 已归档的完整工作流
- **Issues API 集成**: 使用 GitHub Issues 作为内容管理系统
- **标签分类系统**: 使用 issue 标签进行文章分类和优先级管理
- **评论系统**: 基于 issue 评论的文章评论功能
- **全文搜索**: 支持标题、内容、标签的多维度搜索
- **预览功能**: 草稿和归档文章的安全预览

### ⚙️ 可配置设置系统
- **站点信息**: 自定义站点名称、描述、关键词
- **外观定制**: 主色调、强调色、Logo、Favicon 配置
- **社交媒体**: Twitter、GitHub、LinkedIn、Facebook、Instagram 链接
- **内容设置**: 每页文章数、特色标签、作者信息显示
- **SEO 优化**: Google Analytics、自定义元标签
- **高级定制**: 自定义 CSS、HTML 注入

### 🎨 用户体验
- **响应式设计**: 完美支持桌面和移动设备
- **深色模式**: 系统级主题切换支持
- **阅读体验**: 阅读进度条、目录导航、阅读时间估算
- **性能优化**: 服务端渲染、图片优化、懒加载

## 🚀 快速开始

### 环境要求
- Node.js 18+ 
- npm 或 yarn 或 pnpm

### 安装步骤

1. **克隆项目**
\`\`\`bash
git clone <your-repo-url>
cd modern-blog
\`\`\`

2. **安装依赖**
\`\`\`bash
npm install
# 或
yarn install
# 或
pnpm install
\`\`\`

3. **配置环境变量**
\`\`\`bash
cp .env.example .env.local
\`\`\`

编辑 `.env.local` 文件：
\`\`\`env
# Issues API 配置
NEXT_PUBLIC_API_BASE_URL=https://your-api-domain.com
API_TOKEN=your_api_token
NEXT_PUBLIC_REPO_NAME=your-repo-name

# 可选：Google Analytics
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
\`\`\`

4. **启动开发服务器**
\`\`\`bash
npm run dev
# 或
yarn dev
# 或
pnpm dev
\`\`\`

5. **访问应用**
- 前端网站: http://localhost:3000
- 管理后台: http://localhost:3000/admin
- 设置页面: http://localhost:3000/admin/settings

## 📖 使用指南

### 发布内容

#### 方法一：通过管理后台
1. 访问 `/admin` 进入管理后台
2. 查看草稿文章列表
3. 点击文章标题进入详情页
4. 使用发布控制按钮进行状态管理

#### 方法二：直接在 Issues 中管理
1. 在您的 GitHub 仓库中创建 Issue
2. 使用标签控制文章状态：
   - 无特殊标签 = 已发布
   - `draft` 标签 = 草稿
   - `archived` 标签 = 已归档
3. 使用其他标签进行分类（如 `nextjs`, `react`, `tutorial`）

#### 文章状态说明
- **草稿 (Draft)**: 仅管理员可见，可预览但不公开
- **已发布 (Published)**: 公开可见，出现在文章列表中
- **已归档 (Archived)**: 隐藏状态，仅管理员可访问

### 网站配置

1. **访问设置页面**: `/admin/settings`
2. **配置选项卡**:
   - **常规**: 站点名称、描述、关键词
   - **外观**: 颜色主题、Logo、Favicon
   - **社交媒体**: 各平台链接配置
   - **内容**: 分页设置、特色标签、功能开关
   - **高级**: Analytics、自定义 CSS/HTML

3. **实时预览**: 设置更改立即生效
4. **重置功能**: 一键恢复默认设置

### 主题切换

网站支持三种主题模式：
- **浅色模式**: 明亮的白色背景
- **深色模式**: 深色背景，护眼设计
- **系统模式**: 跟随系统设置自动切换

点击右上角的主题切换按钮进行切换。

## 🛠️ 技术架构

### 前端技术栈
- **Next.js 15**: React 全栈框架，App Router
- **React 19**: 最新的 React 版本
- **TypeScript**: 类型安全的 JavaScript
- **Tailwind CSS**: 实用优先的 CSS 框架
- **shadcn/ui**: 高质量的 React 组件库

### 后端集成
- **Issues API**: 内容管理后端
- **Server Actions**: 服务端数据处理
- **API Routes**: RESTful API 接口
- **Middleware**: 请求处理和路由保护

### 状态管理
- **React Context**: 全局设置状态管理
- **Server Components**: 服务端状态
- **Client Components**: 客户端交互状态

## 📁 项目结构

\`\`\`
├── app/                    # Next.js App Router
│   ├── admin/             # 管理后台页面
│   │   ├── settings/      # 设置页面
│   │   └── page.tsx       # 管理首页
│   ├── api/               # API 路由
│   │   ├── articles/      # 文章相关 API
│   │   ├── settings/      # 设置 API
│   │   └── ...
│   ├── articles/          # 文章页面
│   ├── tags/              # 标签页面
│   └── ...
├── components/            # React 组件
│   ├── ui/               # 基础 UI 组件
│   ├── article-*.tsx     # 文章相关组件
│   ├── settings-*.tsx    # 设置相关组件
│   └── ...
├── contexts/             # React Context
├── lib/                  # 工具库
│   ├── api-unified.ts    # 统一 API 客户端
│   ├── settings-api.ts   # 设置 API
│   └── ...
├── types/                # TypeScript 类型定义
└── ...
\`\`\`

## 🔧 API 接口

### 文章管理
- `GET /api/articles` - 获取文章列表
- `GET /api/articles/[number]` - 获取单篇文章
- `POST /api/articles/[number]/publish` - 发布文章
- `POST /api/articles/[number]/unpublish` - 取消发布
- `POST /api/articles/[number]/archive` - 归档文章

### 设置管理
- `GET /api/settings` - 获取站点设置
- `POST /api/settings` - 保存站点设置

### 其他接口
- `GET /api/tags` - 获取标签列表
- `GET /api/comments` - 获取评论
- `GET /api/health-check` - 健康检查

## 🎨 自定义样式

### CSS 变量
\`\`\`css
:root {
  --primary-color: #0070f3;
  --accent-color: #f5a623;
}
\`\`\`

### 自定义 CSS
在设置页面的"高级"选项卡中添加自定义 CSS：
\`\`\`css
/* 自定义按钮样式 */
.custom-button {
  background: linear-gradient(45deg, var(--primary-color), var(--accent-color));
  border-radius: 8px;
  padding: 12px 24px;
}
\`\`\`

## 🔒 权限管理

### 管理员功能
- 访问管理后台 (`/admin`)
- 修改站点设置 (`/admin/settings`)
- 管理文章状态（发布、归档等）
- 预览草稿和归档文章

### 访客功能
- 浏览已发布文章
- 搜索和筛选内容
- 查看标签分类
- 评论互动（如果启用）

## 📱 移动端支持

- **响应式布局**: 自适应各种屏幕尺寸
- **触摸优化**: 大按钮、易点击的交互元素
- **移动导航**: 折叠式菜单，搜索功能
- **性能优化**: 图片懒加载、代码分割

## 🚀 部署指南

### Vercel 部署（推荐）
1. 连接 GitHub 仓库到 Vercel
2. 配置环境变量
3. 自动部署

### 其他平台
- **Netlify**: 支持 Next.js 部署
- **Railway**: 全栈应用部署
- **Docker**: 容器化部署

### 环境变量配置
确保在部署平台配置以下环境变量：
\`\`\`
NEXT_PUBLIC_API_BASE_URL=your_api_url
API_TOKEN=your_api_token
NEXT_PUBLIC_REPO_NAME=your_repo_name
\`\`\`

## 🐛 故障排除

### 常见问题

**Q: 主题切换不生效？**
A: 检查 ThemeProvider 是否正确配置，确保 `suppressHydrationWarning` 已设置。

**Q: 看不到管理页面？**
A: 确保访问 `/admin` 路径，检查 API_TOKEN 是否正确配置。

**Q: 文章不显示？**
A: 检查 Issues API 配置，确保仓库名称和 API 令牌正确。

**Q: 设置不保存？**
A: 检查浏览器控制台错误，确保 API 路由正常工作。

### 调试工具
- 访问 `/debug` 查看 API 状态
- 检查浏览器开发者工具的网络面板
- 查看服务器日志

## 🤝 贡献指南

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 🙏 致谢

- [Next.js](https://nextjs.org/) - React 全栈框架
- [Tailwind CSS](https://tailwindcss.com/) - CSS 框架
- [shadcn/ui](https://ui.shadcn.com/) - UI 组件库
- [Lucide React](https://lucide.dev/) - 图标库

## 📞 支持

如果您遇到问题或有建议，请：
- 创建 [Issue](https://github.com/your-repo/issues)
- 发送邮件到 your-email@example.com
- 查看 [文档](https://your-docs-url.com)

---

**享受您的现代博客网站！** 🎉
