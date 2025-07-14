'use client';
import { Button } from '@messai/ui';

interface PersonaSectionProps {
  id: string;
  title: string;
  subtitle: string;
  benefits: string[];
  ctaText: string;
  ctaHref: string;
  isVisible: boolean;
  imagePosition?: 'left' | 'right';
  background?: 'white' | 'gray';
}

export default function PersonaSection({
  id,
  title,
  subtitle,
  benefits,
  ctaText,
  ctaHref,
  isVisible,
  imagePosition = 'right',
  background = 'white',
}: PersonaSectionProps) {
  const bgClass = background === 'gray' ? 'bg-gray-50' : 'bg-white';

  return (
    <section id={id} className={`py-24 ${bgClass}`}>
      <div className="container-grid">
        <div className="grid-12 items-center">
          {/* Content */}
          <div
            className={`col-span-12 lg:col-span-6 ${
              imagePosition === 'right' ? 'lg:pr-12' : 'lg:pl-12 lg:order-2'
            }`}
          >
            <div
              className={`space-y-6 transition-all duration-700 ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
              }`}
            >
              <div>
                <p className="text-sm font-mono opacity-60 mb-2">{title}</p>
                <h2 className="text-3xl font-serif font-light tracking-tight">{subtitle}</h2>
              </div>

              <div className="space-y-4">
                {benefits.map((benefit, index) => (
                  <div
                    key={index}
                    className={`flex items-start gap-3 transition-all duration-700 delay-${
                      (index + 1) * 100
                    } ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'}`}
                  >
                    <div className="w-5 h-5 bg-black rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <svg
                        className="w-3 h-3 text-cream"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </div>
                    <p className="text-base opacity-80">{benefit}</p>
                  </div>
                ))}
              </div>

              <div className="pt-4">
                <a href={ctaHref}>
                  <Button className="group">
                    {ctaText}
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
                </a>
              </div>
            </div>
          </div>

          {/* Placeholder for Image/Illustration */}
          <div
            className={`col-span-12 lg:col-span-6 ${imagePosition === 'right' ? 'lg:order-2' : ''}`}
          >
            <div
              className={`relative h-96 lg:h-[500px] bg-gray-100 rounded-lg overflow-hidden transition-all duration-700 delay-300 ${
                isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
              }`}
            >
              {/* Abstract visualization based on persona */}
              <div className="absolute inset-0 flex items-center justify-center">
                {id === 'researchers' && (
                  <div className="text-center">
                    <svg
                      className="w-32 h-32 mx-auto mb-4 opacity-20"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={0.5}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                    <p className="text-sm opacity-40">Research Intelligence Visualization</p>
                  </div>
                )}
                {id === 'students' && (
                  <div className="text-center">
                    <svg
                      className="w-32 h-32 mx-auto mb-4 opacity-20"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={0.5}
                        d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                      />
                    </svg>
                    <p className="text-sm opacity-40">Interactive Learning Visualization</p>
                  </div>
                )}
                {id === 'engineers' && (
                  <div className="text-center">
                    <svg
                      className="w-32 h-32 mx-auto mb-4 opacity-20"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={0.5}
                        d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                      />
                    </svg>
                    <p className="text-sm opacity-40">Industrial Scale Visualization</p>
                  </div>
                )}
              </div>

              {/* Animated gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-gray-100 via-transparent to-gray-200 opacity-50" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
