const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://hack-bios-agri-fintech-backend.vercel.app/api';

export async function GET(request) {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/users`);
    const data = await response.json();
    return Response.json(data);
  } catch (error) {
    console.error('Admin users fetch error:', error);
    return Response.json(
      { 
        success: false, 
        message: 'Failed to fetch users',
        error: error.message 
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    const { userId } = params;
    const response = await fetch(`${API_BASE_URL}/auth/users/${userId}`, {
      method: 'DELETE',
    });
    const data = await response.json();
    return Response.json(data);
  } catch (error) {
    console.error('Admin user delete error:', error);
    return Response.json(
      { 
        success: false, 
        message: 'Failed to delete user',
        error: error.message 
      },
      { status: 500 }
    );
  }
}

export async function PATCH(request, { params }) {
  try {
    const { userId } = params;
    const body = await request.json();
    const response = await fetch(`${API_BASE_URL}/auth/users/${userId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const data = await response.json();
    return Response.json(data);
  } catch (error) {
    console.error('Admin user update error:', error);
    return Response.json(
      { 
        success: false, 
        message: 'Failed to update user',
        error: error.message 
      },
      { status: 500 }
    );
  }
}
