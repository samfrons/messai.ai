import { NextRequest, NextResponse } from 'next/server';
import { generateSDK } from '../../../../lib/sdk/generator';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const format = searchParams.get('format') || 'typescript';

    if (format !== 'typescript') {
      return NextResponse.json(
        {
          error: 'Invalid format',
          message: 'Only TypeScript SDK is currently supported',
        },
        { status: 400 }
      );
    }

    const sdkFiles = await generateSDK();

    // Return as JSON with file contents
    return NextResponse.json({
      format: 'typescript',
      files: sdkFiles,
      usage: {
        installation: 'npm install @tanstack/react-query',
        example: `
import { MessaiClient } from './messai-sdk/client';

const client = new MessaiClient({
  apiKey: 'your-api-key',
});

// Fetch papers
const papers = await client.getPapers({
  search: 'microbial fuel cell',
  limit: 10,
});

// Or use React hooks
import { usePapers } from './messai-sdk/hooks';

function MyComponent() {
  const { data, isLoading } = usePapers({
    search: 'bioelectrochemistry',
  });
  
  // ...
}
        `.trim(),
      },
    });
  } catch (error) {
    console.error('Error generating SDK:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: 'An error occurred while generating the SDK',
      },
      { status: 500 }
    );
  }
}
