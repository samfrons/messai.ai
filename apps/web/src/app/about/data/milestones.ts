export interface Milestone {
  id: string;
  date: string;
  title: string;
  description: string;
  icon?: string;
}

export const milestones: Milestone[] = [
  {
    id: 'founding',
    date: 'January 2023',
    title: 'MESSAI Founded',
    description: 'Started with a vision to democratize microbial electrochemical systems research.',
  },
  {
    id: 'research-phase',
    date: 'March 2023',
    title: 'Research Intelligence System Launch',
    description: 'Released our AI-powered research paper analysis system with 3,721+ papers.',
  },
  {
    id: 'parameter-database',
    date: 'June 2023',
    title: 'MESS Parameter Database',
    description: 'Launched comprehensive parameter library with 1,500+ MESS parameters.',
  },
  {
    id: '3d-lab',
    date: 'September 2023',
    title: 'Interactive 3D Lab',
    description: 'Introduced real-time 3D visualization for electrochemical system design.',
  },
  {
    id: 'prediction-engine',
    date: 'December 2023',
    title: 'AI Prediction Engine',
    description: 'Released ML models for performance predictions based on research data.',
  },
  {
    id: 'community-launch',
    date: 'March 2024',
    title: 'Community Platform',
    description: 'Opened platform for global researcher collaboration and experiment sharing.',
  },
  {
    id: 'model-catalog',
    date: 'June 2024',
    title: 'MESS Model Catalog',
    description:
      'Launched collection of original multi-scale MESS models for various applications.',
  },
  {
    id: 'future-vision',
    date: '2025 and Beyond',
    title: 'Expanding Horizons',
    description: 'Working towards AR/VR integration, automated labs, and global research networks.',
  },
];
