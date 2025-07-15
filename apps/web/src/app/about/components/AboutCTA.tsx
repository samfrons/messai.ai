'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Button } from '@messai/ui';

export default function AboutCTA() {
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

  return (
    <section ref={sectionRef} className="py-24 bg-white">
      <div className="container-grid">
        <div className="grid-12">
          <div className="col-span-12 text-center">
            <h2
              className={`font-serif font-light tracking-tight text-responsive-3xl mb-6 transition-all duration-1000 transform ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
              }`}
            >
              Join Our Mission
            </h2>
            <p
              className={`text-responsive-lg text-gray-600 max-w-3xl mx-auto mb-12 transition-all duration-1000 delay-200 transform ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
              }`}
            >
              Be part of the revolution in electrochemical research. Whether you&apos;re a
              researcher, engineer, or innovator, MESSAI provides the tools you need to make
              breakthrough discoveries.
            </p>

            <div
              className={`flex flex-col sm:flex-row gap-4 justify-center transition-all duration-1000 delay-400 transform ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
              }`}
            >
              <Link href="/research">
                <Button variant="primary" size="lg">
                  Explore Research
                </Button>
              </Link>
              <Link href="/lab">
                <Button variant="outline" size="lg">
                  Try the Lab
                </Button>
              </Link>
              <Link href="/parameters">
                <Button variant="outline" size="lg">
                  Browse Parameters
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
