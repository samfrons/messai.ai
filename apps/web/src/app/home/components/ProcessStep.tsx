'use client';

interface ProcessStepProps {
  number: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  isVisible: boolean;
  delay: number;
  showConnector?: boolean;
}

export default function ProcessStep({
  number,
  title,
  description,
  icon,
  isVisible,
  delay,
  showConnector = false,
}: ProcessStepProps) {
  return (
    <div className="flex-1 relative">
      <div
        className={`text-center transition-all duration-700 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
        }`}
        style={{ transitionDelay: `${delay}ms` }}
      >
        {/* Step Number */}
        <div className="relative inline-flex items-center justify-center mb-6">
          <div className="w-20 h-20 bg-black text-cream rounded-full flex items-center justify-center">
            {icon}
          </div>
          <div className="absolute -top-2 -right-2 w-8 h-8 bg-cream border-2 border-black rounded-full flex items-center justify-center">
            <span className="text-xs font-mono font-bold">{number}</span>
          </div>
        </div>

        {/* Content */}
        <h3 className="text-lg font-serif mb-2">{title}</h3>
        <p className="text-sm opacity-60 max-w-xs mx-auto">{description}</p>
      </div>

      {/* Connector */}
      {showConnector && (
        <div
          className={`hidden md:block absolute top-10 left-[60%] w-[80%] transition-all duration-700 ${
            isVisible ? 'opacity-100' : 'opacity-0'
          }`}
          style={{ transitionDelay: `${delay + 100}ms` }}
        >
          <svg className="w-full h-2" viewBox="0 0 100 10" preserveAspectRatio="none">
            <path
              d="M 0 5 L 100 5"
              stroke="currentColor"
              strokeWidth="1"
              fill="none"
              strokeDasharray="2,2"
              className="opacity-20"
            />
          </svg>
          <svg
            className="absolute top-1/2 right-0 transform -translate-y-1/2 w-3 h-3"
            viewBox="0 0 10 10"
          >
            <path d="M 0 3 L 6 5 L 0 7" fill="currentColor" className="opacity-20" />
          </svg>
        </div>
      )}
    </div>
  );
}
