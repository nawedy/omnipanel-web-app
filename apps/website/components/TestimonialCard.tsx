'use client';

import { motion } from 'framer-motion';
import { StarIcon } from '@heroicons/react/24/solid';

interface Testimonial {
  content: string;
  author: string;
  role: string;
  avatar: string;
  rating: number;
}

interface TestimonialCardProps {
  testimonial: Testimonial;
  index: number;
  inView: boolean;
}

export function TestimonialCard({ testimonial, index, inView }: TestimonialCardProps): JSX.Element {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="testimonial-card"
    >
      <div className="flex items-center space-x-1 mb-4">
        {[...Array(testimonial.rating)].map((_, i) => (
          <StarIcon key={i} className="h-4 w-4 text-yellow-400" />
        ))}
      </div>
      <blockquote className="text-gray-900 dark:text-white">
        <p>"{testimonial.content}"</p>
      </blockquote>
      <figcaption className="mt-6 flex items-center gap-x-4">
        <img
          className="h-10 w-10 rounded-full bg-gray-50"
          src={testimonial.avatar}
          alt=""
        />
        <div>
          <div className="font-semibold text-gray-900 dark:text-white">{testimonial.author}</div>
          <div className="text-gray-600 dark:text-gray-300">{testimonial.role}</div>
        </div>
      </figcaption>
    </motion.div>
  );
} 