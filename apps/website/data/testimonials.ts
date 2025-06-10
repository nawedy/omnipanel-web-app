// Strictly typed testimonial data for homepage integration
import type { Testimonial } from '@/components/TestimonialCard';

export const testimonials: Testimonial[] = [
  {
    content: 'OmniPanel has revolutionized our workflow. The multi-model chat and code features are unmatched!',
    author: 'Jane Doe',
    role: 'Lead Developer, Acme Corp',
    avatar: '/avatars/jane.jpg',
    rating: 5,
  },
  {
    content: 'The best AI workspace I have used. Love the extensibility and design.',
    author: 'John Smith',
    role: 'AI Researcher',
    avatar: '/avatars/john.jpg',
    rating: 5,
  },
  {
    content: 'Seamless integration of chat, code, and automation. Highly recommended for teams!',
    author: 'Emily Chen',
    role: 'Product Manager',
    avatar: '/avatars/emily.jpg',
    rating: 4,
  },
];
