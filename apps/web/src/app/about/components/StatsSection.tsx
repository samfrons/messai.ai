'use client';

import { useEffect, useRef, useState } from 'react';

interface Stat {
  number: string;
  label: string;
  suffix?: string;
}

export default function StatsSection() {
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

  const stats: Stat[] = [
    { number: '3,721', suffix: '+', label: 'Research Papers' },
    { number: '1,500', suffix: '+', label: 'MESS Parameters' },
    { number: '1,200', suffix: '+', label: 'Knowledge Nodes' },
    { number: '4', label: 'Original MESS Models' },
  ];

  return (
    <section ref={sectionRef} className="py-24 bg-gray-50">
      <div className="container-grid">
        <div className="grid-12">
          <div className="col-span-12 text-center mb-16">
            <h2
              className={`font-serif font-light tracking-tight text-responsive-3xl transition-all duration-1000 transform ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
              }`}
            >
              Our Impact in Numbers
            </h2>
          </div>

          <div className="col-span-12">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
              {stats.map((stat, index) => (
                <div
                  key={stat.label}
                  className={`text-center transition-all duration-700 transform ${
                    isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
                  }`}
                  style={{ transitionDelay: `${200 + index * 100}ms` }}
                >
                  <div className="font-serif text-responsive-4xl font-light mb-2">
                    {stat.number}
                    {stat.suffix && <span className="text-responsive-3xl">{stat.suffix}</span>}
                  </div>
                  <p className="text-gray-600 text-responsive-sm uppercase tracking-wider">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
