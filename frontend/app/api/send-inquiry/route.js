import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const data = await request.json();
    const { name, email, phone, quantity, message, product } = data;

    console.log('📧 Inquiry received:', { name, email, product: product.name });

    // Simple validation
    if (!name || !email || !phone || !message || !product) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Store inquiry data
    const inquiryData = {
      timestamp: new Date().toISOString(),
      customerName: name,
      customerEmail: email,
      customerPhone: phone,
      quantity: quantity || 'Not specified',
      message,
      product: {
        name: product.name,
        category: product.category,
        origin: product.origin,
        price: product.price
      }
    };

    console.log('✅ Inquiry logged:', inquiryData);
    
    // Return success response
    return NextResponse.json({ 
      success: true, 
      message: `Thank you ${name}! Your inquiry has been received. The farmer will contact you at ${phone} or ${email} within 24 hours.`,
      inquiryId: Date.now().toString(36)
    });

  } catch (error) {
    console.error('❌ Inquiry processing error:', error.message);
    
    return NextResponse.json(
      { 
        error: 'Failed to process inquiry', 
        details: error.message
      },
      { status: 500 }
    );
  }
}
