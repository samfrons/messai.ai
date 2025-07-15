import { Card } from '@messai/ui';
import type { Reference } from '../../../types/parameters';

interface ReferencesProps {
  references: Reference[];
}

export default function References({ references }: ReferencesProps) {
  const formatReference = (ref: Reference, index: number) => {
    // Extract year if present in the text
    const yearMatch = ref.text.match(/\((\d{4})\)/);
    const year = yearMatch ? yearMatch[1] : null;

    // Extract journal if present (text in italics or after period)
    const journalMatch = ref.text.match(/[._]([^.]+)[,.]?\s*\d+\(/);
    const journal = journalMatch ? journalMatch[1].trim() : null;

    return (
      <li className="flex items-start space-x-2">
        <span className="text-gray-400 font-medium min-w-[20px]">{index + 1}.</span>
        <div className="flex-1">
          <p className="text-sm text-gray-700">{ref.text}</p>
          <div className="flex gap-3 mt-1">
            {ref.doi && (
              <a
                href={`https://doi.org/${ref.doi}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-primary-600 hover:text-primary-700 hover:underline"
              >
                DOI: {ref.doi}
              </a>
            )}
            {ref.url && !ref.doi && (
              <a
                href={ref.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-primary-600 hover:text-primary-700 hover:underline"
              >
                View Source
              </a>
            )}
            {year && <span className="text-xs text-gray-500">Year: {year}</span>}
            {journal && journal[1] && (
              <span className="text-xs text-gray-500 italic">{journal[1]}</span>
            )}
          </div>
        </div>
      </li>
    );
  };

  return (
    <Card>
      <div className="p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">References</h2>

        <ol className="space-y-3">{references.map((ref, index) => formatReference(ref, index))}</ol>

        <div className="mt-4 pt-4 border-t border-gray-200">
          <p className="text-xs text-gray-500">
            {references.length} reference{references.length !== 1 ? 's' : ''} cited
          </p>
        </div>
      </div>
    </Card>
  );
}
