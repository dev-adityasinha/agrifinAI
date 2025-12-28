const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://hack-bios-agri-fintech-backend.vercel.app/api';

export async function PATCH(request, { params }) {
  try {
    const { productId } = params;
    const body = await request.json();

    const response = await fetch(`${API_BASE_URL}products/${productId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })

    const contentType = response.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) {
      const raw = await response.text();
      throw new Error(`Unexpected response from backend: ${response.status} ${raw.slice(0, 120)}`);
    }

    const data = await response.json();
    return Response.json(data, { status: response.status });
  } catch (error) {
    console.error('Admin product status update error:', error);
    return Response.json(
      {
        success: false,
        message: 'Failed to update product status',
        error: error.message,
      },
      { status: 500 }
    );
  }
}
