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
    id: 'alex-chen',
    name: 'Dr. Alex Chen',
    role: 'Chief Scientific Officer',
    bio: 'Leading expert in microbial fuel cell technology with 15+ years of research experience.',
    image: '/images/team/alex-chen.jpg',
  },
  {
    id: 'maria-rodriguez',
    name: 'Maria Rodriguez',
    role: 'Head of Engineering',
    bio: 'Full-stack engineer specializing in 3D visualization and real-time data processing systems.',
    image: '/images/team/maria-rodriguez.jpg',
  },
  {
    id: 'james-kim',
    name: 'Dr. James Kim',
    role: 'AI Research Lead',
    bio: 'Machine learning specialist focused on predictive modeling for electrochemical systems.',
    image: '/images/team/james-kim.jpg',
  },
  {
    id: 'sarah-johnson',
    name: 'Sarah Johnson',
    role: 'Product Design Lead',
    bio: 'UX designer creating intuitive interfaces that make complex science accessible to all.',
    image: '/images/team/sarah-johnson.jpg',
  },
  {
    id: 'david-patel',
    name: 'David Patel',
    role: 'Community Manager',
    bio: 'Building bridges between researchers worldwide and fostering collaborative innovation.',
    image: '/images/team/david-patel.jpg',
  },
];
