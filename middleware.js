import { rewrite } from '@vercel/edge';

export const config = {
  // Only intercept the specific known routes
  matcher: ['/', '/about', '/contact', '/privacy']
};

export default function middleware(request) {
  const acceptHeader = request.headers.get('accept') || '';

  // If the request explicitly accepts text/markdown
  if (acceptHeader.toLowerCase().includes('text/markdown')) {
    const url = new URL(request.url);
    
    // Rewrite path to corresponding .md file
    if (url.pathname === '/') {
      url.pathname = '/index.md';
    } else {
      // Remove trailing slash if any, then append .md
      url.pathname = url.pathname.replace(/\/$/, '') + '.md';
    }

    const response = rewrite(url);
    
    // Force the correct content type and vary headers on the rewritten response
    response.headers.set('Content-Type', 'text/markdown; charset=utf-8');
    response.headers.set('Vary', 'Accept');
    
    return response;
  }
}
