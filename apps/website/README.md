# OmniPanel Website

The official marketing website for OmniPanel AI Workspace, built with Next.js 14, TypeScript, and Tailwind CSS.

## 🚀 Features

- **Modern Design**: Beautiful, responsive design with dark/light mode support
- **Performance Optimized**: Next.js 14 with App Router, image optimization, and bundle analysis
- **SEO Ready**: Comprehensive meta tags, structured data, and sitemap generation
- **Animations**: Smooth animations with Framer Motion
- **Forms**: Contact forms with validation using React Hook Form and Zod
- **Analytics**: Built-in analytics with Vercel Analytics
- **Accessibility**: WCAG compliant with proper ARIA labels and keyboard navigation

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **Forms**: React Hook Form + Zod
- **Icons**: Heroicons + Lucide React
- **Analytics**: Vercel Analytics
- **Deployment**: Vercel (recommended)

## 📁 Project Structure

```
apps/website/
├── app/                    # Next.js App Router pages
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Homepage
├── components/            # Reusable components
│   ├── Header.tsx         # Navigation header
│   ├── Footer.tsx         # Site footer
│   ├── FeatureCard.tsx    # Feature showcase cards
│   ├── TestimonialCard.tsx # Customer testimonials
│   ├── VideoModal.tsx     # Demo video modal
│   ├── NewsletterSignup.tsx # Email subscription
│   └── PricingCard.tsx    # Pricing plan cards
├── lib/                   # Utility functions
├── public/               # Static assets
├── next.config.js        # Next.js configuration
├── tailwind.config.js    # Tailwind CSS configuration
├── tsconfig.json         # TypeScript configuration
└── package.json          # Dependencies and scripts
```

## 🚦 Getting Started

### Prerequisites

- Node.js 22+ 
- npm 8+

### Installation

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Start development server**:
   ```bash
   npm run dev
   ```

3. **Open in browser**:
   Navigate to [http://localhost:3004](http://localhost:3004)

### Available Scripts

- `npm run dev` - Start development server on port 3004
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint errors
- `npm run type-check` - Run TypeScript type checking
- `npm run analyze` - Analyze bundle size
- `npm run export` - Export static site

## 🎨 Customization

### Design System

The website uses a comprehensive design system defined in `tailwind.config.js`:

- **Colors**: Primary, secondary, accent, and semantic colors
- **Typography**: Inter font family with custom font weights
- **Spacing**: Consistent spacing scale
- **Animations**: Custom animations and transitions

### Components

All components are built with:
- TypeScript for type safety
- Tailwind CSS for styling
- Framer Motion for animations
- Responsive design principles
- Dark mode support

### Content Management

- **Static Content**: Edit directly in component files
- **SEO Metadata**: Configure in `app/layout.tsx`
- **Navigation**: Update in `components/Header.tsx`
- **Footer Links**: Modify in `components/Footer.tsx`

## 🔧 Configuration

### Environment Variables

Create a `.env.local` file:

```env
# Analytics
NEXT_PUBLIC_VERCEL_ANALYTICS_ID=your_analytics_id

# Newsletter API
NEWSLETTER_API_KEY=your_api_key
NEWSLETTER_API_URL=your_api_url

# Contact Form
CONTACT_FORM_API_KEY=your_api_key
```

### SEO Configuration

Update SEO settings in `app/layout.tsx`:

```typescript
export const metadata: Metadata = {
  title: 'Your Title',
  description: 'Your Description',
  // ... other metadata
};
```

## 📱 Responsive Design

The website is fully responsive with breakpoints:

- **Mobile**: 320px - 767px
- **Tablet**: 768px - 1023px  
- **Desktop**: 1024px+

## 🎯 Performance

- **Lighthouse Score**: 95+ across all metrics
- **Core Web Vitals**: Optimized for LCP, FID, and CLS
- **Bundle Size**: Optimized with code splitting and tree shaking
- **Images**: Next.js Image component with WebP/AVIF support

## 🚀 Deployment

### Vercel (Recommended)

1. **Connect repository** to Vercel
2. **Configure build settings**:
   - Build Command: `npm run build`
   - Output Directory: `.next`
   - Install Command: `npm install`

3. **Set environment variables** in Vercel dashboard

### Other Platforms

The website can be deployed to any platform supporting Node.js:

- **Netlify**: Use `npm run build && npm run export`
- **AWS Amplify**: Standard Next.js deployment
- **Docker**: Use provided Dockerfile

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage
```

## 📊 Analytics

The website includes:

- **Vercel Analytics**: Page views and performance metrics
- **Google Analytics**: User behavior tracking (optional)
- **Custom Events**: Form submissions, video plays, etc.

## 🔒 Security

- **Content Security Policy**: Configured in `next.config.js`
- **HTTPS**: Enforced in production
- **Form Validation**: Client and server-side validation
- **Rate Limiting**: API route protection

## 🤝 Contributing

1. **Fork the repository**
2. **Create feature branch**: `git checkout -b feature/amazing-feature`
3. **Commit changes**: `git commit -m 'Add amazing feature'`
4. **Push to branch**: `git push origin feature/amazing-feature`
5. **Open Pull Request**

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](../../LICENSE) file for details.

## 🆘 Support

- **Documentation**: [docs.omnipanel.ai](https://docs.omnipanel.ai)
- **Issues**: [GitHub Issues](https://github.com/omnipanel/omnipanel/issues)
- **Discord**: [Join our community](https://discord.gg/omnipanel)
- **Email**: support@omnipanel.ai

---

Built with ❤️ by the OmniPanel team 