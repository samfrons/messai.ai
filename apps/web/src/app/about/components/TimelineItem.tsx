import type { Milestone } from '../data/milestones';

interface TimelineItemProps {
  milestone: Milestone;
  isVisible: boolean;
  index: number;
  isLast: boolean;
}

export default function TimelineItem({ milestone, isVisible, index, isLast }: TimelineItemProps) {
  const isEven = index % 2 === 0;

  return (
    <div className="relative">
      {/* Timeline line */}
      {!isLast && (
        <div className="absolute left-1/2 top-12 w-0.5 h-full bg-gray-300 -translate-x-1/2 hidden lg:block" />
      )}

      <div
        className={`flex flex-col lg:flex-row items-center ${
          isEven ? 'lg:flex-row' : 'lg:flex-row-reverse'
        }`}
      >
        {/* Content */}
        <div
          className={`w-full lg:w-5/12 ${
            isEven ? 'lg:text-right lg:pr-8' : 'lg:text-left lg:pl-8'
          }`}
        >
          <div
            className={`transition-all duration-700 transform ${
              isVisible
                ? 'opacity-100 translate-x-0'
                : `opacity-0 ${isEven ? 'translate-x-8' : '-translate-x-8'}`
            }`}
            style={{ transitionDelay: `${index * 150}ms` }}
          >
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
              <time className="text-sm text-gray-500 font-medium">{milestone.date}</time>
              <h3 className="font-serif text-responsive-xl mt-2 mb-3">{milestone.title}</h3>
              <p className="text-gray-600 text-sm leading-relaxed">{milestone.description}</p>
            </div>
          </div>
        </div>

        {/* Timeline dot */}
        <div className="w-full lg:w-2/12 flex justify-center my-8 lg:my-0">
          <div
            className={`relative transition-all duration-700 transform ${
              isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-0'
            }`}
            style={{ transitionDelay: `${index * 150 + 100}ms` }}
          >
            <div className="w-4 h-4 bg-primary rounded-full border-4 border-white shadow-md" />
            <div className="absolute inset-0 w-4 h-4 bg-primary rounded-full animate-ping opacity-20" />
          </div>
        </div>

        {/* Spacer */}
        <div className="hidden lg:block lg:w-5/12" />
      </div>
    </div>
  );
}
