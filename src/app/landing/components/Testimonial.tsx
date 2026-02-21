'use client';

interface TestimonialProps {
  quote: string;
  author: string;
  position: string;
  company: string;
  avatar?: string;
  rating?: number;
}

export function Testimonial({ 
  quote, 
  author, 
  position, 
  company, 
  avatar,
  rating = 5
}: TestimonialProps) {
  return (
    <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100">
      {/* 评分 */}
      <div className="flex mb-4">
        {[...Array(rating)].map((_, i) => (
          <svg key={i} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
      </div>
      
      {/* 引用内容 */}
      <blockquote className="text-gray-700 mb-6 italic">
        "{quote}"
      </blockquote>
      
      {/* 作者信息 */}
      <div className="flex items-center">
        {avatar ? (
          <img 
            src={avatar} 
            alt={author}
            className="w-12 h-12 rounded-full mr-4"
          />
        ) : (
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-4">
            <span className="text-blue-600 font-semibold">
              {author.charAt(0)}
            </span>
          </div>
        )}
        
        <div>
          <div className="font-semibold text-gray-900">{author}</div>
          <div className="text-gray-600">{position}</div>
          <div className="text-sm text-gray-500">{company}</div>
        </div>
      </div>
    </div>
  );
}

interface TestimonialsSectionProps {
  title?: string;
  subtitle?: string;
  testimonials: TestimonialProps[];
}

export function TestimonialsSection({ 
  title = "客户见证",
  subtitle = "听听我们的客户怎么说",
  testimonials
}: TestimonialsSectionProps) {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            {title}
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            {subtitle}
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <Testimonial key={index} {...testimonial} />
          ))}
        </div>
        
        {/* 统计数据 */}
        <div className="mt-20 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-blue-600 mb-2">500+</div>
              <div className="text-gray-600">企业客户</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-green-600 mb-2">98%</div>
              <div className="text-gray-600">客户满意度</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-purple-600 mb-2">24/7</div>
              <div className="text-gray-600">技术支持</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-orange-600 mb-2">50%</div>
              <div className="text-gray-600">平均效率提升</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}