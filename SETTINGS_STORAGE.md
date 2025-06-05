# 网站设置存储说明

## 数据存储位置

网站设置数据存储在 **GitHub Issues API** 中，使用一个特殊的 issue 来保存所有配置信息。

### 存储机制

1. **特殊 Issue**: 系统会创建一个标题为 "Site Settings" 的特殊 issue
2. **标签标识**: 该 issue 会被标记为 `site-settings` 标签
3. **JSON 格式**: 所有设置以 JSON 格式存储在 issue 的 body 中
4. **版本控制**: 利用 GitHub 的版本历史功能，可以查看设置的修改历史

### 设置数据结构

\`\`\`json
{
  "siteName": "Modern Blog",
  "siteDescription": "A modern blog website built with Next.js 15",
  "siteKeywords": ["blog", "nextjs", "react"],
  "primaryColor": "#0070f3",
  "accentColor": "#f5a623",
  "logoUrl": "/logo.svg",
  "faviconUrl": "/favicon.ico",
  "socialLinks": {
    "twitter": "https://twitter.com",
    "github": "https://github.com"
  },
  "articlesPerPage": 10,
  "featuredTags": [],
  "showAuthorInfo": true,
  "enableComments": true,
  "defaultMetaImage": "/og-image.png",
  "googleAnalyticsId": "",
  "customCss": "",
  "customHeaderHtml": "",
  "customFooterHtml": ""
}
\`\`\`

## 导入导出功能

### 导出设置
- 点击 "Export JSON" 按钮
- 系统会下载当前设置为 JSON 文件
- 文件名格式: `site-settings-YYYY-MM-DD.json`

### 导入设置
- 点击 "Import JSON" 按钮
- 选择之前导出的 JSON 文件
- 系统会验证文件格式并导入设置
- 导入后需要点击 "Save Settings" 保存

### 备份建议
1. 定期导出设置文件作为备份
2. 在进行重大修改前先导出当前设置
3. 可以为不同环境（开发/生产）维护不同的设置文件

## 缓存机制

- 设置数据会在内存中缓存 5 分钟
- 修改设置后会立即更新缓存
- 重启应用会清空缓存，重新从 GitHub 获取

## 安全性

- 设置数据存储在您的 GitHub 仓库中
- 只有具有仓库写权限的用户才能修改设置
- 管理员登录需要正确的用户名和密码
- 使用 JWT token 进行会话管理
\`\`\`

## 10. 更新 README.md，添加新功能说明：
