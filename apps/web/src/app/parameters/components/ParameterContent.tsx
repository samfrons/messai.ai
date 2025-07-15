import { Card } from '@messai/ui';
import type { ParameterSection } from '../../../types/parameters';

interface ParameterContentProps {
  content: ParameterSection[];
}

export default function ParameterContent({ content }: ParameterContentProps) {
  const renderMarkdown = (text: string) => {
    // Simple markdown rendering - in production, use a proper markdown parser
    let html = text
      // Bold text
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      // Italic text
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
      // Code blocks
      .replace(/`(.+?)`/g, '<code class="bg-gray-100 px-1 py-0.5 rounded text-sm">$1</code>')
      // Line breaks
      .replace(/\n/g, '<br />');

    // Lists
    const lines = html.split('<br />');
    let inList = false;
    let listHtml = '';

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (line && line.trim().startsWith('- ')) {
        if (!inList) {
          listHtml += '<ul class="list-disc list-inside space-y-1 my-2">';
          inList = true;
        }
        listHtml += `<li>${line ? line.substring(2) : ''}</li>`;
      } else {
        if (inList) {
          listHtml += '</ul>';
          inList = false;
        }
        listHtml += line + (i < lines.length - 1 ? '<br />' : '');
      }
    }

    if (inList) {
      listHtml += '</ul>';
    }

    return listHtml;
  };

  // Group sections by parent
  const topLevelSections = content.filter((s) => s.level === 2);
  const subsectionsByParent = content.reduce<Record<string, ParameterSection[]>>((acc, section) => {
    if (section.parent) {
      if (!acc[section.parent]) acc[section.parent] = [];
      acc[section.parent].push(section);
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
            {subsectionsByParent[section.title] &&
              subsectionsByParent[section.title].length > 0 && (
                <div className="mt-6 space-y-4">
                  {subsectionsByParent[section.title]!.map((subsection, subIndex) => (
                    <div key={subIndex}>
                      <h3 className="text-lg font-medium text-gray-800 mb-2">{subsection.title}</h3>
                      <div
                        className="prose prose-sm max-w-none text-gray-600"
                        dangerouslySetInnerHTML={{ __html: renderMarkdown(subsection.content) }}
                      />
                    </div>
                  ))}
                </div>
              )}
          </div>
        </Card>
      ))}
    </div>
  );
}
