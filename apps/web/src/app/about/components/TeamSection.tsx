'use client';

import { useEffect, useRef, useState } from 'react';
import { teamMembers } from '../data/team';
import TeamMemberCard from './TeamMember';

export default function TeamSection() {
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
          <div className="col-span-12 text-center mb-16">
            <h2
              className={`font-serif font-light tracking-tight text-responsive-3xl transition-all duration-1000 transform ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
              }`}
            >
              Meet Our Team
            </h2>
            <p
              className={`text-responsive-lg text-gray-600 mt-4 max-w-2xl mx-auto transition-all duration-1000 delay-200 transform ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
              }`}
            >
              Passionate experts dedicated to revolutionizing electrochemical research
            </p>
          </div>

          <div className="col-span-12">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {teamMembers.map((member, index) => (
                <TeamMemberCard
                  key={member.id}
                  member={member}
                  isVisible={isVisible}
                  index={index}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
