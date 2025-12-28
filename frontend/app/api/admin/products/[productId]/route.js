const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://hack-bios-agri-fintech-backend.vercel.app/api';

export async function DELETE(request, context) {
  try {
    const { productId } = await context.params;
    console.log('Deleting product:', productId);
    
    const response = await fetch(`${API_BASE_URL}/products/${productId}`, {
      method: 'DELETE',
    });
    const data = await response.json();
    return Response.json(data);
  } catch (error) {
    console.error('Admin product delete error:', error);
    return Response.json(
      { 
        success: false, 
        message: 'Failed to delete product',
        error: error.message 
      },
      { status: 500 }
    );
  }
}

export async function PATCH(request, context) {
  try {
    const { productId } = await context.params;
    const body = await request.json();
    
    console.log('Updating product status:', productId, body);
    
    const response = await fetch(`${API_BASE_URL}/products/${productId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    
    const data = await response.json();
    console.log('Update response:', data);
    
    return Response.json(data);
  } catch (error) {
    console.error('Admin product update error:', error);
    return Response.json(
      { 
        success: false, 
        message: 'Failed to update product',
        error: error.message 
      },
      { status: 500 }
    );
  }
}
