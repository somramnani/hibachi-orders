import { google } from 'googleapis';

export async function POST(request) {
  try {
    const body = await request.json();
    const { guestName, proteins, additionalNotes } = body;

    if (!guestName || !proteins || proteins.length !== 3) {
      return Response.json(
        { error: 'Guest name and exactly three protein selections are required' },
        { status: 400 }
      );
    }

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
    const selectedProteinObjects = proteins
      .map((value) => proteinOptions.find((option) => option.value === value))
      .filter(Boolean);
    const totalPrice = basePrice + selectedProteinObjects.reduce((sum, protein) => sum + protein.price, 0);

    try {
      if (!process.env.GOOGLE_SHEETS_ID) {
        console.log('Google Sheets not configured - skipping Google Sheets integration');
        throw new Error('GOOGLE_SHEETS_ID environment variable not set');
      }

        let privateKey = process.env.GOOGLE_PRIVATE_KEY;
        if (privateKey) {
          privateKey = privateKey.replace(/^["']|["']$/g, '').replace(/\\n/g, '\n');
        }

        const auth = new google.auth.GoogleAuth({
          credentials: {
            type: 'service_account',
            project_id: process.env.GOOGLE_PROJECT_ID,
            private_key: privateKey,
            client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
          },
          scopes: ['https://www.googleapis.com/auth/spreadsheets'],
        });

      const sheets = google.sheets({ version: 'v4', auth });
  
      const rowData = [
        guestName,
        proteins[0] || '',
        proteins[1] || '',
        proteins[2] || '',
        additionalNotes || '',
        `$${totalPrice}`
      ];

     
        const currentData = await sheets.spreadsheets.values.get({
          spreadsheetId: process.env.GOOGLE_SHEETS_ID,
          range: 'Sheet1!A:A', 
        });


        const nextRow = (currentData.data.values?.length || 0) + 1;
        const range = `Sheet1!A${nextRow}:F${nextRow}`;

        // Add order to Google Sheets at the next empty row
        const result = await sheets.spreadsheets.values.update({
          spreadsheetId: process.env.GOOGLE_SHEETS_ID,
          range: range,
          valueInputOption: 'USER_ENTERED',
          requestBody: {
            values: [rowData]
          }
        });

      console.log('Order added to Google Sheets successfully');
    } catch (googleError) {
      console.error('Google Sheets error:', googleError.message);
    }



    console.log('New order received:', {
      guestName,
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
        guestName,
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