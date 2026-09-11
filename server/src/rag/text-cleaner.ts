import type { ExtractedPage } from './pdf-extractor.js';

export type CleanedPage = {
  pageNumber: number;
  lines: string[];
};

// DECISION: the PDF text stream embeds literal tabs/soft-hyphens/non-breaking
// spaces as layout artifacts (e.g. "Not\t  for\t  resale"). Collapsing every
// whitespace run to a single space and every hyphen-like character to "-"
// makes downstream regex matching (spell level lines, etc.) reliable.
const normalizeLine = (line: string): string =>
  line
    .replace(/[-­‐-―]+/g, '-')
    .replace(/\s+/g, ' ')
    .trim();

const isPageNumberLine = (line: string): boolean => /^\d{1,4}$/.test(line);

// DECISION: the running footer ("Not for resale... System Reference
// Document 5.1 <page>") repeats on almost every page but ends in a
// different page number each time, so exact-match frequency counting
// would miss it. Stripping trailing digits before counting normalizes
// that variance away without hand-listing the exact footer text.
const BOILERPLATE_FREQUENCY_THRESHOLD = 0.3;

const boilerplateKey = (line: string): string => line.replace(/\d+$/, '').trim();

const findBoilerplateKeys = (pages: { lines: string[] }[]): Set<string> => {
  const counts = new Map<string, number>();

  for (const page of pages) {
    const keysOnPage = new Set(page.lines.map(boilerplateKey));
    for (const key of keysOnPage) {
      if (key.length < 15) continue; // avoid stripping short, legitimately common lines
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }
  }

  const minCount = Math.ceil(pages.length * BOILERPLATE_FREQUENCY_THRESHOLD);
  const boilerplate = new Set<string>();
  for (const [key, count] of counts) {
    if (count >= minCount) boilerplate.add(key);
  }
  return boilerplate;
};

export const cleanPages = (pages: ExtractedPage[]): CleanedPage[] => {
  const normalized = pages.map((page) => ({
    pageNumber: page.pageNumber,
    lines: page.text
      .split('\n')
      .map(normalizeLine)
      .filter((line) => line.length > 0),
  }));

  const boilerplate = findBoilerplateKeys(normalized);

  return normalized.map((page) => ({
    pageNumber: page.pageNumber,
    lines: page.lines.filter(
      (line) => !isPageNumberLine(line) && !boilerplate.has(boilerplateKey(line)),
    ),
  }));
};
