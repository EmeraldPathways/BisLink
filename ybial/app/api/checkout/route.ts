import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import Stripe from 'stripe'
import { createClient } from '@/lib/supabase/server'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
})

const CheckoutSchema = z.object({
  businessId: z.string().uuid(),
  items: z
    .array(
      z.object({
        productId: z.string().uuid(),
        quantity: z.number().int().min(1).max(10),
      })
    )
    .min(1)
    .max(10),
  customerName: z.string().min(1).max(100),
  customerEmail: z.string().email(),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed = CheckoutSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const { businessId, items, customerName, customerEmail } = parsed.data
    const supabase = createClient()

    // 1. Fetch business
    const { data: business, error: bizError } = await supabase
      .from('businesses')
      .select('id, stripe_account_id, stripe_onboarded')
      .eq('id', businessId)
      .eq('is_active', true)
      .single()

    if (bizError || !business) {
      return NextResponse.json({ error: 'Business not found' }, { status: 404 })
    }
    if (!business.stripe_onboarded || !business.stripe_account_id) {
      return NextResponse.json({ error: 'Business payments not configured' }, { status: 400 })
    }

    // 2. Fetch all products in the cart
    const productIds = items.map((i) => i.productId)
    const { data: products, error: prodError } = await supabase
      .from('products')
      .select('id, name, price, currency, in_stock, is_active, emoji')
      .eq('business_id', businessId)
      .eq('is_active', true)
      .in('id', productIds)

    if (prodError || !products) {
      return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 })
    }

    // 3. Validate every item — exists, active, in stock
    for (const item of items) {
      const product = products.find((p) => p.id === item.productId)
      if (!product) {
        return NextResponse.json(
          { error: `Product not found: ${item.productId}` },
          { status: 404 }
        )
      }
      if (!product.in_stock) {
        return NextResponse.json(
          { error: `${product.name} is out of stock` },
          { status: 409 }
        )
      }
    }

    // 4. Calculate total
    const total = items.reduce((sum, item) => {
      const product = products.find((p) => p.id === item.productId)!
      return sum + product.price * item.quantity
    }, 0)

    // 5. Build line items for metadata
    const lineItemsMeta = items.map((item) => {
      const product = products.find((p) => p.id === item.productId)!
      return {
        productId: product.id,
        name: product.name,
        emoji: product.emoji,
        price: product.price,
        quantity: item.quantity,
      }
    })

    // 6. Create PaymentIntent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: total,
      currency: products[0].currency ?? 'usd',
      automatic_payment_methods: { enabled: true },
      application_fee_amount: 0,
      transfer_data: {
        destination: business.stripe_account_id,
      },
      metadata: {
        type: 'product_order',
        businessId,
        customerName,
        customerEmail,
        lineItems: JSON.stringify(lineItemsMeta),
      },
    })

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      total,
    })
  } catch (err) {
    console.error('[POST /api/checkout]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
