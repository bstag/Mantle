import React from 'react';
import Badge from '../common/Badge';

interface FeatureSectionProps {
  badge: string;
  title: string;
  description: string | React.ReactNode;
  additionalContent?: React.ReactNode;
  listItems?: string[];
  visualContent: React.ReactNode;
  reverse?: boolean;
}

const FeatureSection: React.FC<FeatureSectionProps> = ({
  badge,
  title,
  description,
  additionalContent,
  listItems,
  visualContent,
  reverse = false,
}) => {
  return (
    <section className={`flex flex-col ${reverse ? 'md:flex-row-reverse' : 'md:flex-row'} items-center gap-12 mb-24 animate-fade-in-up`}>
      <div className="flex-1 space-y-6">
        <Badge>{badge}</Badge>
        <h2 className="text-3xl md:text-4xl font-bold font-serif">{title}</h2>
        <div className="text-lg text-muted leading-relaxed">
          {description}
        </div>
        {additionalContent}
        {listItems && listItems.length > 0 && (
          <ul className="space-y-3 mt-4">
            {listItems.map((item, i) => (
              <li key={i} className="flex items-center gap-3 text-main">
                <svg className="w-5 h-5 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                {item}
              </li>
            ))}
          </ul>
        )}
      </div>
      <div className="flex-1 w-full">
        {visualContent}
      </div>
    </section>
  );
};

export default FeatureSection;
