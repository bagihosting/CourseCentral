
import { NextResponse } from 'next/server';
import { validateApiKey } from '@/actions/api-keys';

export async function GET(request: Request) {
  const authHeader = request.headers.get('Authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Unauthorized: Missing or invalid API key.' }, { status: 401 });
  }

  const apiKey = authHeader.substring(7); // "Bearer ".length

  const isValid = await validateApiKey(apiKey);

  if (!isValid) {
    return NextResponse.json({ error: 'Unauthorized: Invalid API key.' }, { status: 401 });
  }

  // If the key is valid, proceed with the API logic.
  return NextResponse.json({ 
    message: 'Success! Your API key is valid.',
    data: {
        timestamp: new Date().toISOString(),
        info: 'This is a protected endpoint. You can now build your API logic here.'
    }
  });
}
