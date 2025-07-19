import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>MESSAI API Documentation</title>
    <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@5.9.0/swagger-ui.css" />
    <style>
        body {
            margin: 0;
            padding: 0;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
        }
        .header {
            background: white;
            padding: 2rem;
            border-bottom: 1px solid #e5e7eb;
        }
        .container {
            max-width: 1200px;
            margin: 0 auto;
        }
        h1 {
            font-size: 2.5rem;
            font-weight: 700;
            color: #111827;
            margin: 0 0 1rem 0;
        }
        .description {
            font-size: 1.125rem;
            color: #6b7280;
            margin-bottom: 1.5rem;
        }
        .info-box {
            background: #eff6ff;
            border: 1px solid #bfdbfe;
            border-radius: 0.5rem;
            padding: 1rem;
            margin-bottom: 2rem;
        }
        .info-box h2 {
            font-size: 1.125rem;
            font-weight: 600;
            color: #1e3a8a;
            margin: 0 0 0.5rem 0;
        }
        .info-box ul {
            margin: 0;
            padding-left: 1.5rem;
            color: #1e40af;
        }
        .info-box li {
            margin: 0.5rem 0;
        }
        #swagger-ui {
            background: white;
            padding: 2rem;
            margin: 2rem auto;
            max-width: 1200px;
            box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
            border-radius: 0.5rem;
        }
        .swagger-ui .topbar {
            display: none;
        }
    </style>
</head>
<body>
    <div class="header">
        <div class="container">
            <h1>MESSAI API Documentation</h1>
            <p class="description">
                Explore and test the MESSAI API endpoints using our interactive documentation.
            </p>
            <div class="info-box">
                <h2>Getting Started</h2>
                <ul>
                    <li>Use the "Authorize" button to add your API key or bearer token</li>
                    <li>Click on any endpoint to view details and try it out</li>
                    <li>All endpoints use versioning (e.g., /api/v1/papers)</li>
                    <li>Rate limits apply based on your authentication tier</li>
                </ul>
            </div>
        </div>
    </div>
    <div id="swagger-ui"></div>
    <script src="https://unpkg.com/swagger-ui-dist@5.9.0/swagger-ui-bundle.js"></script>
    <script src="https://unpkg.com/swagger-ui-dist@5.9.0/swagger-ui-standalone-preset.js"></script>
    <script>
        window.onload = function() {
            window.ui = SwaggerUIBundle({
                url: "/api/openapi.json",
                dom_id: '#swagger-ui',
                deepLinking: true,
                docExpansion: 'list',
                defaultModelsExpandDepth: 1,
                defaultModelExpandDepth: 1,
                filter: true,
                showExtensions: true,
                showCommonExtensions: true,
                tryItOutEnabled: true,
                displayOperationId: false,
                displayRequestDuration: true,
                presets: [
                    SwaggerUIBundle.presets.apis,
                    SwaggerUIStandalonePreset
                ],
                plugins: [
                    SwaggerUIBundle.plugins.DownloadUrl
                ],
                layout: "StandaloneLayout"
            });
        };
    </script>
</body>
</html>
  `;

  return new NextResponse(html, {
    headers: {
      'Content-Type': 'text/html',
    },
  });
}
