import { NextRequest } from 'next/server';
import { getRateLimitInfo } from '../../../../middleware/rate-limit';

export async function GET(request: NextRequest) {
  return getRateLimitInfo(request);
}
