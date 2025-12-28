const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://hack-bios-agri-fintech-backend.vercel.app/api';

export async function POST(request) {
  try {
    const body = await request.json();
    
    console.log('Register API - Forwarding to:', `${API_BASE_URL}/auth/register`);
    console.log('Register data:', { name: body.name, email: body.email });
    
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();
    console.log('Register response:', data);
    
    return Response.json(data, { status: response.status });
  } catch (error) {
    console.error('Register API error:', error);
    return Response.json(
      { 
        success: false, 
        message: 'Registration failed: ' + error.message 
      },
      { status: 500 }
    );
  }
}
