"use client"

interface MarkdownPreviewProps {
  content: string
}

export default function MarkdownPreview({ content }: MarkdownPreviewProps) {
  const parseMarkdown = (text: string) => {
    let html = text

    // Headers
    html = html.replace(/^### (.*?)$/gm, '<h3 style="font-size: 1rem; font-weight: 600; margin: 0.5rem 0;">$1</h3>')
    html = html.replace(/^## (.*?)$/gm, '<h2 style="font-size: 1.25rem; font-weight: 700; margin: 0.5rem 0;">$1</h2>')
    html = html.replace(/^# (.*?)$/gm, '<h1 style="font-size: 1.5rem; font-weight: 700; margin: 0.5rem 0;">$1</h1>')

    // Bold
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong style="font-weight: 600;">$1</strong>')

    // Italic
    html = html.replace(/\*(.*?)\*/g, '<em style="font-style: italic;">$1</em>')

    // Links
    html = html.replace(
      /\[(.*?)\]$$(.*?)$$/g,
      '<a href="$2" style="color: var(--color-primary); text-decoration: underline;" target="_blank">$1</a>',
    )

    // Inline code
    html = html.replace(
      /`(.*?)`/g,
      '<code style="background-color: var(--color-input); padding: 0.125rem 0.25rem; border-radius: 0.25rem; font-family: monospace;">$1</code>',
    )

    // Line breaks for paragraphs
    html = html
      .split("\n\n")
      .map((para) => `<p style="margin: 0.5rem 0; line-height: 1.5;">${para}</p>`)
      .join("")

    // Bullet lists
    html = html.replace(/- (.*?)(?=<\/p>)/g, '<li style="margin-left: 1.25rem;">$1</li>')
    html = html.replace(/(<li.*?<\/li>)/gs, '<ul style="list-style-type: disc; margin: 0.5rem 0;">$1</ul>')

    return html
  }

  return (
    <div
      className="text-sm text-foreground prose prose-invert prose-sm max-w-none"
      dangerouslySetInnerHTML={{ __html: parseMarkdown(content) }}
    />
  )
}
