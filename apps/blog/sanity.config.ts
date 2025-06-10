// sanity.config.ts
// Sanity Studio configuration for OmniPanel Blog

import { defineConfig } from 'sanity'
import { structureTool } from 'sanity/structure'
import { visionTool } from '@sanity/vision'

// Import schemas
import { schemaTypes } from './studio/schemas'

// Hardcode the project ID for now since environment variables aren't working in Studio
const SANITY_PROJECT_ID = 'o3dbbat3'
const SANITY_DATASET = 'production'

export default defineConfig({
  name: 'omnipanel-blog',
  title: 'OmniPanel Blog',

  projectId: SANITY_PROJECT_ID,
  dataset: SANITY_DATASET,

  plugins: [
    structureTool({
      structure: (S) =>
        S.list()
          .title('Content')
          .items([
            S.listItem()
              .title('Blog Posts')
              .child(
                S.documentTypeList('blogPost')
                  .title('Blog Posts')
                  .filter('_type == "blogPost"')
              ),
            S.listItem()
              .title('Authors')
              .child(
                S.documentTypeList('author')
                  .title('Authors')
                  .filter('_type == "author"')
              ),
            S.listItem()
              .title('Categories')
              .child(
                S.documentTypeList('category')
                  .title('Categories')
                  .filter('_type == "category"')
              ),
            S.divider(),
            ...S.documentTypeListItems().filter(
              (listItem) => !['blogPost', 'author', 'category'].includes(listItem.getId()!)
            ),
          ]),
    }),
    visionTool({
      defaultApiVersion: '2024-01-01',
    }),
  ],

  schema: {
    types: schemaTypes,
  },

  basePath: '/studio',
}) 