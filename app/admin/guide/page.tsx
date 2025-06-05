import type { Metadata } from "next"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, BookOpen, Settings, FileText, Eye } from "lucide-react"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Quick Start Guide",
  description: "Learn how to use your blog website",
  robots: {
    index: false,
  },
}

export default function GuidePage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/admin">
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Admin
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Quick Start Guide</h1>
          <p className="text-muted-foreground">Learn how to manage your blog website</p>
        </div>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              发布内容
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">方法一：通过 Issues 创建</h3>
              <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
                <li>在您的 GitHub 仓库中创建新的 Issue</li>
                <li>标题作为文章标题，内容作为文章正文</li>
                <li>
                  使用标签控制文章状态和分类：
                  <ul className="list-disc list-inside ml-4 mt-1">
                    <li>
                      <code>draft</code> - 草稿状态
                    </li>
                    <li>
                      <code>archived</code> - 归档状态
                    </li>
                    <li>
                      其他标签用于分类（如 <code>nextjs</code>, <code>react</code>）
                    </li>
                  </ul>
                </li>
                <li>打开 Issue = 发布文章，关闭 Issue = 草稿/归档</li>
              </ol>
            </div>

            <div>
              <h3 className="font-semibold mb-2">方法二：通过管理后台</h3>
              <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
                <li>在管理后台查看草稿文章</li>
                <li>点击文章标题进入详情页</li>
                <li>使用发布控制按钮管理文章状态</li>
              </ol>
            </div>

            <div className="flex gap-2">
              <Link href="/admin">
                <Button size="sm">
                  <Eye className="h-4 w-4 mr-2" />
                  查看管理后台
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              网站配置
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">可配置项目</h3>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                <li>
                  <strong>常规设置</strong>：站点名称、描述、关键词
                </li>
                <li>
                  <strong>外观设置</strong>：主色调、强调色、Logo、Favicon
                </li>
                <li>
                  <strong>社交媒体</strong>：Twitter、GitHub、LinkedIn 等链接
                </li>
                <li>
                  <strong>内容设置</strong>：每页文章数、特色标签、功能开关
                </li>
                <li>
                  <strong>高级设置</strong>：Google Analytics、自定义 CSS/HTML
                </li>
              </ul>
            </div>

            <div className="flex gap-2">
              <Link href="/admin/settings">
                <Button size="sm">
                  <Settings className="h-4 w-4 mr-2" />
                  打开设置页面
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              文章状态说明
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              <div className="flex items-start gap-3">
                <div className="w-3 h-3 rounded-full bg-green-500 mt-1"></div>
                <div>
                  <h4 className="font-semibold">已发布 (Published)</h4>
                  <p className="text-sm text-muted-foreground">公开可见，出现在文章列表和搜索结果中</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-3 h-3 rounded-full bg-yellow-500 mt-1"></div>
                <div>
                  <h4 className="font-semibold">草稿 (Draft)</h4>
                  <p className="text-sm text-muted-foreground">仅管理员可见，可以预览但不公开显示</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-3 h-3 rounded-full bg-gray-500 mt-1"></div>
                <div>
                  <h4 className="font-semibold">已归档 (Archived)</h4>
                  <p className="text-sm text-muted-foreground">隐藏状态，仅管理员可以访问和管理</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
