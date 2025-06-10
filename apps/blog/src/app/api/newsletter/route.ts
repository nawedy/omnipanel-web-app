// src/app/api/newsletter/route.ts
// Newsletter signup API with NeonDB marketing integration

import { NextRequest, NextResponse } from 'next/server'
import { neon } from '@neondatabase/serverless'

const sql = neon(process.env.NEON_DATABASE_URL!)

interface NewsletterSignupRequest {
  email: string
  source: string
  campaignId?: string
  utmSource?: string
  utmMedium?: string
  utmCampaign?: string
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body: NewsletterSignupRequest = await request.json()
    const { email, source, campaignId, utmSource, utmMedium, utmCampaign } = body

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!email || !emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Valid email address is required' },
        { status: 400 }
      )
    }

    // Check if email already exists
    const existingLead = await sql`
      SELECT id FROM leads 
      WHERE email = ${email}
    `

    let leadId: string

    if (existingLead.length > 0) {
      // Update existing lead
      leadId = existingLead[0].id
      await sql`
        UPDATE leads 
        SET 
          newsletter_subscribed = true,
          updated_at = NOW()
        WHERE id = ${leadId}
      `
    } else {
      // Create new lead
      const newLead = await sql`
        INSERT INTO leads (
          email, 
          source, 
          newsletter_subscribed,
          created_at,
          updated_at
        ) 
        VALUES (
          ${email}, 
          ${source || 'blog'}, 
          true,
          NOW(),
          NOW()
        )
        RETURNING id
      `
      leadId = newLead[0].id
    }

    // Track newsletter signup event
    await sql`
      INSERT INTO events (
        lead_id,
        event_type,
        event_data,
        utm_source,
        utm_medium,
        utm_campaign,
        created_at
      ) VALUES (
        ${leadId},
        'newsletter_signup',
        ${JSON.stringify({
          source,
          campaignId: campaignId || 'blog-newsletter',
          userAgent: request.headers.get('user-agent'),
          ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip')
        })},
        ${utmSource || 'blog'},
        ${utmMedium || 'newsletter'},
        ${utmCampaign || 'general'},
        NOW()
      )
    `

    // If campaign ID provided, track campaign interaction
    if (campaignId) {
      await sql`
        INSERT INTO campaign_interactions (
          lead_id,
          campaign_id,
          interaction_type,
          interaction_data,
          created_at
        ) VALUES (
          ${leadId},
          ${campaignId},
          'newsletter_signup',
          ${JSON.stringify({
            source,
            email,
            utmSource,
            utmMedium,
            utmCampaign
          })},
          NOW()
        )
        ON CONFLICT (lead_id, campaign_id, interaction_type) 
        DO UPDATE SET 
          interaction_data = EXCLUDED.interaction_data,
          created_at = NOW()
      `
    }

    return NextResponse.json(
      { 
        success: true, 
        message: 'Successfully subscribed to newsletter',
        leadId 
      },
      { status: 200 }
    )

  } catch (error) {
    console.error('Newsletter signup error:', error)
    
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: 'Failed to process newsletter signup' 
      },
      { status: 500 }
    )
  }
}

export async function OPTIONS(): Promise<NextResponse> {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  })
} 