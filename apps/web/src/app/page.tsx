import { Button, Card, Badge, Input } from '@messai/ui';

export default function Index() {
  return (
    <div data-testid="test-wrapper" className="space-y-8">
      {/* Hero Section */}
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Welcome to <span className="text-primary-600">MESSAI.AI</span>
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Democratizing Microbial Electrochemical Systems Research Through AI
        </p>
        <div className="flex gap-4 justify-center">
          <Button size="lg">Get Started</Button>
          <Button variant="outline" size="lg">
            Learn More
          </Button>
        </div>
      </div>

      {/* Platform Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="text-center">
          <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-6 h-6 text-primary-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Research Intelligence</h3>
          <p className="text-gray-600 mb-4">
            AI-enhanced analysis of 3,721+ research papers with semantic search and knowledge
            graphs.
          </p>
          <Badge variant="primary">Phase 1</Badge>
        </Card>

        <Card className="text-center">
          <div className="w-12 h-12 bg-secondary-100 rounded-lg flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-6 h-6 text-secondary-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">3D Modeling Lab</h3>
          <p className="text-gray-600 mb-4">
            Interactive Three.js-powered visualization and real-time system modeling.
          </p>
          <Badge variant="secondary">Coming Soon</Badge>
        </Card>

        <Card className="text-center">
          <div className="w-12 h-12 bg-accent-100 rounded-lg flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-6 h-6 text-accent-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">AI Predictions</h3>
          <p className="text-gray-600 mb-4">
            Performance forecasting with confidence scoring and multi-objective optimization.
          </p>
          <Badge variant="warning">In Development</Badge>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <h2 className="text-2xl font-semibold text-gray-900 mb-6">Quick Start</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-3">Search Research Papers</h3>
            <div className="space-y-3">
              <Input
                placeholder="Search 3,721+ enhanced papers..."
                icon={
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                }
              />
              <Button variant="outline" fullWidth>
                Advanced Search
              </Button>
            </div>
          </div>
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-3">System Configuration</h3>
            <div className="space-y-3">
              <Button variant="secondary" fullWidth>
                Browse Parameter Database (1500+)
              </Button>
              <Button variant="ghost" fullWidth>
                Create Custom Configuration
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Design System Preview */}
      <Card>
        <h2 className="text-2xl font-semibold text-gray-900 mb-6">Design System Components</h2>
        <div className="space-y-6">
          {/* Buttons */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-3">Buttons</h3>
            <div className="flex flex-wrap gap-3">
              <Button variant="primary">Primary</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="danger">Danger</Button>
            </div>
          </div>

          {/* Badges */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-3">Status Badges</h3>
            <div className="flex flex-wrap gap-3">
              <Badge variant="primary">Research</Badge>
              <Badge variant="secondary">Biological</Badge>
              <Badge variant="success">Active</Badge>
              <Badge variant="warning">Pending</Badge>
              <Badge variant="error">Failed</Badge>
              <Badge variant="info">Info</Badge>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
