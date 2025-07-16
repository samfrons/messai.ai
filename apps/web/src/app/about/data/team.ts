export interface TeamMember {
  id: string;
  name: string;
  role: string;
  bio: string;
  image: string;
}

export const teamMembers: TeamMember[] = [
  {
    id: 'sam-frons',
    name: 'Sam Frons',
    role: 'Founder & CEO',
    bio: 'Visionary leader passionate about democratizing electrochemical research and accelerating sustainable energy solutions.',
    image: '/images/team/sam-frons.jpg',
  },
  {
    id: 'lane-gilchrist',
    name: 'Lane Gilchrist',
    role: 'Co-Founder & CTO',
    bio: 'Technical visionary driving innovation in AI-powered research platforms and sustainable technology solutions.',
    image: '/images/team/lane-gilchrist.jpg',
  },
  {
    id: 'zakiya-sharpe',
    name: 'Zakiya Sharpe',
    role: 'Head of Research Operations',
    bio: 'Research strategist focused on advancing electrochemical systems through collaborative science and data-driven insights.',
    image: '/images/team/zakiya-sharpe.jpg',
  },
];
