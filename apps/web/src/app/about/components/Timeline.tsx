'use client';

import { useEffect, useRef, useState } from 'react';
import { milestones } from '../data/milestones';
import TimelineItem from './TimelineItem';

export default function Timeline() {
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
    <section ref={sectionRef} className="py-24 bg-gray-50">
      <div className="container-grid">
        <div className="grid-12">
          <div className="col-span-12 text-center mb-16">
            <h2
              className={`font-serif font-light tracking-tight text-responsive-3xl transition-all duration-1000 transform ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
              }`}
            >
              Our Journey
            </h2>
            <p
              className={`text-responsive-lg text-gray-600 mt-4 max-w-2xl mx-auto transition-all duration-1000 delay-200 transform ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
              }`}
            >
              Building the future of electrochemical research, one milestone at a time
            </p>
          </div>

          <div className="col-span-12">
            <div className="relative space-y-12 lg:space-y-16">
              {milestones.map((milestone, index) => (
                <TimelineItem
                  key={milestone.id}
                  milestone={milestone}
                  isVisible={isVisible}
                  index={index}
                  isLast={index === milestones.length - 1}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
