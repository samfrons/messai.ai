'use client';

import { Button, Card, Badge } from '@messai/ui';
import { useState, useEffect } from 'react';
import Hero3DViewer from './components/Hero3DViewer';
import StatisticsCounter from './components/StatisticsCounter';
import PersonaSection from './components/PersonaSection';
import ProcessStep from './components/ProcessStep';

export default function HomePage() {
  const [isVisible, setIsVisible] = useState({
    hero: true,
    stats: false,
    features: false,
    researchers: false,
    students: false,
    engineers: false,
    process: false,
    cta: false,
  });

  useEffect(() => {
    const handleScroll = () => {
      const sections = [
        { id: 'stats', offset: 0.2 },
        { id: 'features', offset: 0.3 },
        { id: 'researchers', offset: 0.4 },
        { id: 'students', offset: 0.5 },
        { id: 'engineers', offset: 0.6 },
        { id: 'process', offset: 0.7 },
        { id: 'cta', offset: 0.8 },
      ];

      sections.forEach(({ id, offset }) => {
        const element = document.getElementById(id);
        if (element) {
          const rect = element.getBoundingClientRect();
          const windowHeight = window.innerHeight;
          if (rect.top < windowHeight * 0.8) {
            setIsVisible((prev) => ({ ...prev, [id]: true }));
          }
        }
      });
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const statistics = [
    { value: 3721, label: 'Research Papers Enhanced', suffix: '+' },
    { value: 1500, label: 'MESS Parameters', suffix: '+' },
    { value: 1200, label: 'Knowledge Graph Nodes', suffix: '+' },
    { value: 4, label: 'Original MESS Models', suffix: '' },
  ];

  const features = [
    {
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
      ),
      title: 'Research Intelligence',
      description:
        'AI-enhanced analysis of research papers with semantic search and knowledge graphs',
      status: 'Live',
      statusVariant: 'default' as const,
    },
    {
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"
          />
        </svg>
      ),
      title: '3D Modeling Lab',
      description: 'Interactive Three.js-powered visualization and real-time system modeling',
      status: 'Beta',
      statusVariant: 'outline' as const,
    },
    {
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
          />
        </svg>
      ),
      title: 'AI Predictions',
      description:
        'Performance forecasting with confidence scoring and multi-objective optimization',
      status: 'Coming Soon',
      statusVariant: 'ghost' as const,
    },
    {
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
          />
        </svg>
      ),
      title: 'Parameter Database',
      description: 'Comprehensive library of materials, microbes, and system configurations',
      status: 'Live',
      statusVariant: 'default' as const,
    },
  ];

  const processSteps = [
    {
      number: '01',
      title: 'Search & Discover',
      description:
        'Explore 3,721+ enhanced research papers and 1,500+ parameters with AI-powered search',
      icon: (
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      ),
    },
    {
      number: '02',
      title: 'Design & Model',
      description: 'Configure your MESS using our 3D modeling lab with real-time visualization',
      icon: (
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"
          />
        </svg>
      ),
    },
    {
      number: '03',
      title: 'Predict & Optimize',
      description: 'Get AI-driven performance predictions and optimization recommendations',
      icon: (
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
          />
        </svg>
      ),
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="min-h-screen flex items-center relative">
        <div className="absolute inset-0 bg-gradient-to-b from-cream via-cream to-gray-50 -z-10" />

        <div className="container-grid py-24">
          <div className="grid-12">
            <div className="col-span-12 lg:col-span-6 flex flex-col justify-center space-y-8">
              <div className={`animate-fade ${isVisible.hero ? 'opacity-100' : 'opacity-0'}`}>
                <h1 className="text-responsive-xl font-serif font-light tracking-tight leading-tight">
                  Democratizing Microbial
                  <br />
                  Electrochemical Systems
                  <br />
                  Research Through AI
                </h1>
                <p className="text-lg mt-6 opacity-60 max-w-2xl">
                  MESSAI empowers researchers, engineers, and innovators worldwide with cutting-edge
                  tools for designing, simulating, and optimizing electrochemical systems.
                </p>
              </div>

              <div className="flex items-center gap-4">
                <Button size="lg" className="group">
                  Get Started
                  <svg
                    className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </Button>
                <a
                  href="/auth/signin"
                  className="text-sm opacity-60 hover:opacity-100 transition-opacity"
                >
                  Already have an account? Sign in
                </a>
              </div>

              <div className="flex items-center gap-8 pt-8">
                <div>
                  <p className="text-2xl font-serif">3,721+</p>
                  <p className="text-sm opacity-60">Research Papers</p>
                </div>
                <div>
                  <p className="text-2xl font-serif">1,500+</p>
                  <p className="text-sm opacity-60">Parameters</p>
                </div>
                <div>
                  <p className="text-2xl font-serif">4</p>
                  <p className="text-sm opacity-60">MESS Models</p>
                </div>
              </div>
            </div>

            <div className="col-span-12 lg:col-span-6 flex items-center justify-center">
              <Hero3DViewer />
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-pulse">
          <svg className="w-6 h-6 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </section>

      {/* Platform Statistics */}
      <section id="stats" className="py-24 bg-gray-50">
        <div className="container-grid">
          <div className="grid-12">
            <div className="col-span-12 text-center mb-16">
              <h2
                className={`text-3xl font-serif font-light tracking-tight transition-all duration-700 ${
                  isVisible.stats ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                }`}
              >
                Platform Impact at a Glance
              </h2>
            </div>
          </div>

          <div className="grid-12">
            {statistics.map((stat, index) => (
              <div key={index} className="col-span-6 md:col-span-3 text-center">
                <Card
                  shadow={false}
                  className={`h-full transition-all duration-700 delay-${index * 100} ${
                    isVisible.stats ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                  }`}
                >
                  <StatisticsCounter
                    value={stat.value}
                    suffix={stat.suffix}
                    label={stat.label}
                    isVisible={isVisible.stats}
                  />
                </Card>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Core Features */}
      <section id="features" className="py-24">
        <div className="container-grid">
          <div className="grid-12">
            <div className="col-span-12 text-center mb-16">
              <h2
                className={`text-3xl font-serif font-light tracking-tight transition-all duration-700 ${
                  isVisible.features ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                }`}
              >
                Unified Platform for Electrochemical Innovation
              </h2>
              <p
                className={`text-lg mt-4 opacity-60 transition-all duration-700 delay-100 ${
                  isVisible.features ? 'opacity-60 translate-y-0' : 'opacity-0 translate-y-4'
                }`}
              >
                Everything you need to advance your research in one integrated platform
              </p>
            </div>
          </div>

          <div className="grid-12">
            {features.map((feature, index) => (
              <div key={index} className="col-span-12 md:col-span-6 lg:col-span-3">
                <Card
                  shadow={false}
                  className={`h-full hover:shadow-lg transition-all duration-700 delay-${
                    index * 100
                  } ${
                    isVisible.features ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                  }`}
                >
                  <div className="flex flex-col items-center text-center space-y-4">
                    <div className="w-12 h-12 bg-black text-cream rounded-lg flex items-center justify-center">
                      {feature.icon}
                    </div>
                    <h3 className="text-lg font-serif">{feature.title}</h3>
                    <p className="text-sm opacity-60">{feature.description}</p>
                    <Badge variant={feature.statusVariant}>{feature.status}</Badge>
                  </div>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Persona Sections */}
      <PersonaSection
        id="researchers"
        title="For Researchers"
        subtitle="Accelerate Your Research"
        benefits={[
          'Access 3,721+ enhanced papers with extracted metrics',
          'AI-powered literature reviews and citation networks',
          'Real-time performance predictions',
          'Collaborative experiment tracking',
        ]}
        ctaText="Explore Research Tools"
        ctaHref="/research"
        isVisible={isVisible.researchers}
        imagePosition="right"
      />

      <PersonaSection
        id="students"
        title="For Students"
        subtitle="Learn Through Interaction"
        benefits={[
          'Interactive 3D models for hands-on learning',
          'Guided tutorials and educational content',
          'Practice with real research data',
          'Build portfolio of experiments',
        ]}
        ctaText="Start Learning"
        ctaHref="/lab"
        isVisible={isVisible.students}
        imagePosition="left"
        background="gray"
      />

      <PersonaSection
        id="engineers"
        title="For Industry Engineers"
        subtitle="Scale with Confidence"
        benefits={[
          'Industrial-scale system modeling',
          'Techno-economic analysis tools',
          'Integration with existing infrastructure',
          'ROI and performance predictions',
        ]}
        ctaText="See Enterprise Features"
        ctaHref="/parameters"
        isVisible={isVisible.engineers}
        imagePosition="right"
      />

      {/* How It Works */}
      <section id="process" className="py-24 bg-gray-50">
        <div className="container-grid">
          <div className="grid-12">
            <div className="col-span-12 text-center mb-16">
              <h2
                className={`text-3xl font-serif font-light tracking-tight transition-all duration-700 ${
                  isVisible.process ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                }`}
              >
                How It Works
              </h2>
              <p
                className={`text-lg mt-4 opacity-60 transition-all duration-700 delay-100 ${
                  isVisible.process ? 'opacity-60 translate-y-0' : 'opacity-0 translate-y-4'
                }`}
              >
                Three simple steps to revolutionize your research
              </p>
            </div>
          </div>

          <div className="grid-12">
            <div className="col-span-12">
              <div className="flex flex-col md:flex-row items-center justify-between gap-8 md:gap-4">
                {processSteps.map((step, index) => (
                  <ProcessStep
                    key={index}
                    {...step}
                    isVisible={isVisible.process}
                    delay={index * 200}
                    showConnector={index < processSteps.length - 1}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section id="cta" className="py-24 bg-black text-cream">
        <div className="container-grid">
          <div className="grid-12">
            <div className="col-span-12 text-center">
              <h2
                className={`text-3xl font-serif font-light tracking-tight transition-all duration-700 ${
                  isVisible.cta ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                }`}
              >
                Ready to Transform Your Research?
              </h2>
              <p
                className={`text-lg mt-4 opacity-60 max-w-2xl mx-auto transition-all duration-700 delay-100 ${
                  isVisible.cta ? 'opacity-60 translate-y-0' : 'opacity-0 translate-y-4'
                }`}
              >
                Join thousands of researchers advancing the field of microbial electrochemical
                systems
              </p>

              <div
                className={`mt-8 flex flex-col sm:flex-row items-center justify-center gap-4 transition-all duration-700 delay-200 ${
                  isVisible.cta ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                }`}
              >
                <Button size="lg" variant="secondary" className="group">
                  Get Started
                  <svg
                    className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </Button>
                <a href="/docs" className="text-sm opacity-60 hover:opacity-100 transition-opacity">
                  Read the documentation
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
