import { Card } from '@messai/ui';
import type { ParameterSection } from '../../../types/parameters';
import { marked } from 'marked';
import DOMPurify from 'dompurify';

interface ParameterContentProps {
  content: ParameterSection[];
}

export default function ParameterContent({ content }: ParameterContentProps) {
  const renderMarkdown = (text: string) => {
    // Use proper markdown parser and sanitize output
    try {
      const html = marked(text, {
        breaks: true,
        gfm: true,
      });

      // Sanitize HTML to prevent XSS
      const sanitizedHtml = DOMPurify.sanitize(html as string, {
        ALLOWED_TAGS: [
          'strong',
          'em',
          'p',
          'br',
          'ul',
          'ol',
          'li',
          'code',
          'pre',
          'h1',
          'h2',
          'h3',
          'h4',
          'h5',
          'h6',
        ],
        ALLOWED_ATTR: ['class'],
      });

      return sanitizedHtml;
    } catch (error) {
      // Fallback to plain text if parsing fails
      console.error('Markdown parsing failed:', error);
      return text;
    }
  };

  // Group sections by parent
  const topLevelSections = content.filter((s) => s.level === 2);
  const subsectionsByParent = content.reduce<Record<string, ParameterSection[]>>((acc, section) => {
    if (section.parent) {
      if (!acc[section.parent]) acc[section.parent] = [];
      acc[section.parent]?.push(section);
    }
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      {topLevelSections.map((section, index) => (
        <Card key={index}>
          <div className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">{section.title}</h2>

            {/* Section content */}
            {section.content && (
              <div
                className="prose prose-sm max-w-none text-gray-600"
                dangerouslySetInnerHTML={{ __html: renderMarkdown(section.content) }}
              />
            )}

            {/* Subsections */}
            {(() => {
              const subsections = subsectionsByParent[section.title];
              return (
                subsections &&
                subsections.length > 0 && (
                  <div className="mt-6 space-y-4">
                    {subsections.map((subsection, subIndex) => (
                      <div key={subIndex}>
                        <h3 className="text-lg font-medium text-gray-800 mb-2">
                          {subsection.title}
                        </h3>
                        <div
                          className="prose prose-sm max-w-none text-gray-600"
                          dangerouslySetInnerHTML={{ __html: renderMarkdown(subsection.content) }}
                        />
                      </div>
                    ))}
                  </div>
                )
              );
            })()}
          </div>
        </Card>
      ))}
    </div>
  );
}
