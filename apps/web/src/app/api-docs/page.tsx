'use client';

import dynamic from 'next/dynamic';
import 'swagger-ui-react/swagger-ui.css';

// Force dynamic rendering to prevent build-time errors
export const dynamic = 'force-dynamic';

const SwaggerUI = dynamic(() => import('swagger-ui-react'), { ssr: false });

export default function ApiDocsPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">MESSAI API Documentation</h1>
          <p className="text-lg text-gray-600">
            Explore and test the MESSAI API endpoints using our interactive documentation.
          </p>
          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h2 className="font-semibold text-blue-900 mb-2">Getting Started</h2>
            <ul className="space-y-2 text-blue-800">
              <li>• Use the "Authorize" button to add your API key or bearer token</li>
              <li>• Click on any endpoint to view details and try it out</li>
              <li>• All endpoints use versioning (e.g., /api/v1/papers)</li>
              <li>• Rate limits apply based on your authentication tier</li>
            </ul>
          </div>
        </div>
        <div className="swagger-ui-wrapper">
          <SwaggerUI
            url="/api/openapi.json"
            docExpansion="list"
            defaultModelsExpandDepth={1}
            defaultModelExpandDepth={1}
            filter={true}
            showExtensions={true}
            showCommonExtensions={true}
            tryItOutEnabled={true}
            displayOperationId={false}
            displayRequestDuration={true}
            deepLinking={true}
            presets={
              typeof SwaggerUI !== 'undefined' && SwaggerUI.presets ? [SwaggerUI.presets.apis] : []
            }
            plugins={
              typeof SwaggerUI !== 'undefined' && SwaggerUI.plugins
                ? [SwaggerUI.plugins.DownloadUrl]
                : []
            }
          />
        </div>
      </div>
      <style jsx global>{`
        .swagger-ui-wrapper {
          background: white;
          padding: 2rem;
          border-radius: 0.5rem;
          box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
        }
        .swagger-ui .topbar {
          display: none;
        }
        .swagger-ui .info {
          margin-bottom: 2rem;
        }
        .swagger-ui .scheme-container {
          background: #f7fafc;
          padding: 1rem;
          border-radius: 0.375rem;
          margin-bottom: 2rem;
        }
      `}</style>
    </div>
  );
}
