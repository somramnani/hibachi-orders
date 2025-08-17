export async function POST(request) {
  try {
    const body = await request.json();
    const { guestNames, proteins, additionalNotes } = body;

    // Validate required fields
    if (!guestNames || !proteins || proteins.length !== 3) {
      return Response.json(
        { error: 'Guest names and exactly three protein selections are required' },
        { status: 400 }
      );
    }

    // Log the order (for now)
    console.log('New order received:', {
      guestNames,
      proteins,
      additionalNotes,
      timestamp: new Date().toISOString()
    });

    // TODO: Integrate with Google Docs API
    // For now, we'll simulate a successful submission
    
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 1000));

    return Response.json({
      success: true,
      message: 'Order submitted successfully',
      orderId: `ORDER-${Date.now()}`,
      data: {
        guestNames,
        proteins,
        additionalNotes,
        submittedAt: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Error processing order:', error);
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
