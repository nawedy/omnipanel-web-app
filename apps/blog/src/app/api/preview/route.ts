// src/app/api/preview/route.ts
// Preview mode API for draft content

import { NextRequest, NextResponse } from 'next/server'
import { client } from '@/lib/sanity'
import { groq } from 'next-sanity'

const previewTokenSecret = process.env.SANITY_PREVIEW_SECRET || 'preview-secret'

export async function GET(request: NextRequest): Promise<NextResponse> {
  const { searchParams } = new URL(request.url)
  const token = searchParams.get('token')
  const slug = searchParams.get('slug')

  // Check for valid preview token
  if (token !== previewTokenSecret) {
    return NextResponse.json(
      { message: 'Invalid preview token' },
      { status: 401 }
    )
  }

  // Validate slug parameter
  if (!slug) {
    return NextResponse.json(
      { message: 'Missing slug parameter' },
      { status: 400 }
    )
  }

  try {
    // Fetch the post to validate it exists
    const post = await client.fetch(
      groq`*[_type == "blogPost" && slug.current == $slug][0]`,
      { slug }
    )

    if (!post) {
      return NextResponse.json(
        { message: 'Post not found' },
        { status: 404 }
      )
    }

    // Create response with draft mode enabled
    const response = NextResponse.redirect(
      new URL(`/posts/${slug}`, request.url)
    )

    // Enable draft mode
    response.cookies.set('__prerender_bypass', '', {
      httpOnly: true,
      sameSite: 'none',
      secure: true,
      path: '/',
    })

    response.cookies.set('__next_preview_data', '', {
      httpOnly: true,
      sameSite: 'none', 
      secure: true,
      path: '/',
    })

    return response

  } catch (error) {
    console.error('Preview mode error:', error)
    return NextResponse.json(
      { message: 'Error enabling preview mode' },
      { status: 500 }
    )
  }
}

export async function POST(): Promise<NextResponse> {
  // Disable preview mode
  const response = NextResponse.json({ message: 'Preview mode disabled' })
  
  response.cookies.delete('__prerender_bypass')
  response.cookies.delete('__next_preview_data')
  
  return response
} 