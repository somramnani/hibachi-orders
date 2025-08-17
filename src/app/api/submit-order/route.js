import { google } from 'googleapis';

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

    try {
      // Check if Google Sheets is configured
      if (!process.env.GOOGLE_SHEETS_ID) {
        console.log('Google Sheets not configured - skipping Google Sheets integration');
        throw new Error('GOOGLE_SHEETS_ID environment variable not set');
      }

      // Try service account first, fallback to OAuth2 if needed
      let auth;
      try {
        auth = new google.auth.GoogleAuth({
          keyFile: 'src/app/api/submit-order/google-credentials.json',
          scopes: ['https://www.googleapis.com/auth/spreadsheets'],
        });
      } catch (authError) {
        console.log('Service account auth failed, trying OAuth2...');
        auth = new google.auth.OAuth2(
          process.env.GOOGLE_CLIENT_ID,
          process.env.GOOGLE_CLIENT_SECRET,
          process.env.GOOGLE_REDIRECT_URI
        );
      }

      const sheets = google.sheets({ version: 'v4', auth });
      
      // Calculate total cost
      const proteinOptions = [
        { value: 'chicken', label: 'Chicken', price: 0 },
        { value: 'shrimp', label: 'Shrimp', price: 0 },
        { value: 'salmon', label: 'Salmon', price: 0 },
        { value: 'steak', label: 'Steak', price: 0 },
        { value: 'scallops', label: 'Scallops', price: 0 },
        { value: 'vegetable', label: 'Vegetable (+tofu)', price: 0 },
        { value: 'filet-mignon', label: 'Filet Mignon (+$5)', price: 5 },
        { value: 'lobster-tail', label: 'Lobster Tail (+$10)', price: 10 }
      ];
      
      const basePrice = 60;
      const selectedProteins = proteinOptions.filter(option => proteins.includes(option.value));
      const totalPrice = basePrice + selectedProteins.reduce((sum, protein) => sum + protein.price, 0);

      // Format data for Google Sheets columns: Name, Protein 1, Protein 2, Protein 3, Notes, Cost
      const rowData = [
        guestNames,
        proteins[0] || '',
        proteins[1] || '',
        proteins[2] || '',
        additionalNotes || '',
        `$${totalPrice}`
      ];

      // Add order to Google Sheets
      const result = await sheets.spreadsheets.values.append({
        spreadsheetId: process.env.GOOGLE_SHEETS_ID,
        range: 'Sheet1!A:F', // Columns A-F for your 6 columns
        valueInputOption: 'USER_ENTERED',
        insertDataOption: 'INSERT_ROWS',
        requestBody: {
          values: [rowData]
        }
      });

      console.log('Order added to Google Sheets successfully');
    } catch (googleError) {
      console.error('Google Sheets error:', googleError.message);
    }

    // Calculate total cost for logging
    const proteinOptions = [
      { value: 'chicken', label: 'Chicken', price: 0 },
      { value: 'shrimp', label: 'Shrimp', price: 0 },
      { value: 'salmon', label: 'Salmon', price: 0 },
      { value: 'steak', label: 'Steak', price: 0 },
      { value: 'scallops', label: 'Scallops', price: 0 },
      { value: 'vegetable', label: 'Vegetable (+tofu)', price: 0 },
      { value: 'filet-mignon', label: 'Filet Mignon (+$5)', price: 5 },
      { value: 'lobster-tail', label: 'Lobster Tail (+$10)', price: 10 }
    ];
    
    const basePrice = 60;
    const selectedProteins = proteinOptions.filter(option => proteins.includes(option.value));
    const totalPrice = basePrice + selectedProteins.reduce((sum, protein) => sum + protein.price, 0);

    console.log('New order received:', {
      guestNames,
      proteins,
      additionalNotes,
      totalCost: `$${totalPrice}`,
      timestamp: new Date().toISOString()
    });

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