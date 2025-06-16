# OmniPanel Documentation 📚

A comprehensive documentation site built with Next.js, MDX, and Tailwind CSS for the OmniPanel AI workspace platform.

## Features

- **📝 MDX Support**: Write documentation with Markdown and React components
- **🎨 Beautiful Design**: Modern, responsive design with dark/light themes
- **🔍 Search**: Full-text search across all documentation
- **📖 Syntax Highlighting**: Code blocks with syntax highlighting and copy buttons
- **🌐 SEO Optimized**: Comprehensive meta tags and Open Graph support
- **♿ Accessible**: WCAG 2.1 compliant with keyboard navigation
- **📱 Mobile First**: Responsive design that works on all devices
- **⚡ Fast**: Optimized for performance with static generation

## Tech Stack

- **Framework**: Next.js 14 with App Router
- **Content**: MDX for rich markdown with React components
- **Styling**: Tailwind CSS with custom design system
- **Typography**: Inter and JetBrains Mono fonts
- **Icons**: Heroicons and Lucide React
- **Theme**: next-themes for dark/light mode
- **Analytics**: Vercel Analytics integration

## Getting Started

### Prerequisites

- Node.js 22+ and npm/yarn
- All dependencies from the main monorepo

### Installation

```bash
cd omnipanel-core/apps/docs
npm install
```

### Development

```bash
# Start development server
npm run dev

# The docs will be available at http://localhost:3003
```

### Building

```bash
# Build for production
npm run build

# Start production server
npm start

# Export static site
npm run export
```

## Project Structure

```
app/
├── page.tsx                # Homepage
├── layout.tsx              # Root layout
├── globals.css             # Global styles
├── getting-started/        # Getting started guides
│   └── page.mdx
├── api/                    # API documentation
│   └── page.mdx
├── llm-adapters/          # LLM adapter docs
├── plugins/               # Plugin development
├── guides/                # Tutorials and guides
└── cli/                   # CLI documentation

components/
├── Header.tsx             # Site header with navigation
├── Footer.tsx             # Site footer
├── SearchButton.tsx       # Search functionality
└── ui/                    # Reusable UI components

content/                   # Markdown content files
├── guides/
├── examples/
└── changelog/

public/                    # Static assets
├── favicon.ico
├── og-image.png
└── manifest.json
```

## Writing Documentation

### Creating New Pages

1. Create a new `.mdx` file in the appropriate directory
2. Add frontmatter for metadata:

```mdx
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Page Title',
  description: 'Page description for SEO',
};

# Page Title

Your content here...
```

### MDX Components

Use React components within your markdown:

```mdx
<div className="callout info">
  **Info**: This is an information callout.
</div>

<div className="grid grid-cols-2 gap-4">
  <div>Column 1</div>
  <div>Column 2</div>
</div>
```

### Code Blocks

Code blocks automatically get syntax highlighting:

````mdx
```typescript
const example = {
  name: 'OmniPanel',
  type: 'AI Workspace'
};
```
````

### Navigation

Update navigation links in:
- `components/Header.tsx` - Main navigation
- `components/Footer.tsx` - Footer navigation
- `app/page.tsx` - Homepage links

## Styling Guidelines

### Design System

The docs use a consistent design system:

- **Colors**: Primary blue palette with semantic colors
- **Typography**: Inter for body text, JetBrains Mono for code
- **Spacing**: Tailwind's spacing scale (4px increments)
- **Borders**: Consistent border radius and colors

### Dark Mode

All components support dark mode via CSS classes:

```css
.bg-white dark:bg-gray-900
.text-gray-900 dark:text-white
.border-gray-200 dark:border-gray-700
```

### Responsive Design

Use Tailwind's responsive prefixes:

```css
.grid-cols-1 md:grid-cols-2 lg:grid-cols-3
.text-sm sm:text-base lg:text-lg
.px-4 sm:px-6 lg:px-8
```

## Search Integration

The search functionality is designed to integrate with:

- **Algolia DocSearch** - For hosted search
- **Local Search** - For self-hosted instances
- **Full-text Search** - Across all MDX content

To implement search:

1. Configure search provider in `components/SearchButton.tsx`
2. Add search indexing for content
3. Style search results modal

## Deployment

### Vercel (Recommended)

1. Connect your GitHub repository to Vercel
2. Set build command: `cd apps/docs && npm run build`
3. Set output directory: `apps/docs/.next`
4. Deploy automatically on push

### Self-Hosted

```bash
# Build the application
npm run build

# Start production server
npm start

# Or export static site
npm run export
```

### Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3003
CMD ["npm", "start"]
```

## Content Management

### Adding New Sections

1. Create directory structure in `app/`
2. Add navigation links in components
3. Create index pages and sub-pages
4. Update sitemap and metadata

### Content Guidelines

- **Clear headings**: Use semantic heading hierarchy
- **Code examples**: Provide working, tested examples
- **Screenshots**: Include relevant UI screenshots
- **Cross-references**: Link between related docs
- **Version info**: Note version requirements

### Maintenance

- **Broken links**: Regular link checking
- **Content freshness**: Keep examples up-to-date
- **User feedback**: Monitor and respond to feedback
- **Analytics**: Track popular content and user flows

## Contributing

1. **Follow the style guide**: Consistent formatting and tone
2. **Test examples**: Ensure all code examples work
3. **Review process**: All changes should be reviewed
4. **Accessibility**: Test with screen readers and keyboard navigation

## Performance

The docs are optimized for performance:

- **Static generation**: Pre-rendered at build time
- **Image optimization**: Next.js automatic image optimization
- **Font optimization**: Optimal font loading strategies
- **Bundle analysis**: Use `npm run analyze` to check bundle size

## Analytics

Track documentation usage with:

- **Page views**: Most popular content
- **Search queries**: What users are looking for
- **User flows**: How users navigate the docs
- **Feedback**: User satisfaction and suggestions

## License

This documentation is part of the OmniPanel project and follows the same license terms.

---

Built with ❤️ by the OmniPanel team 