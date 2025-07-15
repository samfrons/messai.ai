'use client';

import { useEffect, useRef, useState } from 'react';
import { Card } from '@messai/ui';

export default function MissionVision() {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const values = [
    { name: 'Innovation', icon: '💡' },
    { name: 'Sustainability', icon: '🌱' },
    { name: 'Collaboration', icon: '🤝' },
    { name: 'Open Science', icon: '🔬' },
  ];

  return (
    <section ref={sectionRef} className="py-24 bg-white">
      <div className="container-grid">
        <div className="grid-12">
          <div className="col-span-12 lg:col-span-6 mb-12 lg:mb-0">
            <div
              className={`transition-all duration-1000 transform ${
                isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-8'
              }`}
            >
              <h2 className="font-serif font-light tracking-tight text-responsive-3xl mb-6">
                Our Vision
              </h2>
              <p className="text-responsive-base text-gray-600 leading-relaxed">
                To democratize microbial electrochemical systems research, development, education
                and commercialization by creating the world&apos;s most comprehensive, AI-powered
                platform that unifies and standardizes knowledge extraction, experimentation, and
                design, accelerating the transition to sustainable energy solutions.
              </p>
            </div>
          </div>

          <div className="col-span-12 lg:col-span-6">
            <div
              className={`transition-all duration-1000 delay-200 transform ${
                isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'
              }`}
            >
              <h2 className="font-serif font-light tracking-tight text-responsive-3xl mb-6">
                Our Mission
              </h2>
              <p className="text-responsive-base text-gray-600 leading-relaxed">
                MESSAI empowers researchers, engineers, and innovators worldwide with cutting-edge
                tools for designing, simulating, and optimizing electrochemical systems through
                intelligent 3D modeling, AI-driven predictions, and collaborative research
                capabilities.
              </p>
            </div>
          </div>

          <div className="col-span-12 mt-16">
            <h3
              className={`font-serif font-light tracking-tight text-responsive-2xl mb-8 text-center transition-all duration-1000 delay-400 transform ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
              }`}
            >
              Our Core Values
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {values.map((value, index) => (
                <Card
                  key={value.name}
                  className={`text-center p-8 transition-all duration-700 transform ${
                    isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
                  }`}
                  style={{ transitionDelay: `${600 + index * 100}ms` }}
                >
                  <div className="text-4xl mb-4">{value.icon}</div>
                  <p className="font-medium">{value.name}</p>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
