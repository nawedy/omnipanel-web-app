// studio/schemas/index.ts
// Export all schema types for Sanity Studio

import blogPost from './blogPost'
import author from './author'
import category from './category'
import blockContent from './blockContent'

export const schemaTypes = [
  blogPost,
  author,
  category,
  blockContent,
] 