# Web Application Environment Variables - ML Service Enabled
# Copy this file to .env.local to enable ML predictions

# Application
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=MESSAI.AI
NEXT_PUBLIC_APP_VERSION=0.1.0

# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:3000/api
NEXT_PUBLIC_WS_URL=ws://localhost:3000

# Feature Flags (client-side)
NEXT_PUBLIC_ENABLE_3D_VIEWER=true
NEXT_PUBLIC_ENABLE_EXPERIMENTS=true
NEXT_PUBLIC_ENABLE_COLLABORATION=true
NEXT_PUBLIC_ENABLE_AI_CHAT=false

# ML Service Configuration - ENABLED
NEXT_PUBLIC_USE_ML_SERVICE=true
NEXT_PUBLIC_ML_SERVICE_URL=http://localhost:8001
ML_SERVICE_URL=http://localhost:8001

# Materials Project API (optional - enhances predictions)
MATERIALS_PROJECT_API_KEY=

# Analytics (client-side)
NEXT_PUBLIC_GA_MEASUREMENT_ID=
NEXT_PUBLIC_MIXPANEL_TOKEN=

# Sentry (client-side)
NEXT_PUBLIC_SENTRY_DSN=

# Third-party Services
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=

# Development Tools
NEXT_PUBLIC_ENABLE_DEBUG=true
NEXT_PUBLIC_ENABLE_MOCK_API=false