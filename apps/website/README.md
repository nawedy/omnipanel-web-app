# OmniPanel AI - Official Website

🚀 **The future of AI-powered productivity is here.**

This is the official website for OmniPanel AI - a revolutionary platform that transforms how you interact with artificial intelligence. Built with cutting-edge technology and designed for seamless user experience.

## 🌟 Features

- **Modern Next.js Architecture** - Built with Next.js 15+ and React 19
- **Beautiful UI Components** - Powered by Tailwind CSS and Radix UI
- **Performance Optimized** - Turbopack, code splitting, and optimized assets
- **SEO Ready** - Built-in SEO optimization and meta management
- **Responsive Design** - Mobile-first approach with stunning animations
- **TypeScript** - Fully typed for better development experience

## 🛠️ Tech Stack

- **Frontend**: Next.js 15+, React 19, TypeScript
- **Styling**: Tailwind CSS, Framer Motion, Magic UI
- **Components**: Radix UI, Lucide React Icons
- **Development**: Turbopack, ESLint, Prettier
- **Deployment**: Vercel (Auto-deployment enabled)

## 🚀 Quick Start

### Prerequisites

- Node.js 22+ 
- pnpm 8+

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/nawedy/omnipanel-website-0620.git
   cd omnipanel-website-0620
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Start development server**
   ```bash
   pnpm dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:3004`

### Build for Production

```bash
# Build the application
pnpm build

# Start production server
pnpm start
```

## 📁 Project Structure

```
omnipanel-website/
├── app/                    # Next.js App Router
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Homepage
│   └── sections/          # Page sections
├── components/            # Reusable UI components
│   ├── ui/               # Base UI components
│   ├── magicui/          # Magic UI components
│   └── layout/           # Layout components
├── assets/               # Static assets
│   ├── icons/           # Icon files
│   ├── videos/          # Video assets
│   └── section-images/  # Section images
├── lib/                 # Utilities and configs
├── data/               # Static data
└── packages/           # Local packages
    └── theme-engine/   # Custom theme engine
```

## 🎨 Theme System

This website uses a custom theme engine (`@omnipanel/theme-engine`) that provides:

- **Dynamic Theme Switching** - Light/Dark mode support
- **Custom Color Palettes** - Brand-consistent color system
- **Component Theming** - Consistent styling across components
- **CSS Variables** - Dynamic theme customization

## 🚀 Deployment

### Automatic Deployment

This repository is configured for automatic deployment on Vercel:

- **Production**: Deploys automatically on push to `main` branch
- **Preview**: Deploys automatically on pull requests
- **Custom Domain**: Configure in Vercel dashboard

### Manual Deployment

```bash
# Deploy to Vercel
pnpm deploy:vercel

# Deploy preview
pnpm deploy:preview
```

## 📝 Development

### Available Scripts

- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm start` - Start production server
- `pnpm lint` - Run ESLint
- `pnpm lint:fix` - Fix ESLint issues
- `pnpm type-check` - Run TypeScript checks
- `pnpm test` - Run tests

### Code Quality

- **TypeScript Strict Mode** - Full type safety
- **ESLint Configuration** - Code quality enforcement
- **Prettier Integration** - Consistent code formatting
- **Pre-commit Hooks** - Automated quality checks

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow TypeScript strict mode
- Use conventional commit messages
- Write tests for new features
- Update documentation as needed

## 📄 License

This project is private and proprietary. All rights reserved.

## 🔗 Links

- **Website**: [https://omnipanel.ai](https://omnipanel.ai)
- **Documentation**: [Coming Soon]
- **Support**: [Coming Soon]

## 🆘 Support

For support and questions:

- Create an issue in this repository
- Contact our development team
- Check the documentation

---

**Built with ❤️ by the OmniPanel AI Team**

*Transforming AI interaction, one feature at a time.* 