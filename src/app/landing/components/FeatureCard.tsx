'use client';

interface FeatureCardProps {
  title: string;
  description: string;
  icon: string;
  metrics: string[];
  variant: 'default' | 'highlight';
}

export function FeatureCard({
  title,
  description,
  icon,
  metrics,
  variant = 'default',
}: FeatureCardProps) {
  const baseClasses =
    'p-8 rounded-xl transition-all duration-300 hover:shadow-lg';
  const variantClasses =
    variant === 'highlight'
      ? 'bg-gradient-to-br from-blue-50 to-indigo-100 border-2 border-blue-200 hover:border-blue-300'
      : 'bg-white border border-gray-200 hover:border-gray-300';

  return (
    <div className={`${baseClasses} ${variantClasses}`}>
      <div className="flex items-start space-x-4">
        {icon && (
          <div className="flex-shrink-0">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <div className="w-6 h-6 bg-blue-600 rounded"></div>
            </div>
          </div>
        )}

        <div className="flex-1">
          <h3 className="text-xl font-semibold text-gray-900 mb-3">{title}</h3>

          <p className="text-gray-600 mb-4">{description}</p>

          {metrics && metrics.length > 0 && (
            <div className="space-y-2">
              {metrics.map((metric, index) => (
                <div key={index} className="flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                  <span className="text-green-700 font-medium">{metric}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

interface FeaturesSectionProps {
  title: string;
  subtitle: string;
  features: FeatureCardProps[];
}

export function FeaturesSection({
  title = '核心功能特色',
  subtitle = '为企业提供全方位的自动化解决方案',
  features,
}: FeaturesSectionProps) {
  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            {title}
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">{subtitle}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <FeatureCard
              key={index}
              {...feature}
              variant={index === 0 ? 'highlight' : 'default'}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
