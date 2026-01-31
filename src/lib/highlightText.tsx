import { ReactNode } from 'react';

function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export interface HighlightOptions {
  className?: string;
  caseSensitive?: boolean;
}

export function highlightText(
  text: string,
  query: string,
  options: HighlightOptions = {}
): ReactNode {
  const { className = 'bg-yellow-200/60 text-foreground rounded-sm px-0.5', caseSensitive = false } = options;

  if (!query || !text) {
    return text;
  }

  const flags = caseSensitive ? 'g' : 'gi';
  const escapedQuery = escapeRegExp(query);
  const parts = text.split(new RegExp(`(${escapedQuery})`, flags));

  return parts.map((part, index) => {
    const isMatch = caseSensitive 
      ? part === query 
      : part.toLowerCase() === query.toLowerCase();
    
    return isMatch ? (
      <mark key={index} className={className}>
        {part}
      </mark>
    ) : (
      part
    );
  });
}

export function HighlightedText({
  text,
  query,
  className,
  caseSensitive = false,
}: {
  text: string;
  query: string;
  className?: string;
  caseSensitive?: boolean;
}) {
  return <>{highlightText(text, query, { className, caseSensitive })}</>;
}
