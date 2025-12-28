const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://hack-bios-agri-fintech-backend.vercel.app/api';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    
    let url = `${API_BASE_URL}/products`;
    if (status && status !== 'all') {
      url += `?status=${status}`;
    }

    const response = await fetch(url);
    const data = await response.json();

    return Response.json(data);
  } catch (error) {
    console.error('Admin products fetch error:', error);
    return Response.json(
      { 
        success: false, 
        message: 'Failed to fetch products',
        error: error.message 
      },
      { status: 500 }
    );
  }
}
