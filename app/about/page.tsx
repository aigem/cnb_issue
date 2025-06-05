import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "About",
  description: "Learn more about our blog and team",
}

export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <h1 className="text-3xl font-bold mb-8">About</h1>

      <div className="prose prose-lg dark:prose-invert max-w-none">
        <p>
          Welcome to our modern blog built with Next.js 15! This platform showcases the latest features and capabilities
          of Next.js, including Server Components, React Server Actions, and the App Router.
        </p>

        <h2>Our Mission</h2>
        <p>
          Our mission is to provide high-quality content on web development, programming, and technology. We aim to
          create a community where developers can learn, share, and grow together.
        </p>

        <h2>Technology Stack</h2>
        <p>This blog is built with the following technologies:</p>
        <ul>
          <li>Next.js 15 with App Router</li>
          <li>React 19 with Server Components</li>
          <li>Tailwind CSS for styling</li>
          <li>shadcn/ui for UI components</li>
          <li>Issues API for content management</li>
        </ul>

        <h2>Features</h2>
        <p>Our blog includes the following features:</p>
        <ul>
          <li>Responsive design for all devices</li>
          <li>Dark mode support</li>
          <li>Article search and filtering</li>
          <li>Tag-based navigation</li>
          <li>Comment system</li>
          <li>Reading progress indicator</li>
          <li>Table of contents for articles</li>
          <li>SEO optimizations</li>
        </ul>

        <h2>Contact</h2>
        <p>
          If you have any questions or feedback, please feel free to reach out to us at{" "}
          <a href="mailto:contact@example.com">contact@example.com</a>.
        </p>
      </div>
    </div>
  )
}
