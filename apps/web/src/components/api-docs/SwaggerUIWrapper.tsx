'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import 'swagger-ui-react/swagger-ui.css';

const SwaggerUI = dynamic(() => import('swagger-ui-react'), {
  ssr: false,
  loading: () => <div>Loading API documentation...</div>,
});

export function SwaggerUIWrapper() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return <div>Loading API documentation...</div>;
  }

  return (
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
    />
  );
}
