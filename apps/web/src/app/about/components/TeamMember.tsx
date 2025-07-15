import Image from 'next/image';
import { Card } from '@messai/ui';
import type { TeamMember } from '../data/team';

interface TeamMemberProps {
  member: TeamMember;
  isVisible: boolean;
  index: number;
}

export default function TeamMemberCard({ member, isVisible, index }: TeamMemberProps) {
  return (
    <Card
      className={`overflow-hidden transition-all duration-700 transform ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      }`}
      style={{ transitionDelay: `${index * 100}ms` }}
    >
      <div className="aspect-square relative bg-gray-100">
        <Image
          src={member.image}
          alt={member.name}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
      </div>
      <div className="p-6">
        <h3 className="font-serif text-responsive-xl mb-1">{member.name}</h3>
        <p className="text-sm text-gray-600 mb-3">{member.role}</p>
        <p className="text-sm text-gray-600 leading-relaxed">{member.bio}</p>
      </div>
    </Card>
  );
}
