# 现代博客网站

一个使用 Next.js 15 构建的现代博客网站，通过 Issues API 进行内容管理。

## 主要功能及特色

### 内容管理
- 📝 通过 Issues API 管理博客文章
- 🏷️ 使用 issue 标签进行文章分类
- 💬 使用 issue 评论作为文章评论系统
- 🔍 全文搜索和多维度筛选功能
- 🌟 支持文章优先级（P0-P3）标记和筛选
- 👥 支持文章分配者（assignees）显示和筛选

### 用户体验
- 📱 响应式设计，支持深色模式
- ⚡ 使用 Next.js 15 的服务端渲染
- 🎨 使用 Tailwind CSS 和 shadcn/ui 构建美观界面
- 📊 阅读进度指示器
- 📑 文章目录自动生成
- 🕒 显示文章阅读时间估计

### 技术特点
- 🚀 基于 Next.js 15 App Router 架构
- 🔄 React 19 服务端组件和客户端组件混合使用
- 🛡️ TypeScript 类型安全
- 🧩 模块化组件设计
- 🔒 API 路由安全处理
- 🔍 SEO 优化

## Prerequisites

- Node.js 18+ 
- Access to an Issues API endpoint
- API token with appropriate permissions

## Environment Variables

创建 `.env.local` 文件，设置以下环境变量：

\`\`\`env
# 必需：Issues API 基础 URL
NEXT_PUBLIC_API_BASE_URL=https://your-api-domain.com

# 必需：API 认证令牌
API_TOKEN=your_api_token_here

# 可选：仓库名称（默认为 "blog"）
NEXT_PUBLIC_REPO_NAME=your-repo-name
\`\`\`

### API 权限要求

您的 API 令牌需要以下权限：
- `repo-notes:r` - 读取 issues、评论和标签
- `repo-notes:rw` - 创建和更新 issues 和评论（用于管理功能）
- `repo-contents:rw` - 上传文件和图片（可选）

## 安装部署

### 前提条件

- Node.js 18+ 
- 访问 Issues API 的端点
- 具有适当权限的 API 令牌

### 本地开发

1. 克隆仓库
   \`\`\`bash
   git clone https://github.com/yourusername/modern-blog.git
   cd modern-blog
   \`\`\`

2. 安装依赖
   \`\`\`bash
   npm install
   \`\`\`

3. 在 `.env.local` 中设置环境变量

4. 启动开发服务器
   \`\`\`bash
   npm run dev
   \`\`\`

5. 在浏览器中打开 [http://localhost:3000](http://localhost:3000)

## Usage

### Creating Blog Posts

Blog posts are created as Issues in your repository. You can:

1. **Use the Admin Dashboard**: Visit `/admin` to create posts through the web interface
2. **Create Issues directly**: Use your Issues API or interface to create issues that will appear as blog posts

### Content Structure

- **Issue Title** → Blog post title
- **Issue Body** → Blog post content (supports Markdown)
- **Issue Labels** → Blog post tags/categories
- **Issue Comments** → Blog post comments
- **Issue State** → Only "open" issues are displayed as published posts

### Organizing Content

- Use **labels** to categorize your posts (e.g., "tutorial", "nextjs", "react")
- Use **assignees** to indicate post authors
- Use **priority** labels (p0, p1, p2, p3) for featured content
- Close issues to unpublish posts

## API 接口说明

本项目使用 Issues API 进行内容管理，以下是主要使用的 API 端点：

### 文章相关 API

| 端点 | 方法 | 描述 | 权限要求 |
|------|------|------|---------|
| `/{repo}/-/issues` | GET | 获取文章列表 | repo-notes:r |
| `/{repo}/-/issues` | POST | 创建新文章 | repo-notes:rw |
| `/{repo}/-/issues/{number}` | GET | 获取单篇文章详情 | repo-notes:r |
| `/{repo}/-/issues/{number}` | PATCH | 更新文章内容 | repo-notes:rw |

#### 文章列表查询参数

| 参数 | 类型 | 描述 | 示例 |
|------|------|------|------|
| page | integer | 分页页码 | 1 |
| page_size | integer | 每页条数 | 30 |
| state | string | 文章状态 | open, closed |
| keyword | string | 搜索关键词 | nextjs |
| priority | string | 文章优先级 | p0,p1,p2,p3 |
| labels | string | 文章标签 | git,bug,feature |
| authors | string | 作者名称 | 张三,李四 |
| assignees | string | 分配者名称 | 张三,李四,- |
| updated_time_begin | string | 更新时间起始 | 2022-01-31 |
| updated_time_end | string | 更新时间结束 | 2022-01-31 |
| order_by | string | 排序方式 | created_at, -updated_at, reference_count |

### 评论相关 API

| 端点 | 方法 | 描述 | 权限要求 |
|------|------|------|---------|
| `/{repo}/-/issues/{number}/comments` | GET | 获取文章评论 | repo-notes:r |
| `/{repo}/-/issues/{number}/comments` | POST | 创建文章评论 | repo-notes:rw |
| `/{repo}/-/issues/{number}/comments/{comment_id}` | GET | 获取单条评论 | repo-notes:r |
| `/{repo}/-/issues/{number}/comments/{comment_id}` | PATCH | 更新评论内容 | repo-notes:rw |

### 标签相关 API

| 端点 | 方法 | 描述 | 权限要求 |
|------|------|------|---------|
| `/{repo}/-/issues/{number}/labels` | GET | 获取文章标签 | repo-notes:r |
| `/{repo}/-/issues/{number}/labels` | POST | 添加文章标签 | repo-notes:rw |
| `/{repo}/-/issues/{number}/labels` | PUT | 设置文章标签 | repo-notes:rw |
| `/{repo}/-/issues/{number}/labels` | DELETE | 清空文章标签 | repo-notes:rw |

### 分配者相关 API

| 端点 | 方法 | 描述 | 权限要求 |
|------|------|------|---------|
| `/{repo}/-/issues/{number}/assignees` | GET | 获取文章分配者 | repo-notes:r |
| `/{repo}/-/issues/{number}/assignees` | POST | 添加文章分配者 | repo-notes:rw |
| `/{repo}/-/issues/{number}/assignees` | DELETE | 删除文章分配者 | repo-notes:rw |

### 文件上传 API

| 端点 | 方法 | 描述 | 权限要求 |
|------|------|------|---------|
| `/{repo}/-/upload/imgs` | POST | 上传图片 | repo-contents:rw |
| `/{repo}/-/upload/files` | POST | 上传文件 | repo-contents:rw |

## Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Set your environment variables in Vercel dashboard
4. Deploy

### Environment Variables in Production

Make sure to set these in your deployment platform:
- `NEXT_PUBLIC_API_BASE_URL`
- `API_TOKEN`
- `NEXT_PUBLIC_REPO_NAME` (optional)

#### 部署到其他平台

1. 构建项目
   \`\`\`bash
   npm run build
   \`\`\`

2. 启动生产服务器
   \`\`\`bash
   npm start
   \`\`\`

确保在部署平台上设置以下环境变量：
- `NEXT_PUBLIC_API_BASE_URL`
- `API_TOKEN`
- `NEXT_PUBLIC_REPO_NAME`（可选）

## 项目结构

\`\`\`
/
├── app/                    # Next.js App Router 目录
│   ├── api/                # API 路由
│   ├── articles/           # 文章相关页面
│   ├── tags/               # 标签相关页面
│   ├── search/             # 搜索页面
│   ├── about/              # 关于页面
│   ├── admin/              # 管理页面
│   ├── debug/              # 调试页面
│   ├── layout.tsx          # 根布局
│   └── page.tsx            # 首页
├── components/             # React 组件
│   ├── ui/                 # UI 组件（shadcn/ui）
│   ├── article-*.tsx       # 文章相关组件
│   ├── comment-*.tsx       # 评论相关组件
│   └── ...                 # 其他组件
├── lib/                    # 工具函数和 API 客户端
│   ├── api.ts              # 服务端 API 函数
│   └── api-client.ts       # 客户端 API 函数
├── types/                  # TypeScript 类型定义
├── public/                 # 静态资源
└── ...                     # 配置文件
\`\`\`

## Customization

### Styling
- Modify `app/globals.css` for global styles
- Update `tailwind.config.ts` for theme customization
- Edit components in `components/` directory

### Content
- Update site metadata in `app/layout.tsx`
- Modify the homepage content in `app/page.tsx`
- Customize the about page in `app/about/page.tsx`

### Features
- Add new API endpoints in `lib/api.ts`
- Create new pages in the `app/` directory
- Add new components in `components/`

## Troubleshooting

### Common Issues

1. **"API configuration missing" error**
   - Check that `NEXT_PUBLIC_API_BASE_URL` and `API_TOKEN` are set correctly
   - Verify your API token has the required permissions

2. **"Failed to fetch articles" error**
   - Verify your API endpoint is accessible
   - Check that your repository name is correct
   - Ensure your API token is valid and not expired

3. **Empty blog with no posts**
   - Create some issues in your repository
   - Make sure issues are in "open" state
   - Check that your repository name matches `NEXT_PUBLIC_REPO_NAME`

### Debug Mode

Set `NODE_ENV=development` to see detailed error messages in the console.
您也可以访问 `/debug` 页面测试 API 连接。

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT 许可证 - 详见 LICENSE 文件
