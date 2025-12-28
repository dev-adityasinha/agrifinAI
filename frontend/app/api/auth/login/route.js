const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://hack-bios-agri-fintech-backend.vercel.app/api';

export async function POST(request) {
  try {
    const body = await request.json();
    
    console.log('Login API - Forwarding to:', `${API_BASE_URL}/auth/login`);
    console.log('Login email:', body.email);
    
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();
    console.log('Login response:', data.success ? 'Success' : data.message);
    
    return Response.json(data, { status: response.status });
  } catch (error) {
    console.error('Login API error:', error);
    return Response.json(
      { 
        success: false, 
        message: 'Login failed: ' + error.message 
      },
      { status: 500 }
    );
  }
}
