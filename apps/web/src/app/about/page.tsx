import AboutHero from './components/AboutHero';
import MissionVision from './components/MissionVision';
import StatsSection from './components/StatsSection';
import TeamSection from './components/TeamSection';
import Timeline from './components/Timeline';
import AboutCTA from './components/AboutCTA';

export default function AboutPage() {
  return (
    <main className="min-h-screen">
      <AboutHero />
      <MissionVision />
      <StatsSection />
      <TeamSection />
      <Timeline />
      <AboutCTA />
    </main>
  );
}
