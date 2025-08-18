# Hibachi Orders
![React](https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=white)
![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)

A  single-page website for collecting Hibachi orders with a form that can be integrated with Google Docs.

## Features
- Selection with pricing
- Additional notes field
- Real-time price calculation
- Responsive design for all devices
- Form validation
- API endpoint for order processing

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Run the development server:
   ```bash
   npm run dev
   ```

3. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Google Docs Integration

To integrate with Google Docs, you'll need to:

### 1. Set up Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable the Google Docs API
4. Create credentials (Service Account)

### 2. Install Google APIs

```bash
npm install googleapis
```

### 3. Update API Route

Replace the content in `src/app/api/submit-order/route.js` with Google Docs integration:

```javascript
import { google } from 'googleapis';

export async function POST(request) {
  try {
    const body = await request.json();
    const { guestNames, protein, additionalNotes } = body;

    // Validate required fields
    if (!guestNames || !protein) {
      return Response.json(
        { error: 'Guest names and protein selection are required' },
        { status: 400 }
      );
    }

    // Google Docs integration
    const auth = new google.auth.GoogleAuth({
      keyFile: 'path/to/your/service-account-key.json',
      scopes: ['https://www.googleapis.com/auth/documents'],
    });

    const docs = google.docs({ version: 'v1', auth });
    
    // Add order to Google Doc
    const result = await docs.documents.batchUpdate({
      documentId: 'YOUR_GOOGLE_DOC_ID',
      requestBody: {
        requests: [
          {
            insertText: {
              location: {
                index: 1,
              },
              text: `\n${new Date().toLocaleString()}\nGuest: ${guestNames}\nProtein: ${protein}\nNotes: ${additionalNotes || 'None'}\n---\n`,
            },
          },
        ],
      },
    });

    return Response.json({
      success: true,
      message: 'Order submitted successfully',
      orderId: `ORDER-${Date.now()}`,
      data: {
        guestNames,
        protein,
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
```

### 4. Environment Variables

Create a `.env.local` file in your project root:

```env
GOOGLE_DOCS_ID=your_google_document_id_here
```

**Example:** `GOOGLE_DOCS_ID=1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms`

### 5. Google Credentials File

1. **Download your service account key** from Google Cloud Console
2. **Rename it** to `google-credentials.json`
3. **Place it** in `src/app/api/submit-order/`
4. **Ensure it contains** these required fields:
   - `private_key`
   - `client_email`
   - `project_id`
   - `type: "service_account"`

## Technologies Used

- **Next.js 15** - React framework
- **Tailwind CSS** - Utility-first CSS framework
- **React Hooks** - State management
- **Google APIs** - For Google Docs integration

## Deployment

The app can be deployed to Vercel, Netlify, or any other hosting platform that supports Next.js.

## Contributing

Feel free to submit issues and enhancement requests!

## License

MIT License
