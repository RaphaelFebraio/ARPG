import type { EntityType } from '@grimoire/shared';
import type { CleanedPage } from './text-cleaner.js';

export type RawChunk = {
  content: string;
  entityType: EntityType;
  entityName: string;
  pageStart: number;
  pageEnd: number;
  tokenCount: number;
};

type Line = { text: string; pageNumber: number };

// DECISION: token count is approximated as chars/4 (roughly true for
// English/Portuguese text). We only use it to decide when to split an
// oversized chunk, so an approximation is enough — pulling in a real
// tokenizer for this would be overkill for a local-first MVP.
export const estimateTokenCount = (text: string): number => Math.ceil(text.length / 4);

const STOPWORDS = new Set(['of', 'the', 'a', 'an', 'and', 'or', 'to', 'in', 'on', 'at', 'for', 'as', 'with', 'from']);

const isTitleCaseLine = (line: string): boolean => {
  const words = line.split(' ').filter((w) => w.length > 0);
  if (words.length === 0) return false;

  return words.every((word, index) => {
    if (index > 0 && STOPWORDS.has(word.toLowerCase())) return true;
    const firstChar = word[0] ?? '';
    return /[A-Z]/.test(firstChar);
  });
};

const HEADING_MAX_LENGTH = 60;
const SENTENCE_END = /[.,:;!?]$/;

// DECISION: "Label: value" stat-block lines (Casting Time:, Range:,
// Duration:, ...) are short and Title Case, so without this check they get
// misdetected as headings and truncate the spell block right after
// "Components:". Real entity headings in this document never contain ':'.
const containsColon = (line: string): boolean => line.includes(':');

// DECISION: the monster ability-score header row ("STR DEX CON INT WIS
// CHA") is short and every word capitalized, so it also reads as a heading
// unless excluded — it's the only place this document uses a run of
// all-caps 2-4 letter abbreviations as a standalone line.
const isAllCapsAbbreviationRow = (line: string): boolean => {
  const words = line.split(' ').filter((w) => w.length > 0);
  return words.length > 0 && words.every((w) => w.length <= 4 && w === w.toUpperCase());
};

// DECISION: monster stat blocks label several fields without a colon
// ("Languages Common, Goblin", "Armor Class 20"). Most fail the Title Case
// check because their value is lowercase, but a few — "Languages" followed
// only by capitalized language names — pass by coincidence and truncate
// the monster's block right there. These are the fixed, well-known 5e
// stat-block field names (not copyrighted flavor text), so a denylist on
// the line's leading word(s) is safe to hardcode.
const STAT_BLOCK_LABEL_PREFIXES = [
  'Armor Class',
  'Hit Points',
  'Speed',
  'Saving Throws',
  'Skills',
  'Damage Vulnerabilities',
  'Damage Resistances',
  'Damage Immunities',
  'Condition Immunities',
  'Senses',
  'Languages',
  'Challenge',
];
const isStatBlockLabelLine = (line: string): boolean =>
  STAT_BLOCK_LABEL_PREFIXES.some((prefix) => line === prefix || line.startsWith(`${prefix} `));

// DECISION: without font-size/layout info (pdf-parse only gives us a flat
// text stream), the best signal that a line is a heading — a spell name, a
// monster name, a class feature title — rather than a wrapped body line is
// that it's short, doesn't end mid-sentence, and every significant word is
// capitalized (Title Case). Run-in bolded labels like "Ability Score
// Increase. Your Wisdom score..." are excluded because they end in
// sentence punctuation, so they stay folded into the surrounding chunk.
const isHeadingLine = (line: Line): boolean =>
  line.text.length > 0 &&
  line.text.length <= HEADING_MAX_LENGTH &&
  !SENTENCE_END.test(line.text) &&
  !line.text.startsWith('•') &&
  !containsColon(line.text) &&
  !isAllCapsAbbreviationRow(line.text) &&
  !isStatBlockLabelLine(line.text) &&
  isTitleCaseLine(line.text);

const SPELL_LEVEL_LINE = /^(?:cantrip|[1-9](?:st|nd|rd|th)\s*-?\s*level)\b/i;
const SPELL_CANTRIP_LINE = /cantrip\s*$/i;
// DECISION: a line ending in "cantrip" alone is ambiguous — Warlock
// invocations list a "Prerequisite: ... eldritch blast cantrip" line that
// would otherwise be misread as a spell's school/level line. Real spell
// school lines ("Evocation cantrip") never contain ':', so require that.
const isSpellSignatureLine = (line: string): boolean =>
  SPELL_LEVEL_LINE.test(line) || (SPELL_CANTRIP_LINE.test(line) && !line.includes(':'));

const MONSTER_SIZE_LINE = /^(Tiny|Small|Medium|Large|Huge|Gargantuan)\b/i;
const isMonsterSignatureLine = (line: string): boolean => MONSTER_SIZE_LINE.test(line);

const detectEntityType = (bodyFirstLine: string | undefined): EntityType => {
  if (!bodyFirstLine) return 'rule';
  if (isSpellSignatureLine(bodyFirstLine)) return 'spell';
  if (isMonsterSignatureLine(bodyFirstLine)) return 'monster';
  return 'rule';
};

type Block = {
  heading: string;
  lines: Line[];
};

const splitIntoHeadingBlocks = (lines: Line[]): Block[] => {
  const blocks: Block[] = [];
  let current: Block | null = null;

  for (const line of lines) {
    if (isHeadingLine(line)) {
      if (current) blocks.push(current);
      current = { heading: line.text, lines: [line] };
      continue;
    }

    if (!current) {
      // Content before the first detected heading (title page, license text).
      current = { heading: 'Introduction', lines: [] };
    }
    current.lines.push(line);
  }

  if (current) blocks.push(current);
  return blocks;
};

const OVERLAP_TOKENS = 200;
const MAX_CHUNK_TOKENS = 1500;
// Rough chars-per-token inverse of estimateTokenCount, used to convert the
// overlap/max budgets (given in tokens) back into character slice sizes.
const CHARS_PER_TOKEN = 4;

const splitOversizedContent = (content: string): string[] => {
  const maxChars = MAX_CHUNK_TOKENS * CHARS_PER_TOKEN;
  const overlapChars = OVERLAP_TOKENS * CHARS_PER_TOKEN;

  if (content.length <= maxChars) return [content];

  const parts: string[] = [];
  let start = 0;
  while (start < content.length) {
    const end = Math.min(start + maxChars, content.length);
    parts.push(content.slice(start, end));
    if (end === content.length) break;
    start = end - overlapChars;
  }
  return parts;
};

export const chunkPages = (pages: CleanedPage[]): RawChunk[] => {
  const lines: Line[] = pages.flatMap((page) =>
    page.lines.map((text) => ({ text, pageNumber: page.pageNumber })),
  );

  const blocks = splitIntoHeadingBlocks(lines);
  const chunks: RawChunk[] = [];

  for (const block of blocks) {
    const bodyLines = block.lines.filter((line) => line.text !== block.heading);
    if (bodyLines.length === 0) continue;

    const content = [block.heading, ...bodyLines.map((l) => l.text)].join('\n');
    const pageStart = block.lines[0]?.pageNumber ?? bodyLines[0]?.pageNumber ?? 1;
    const pageEnd = block.lines[block.lines.length - 1]?.pageNumber ?? pageStart;
    const entityType = detectEntityType(bodyLines[0]?.text);

    const parts = splitOversizedContent(content);
    for (const part of parts) {
      chunks.push({
        content: part,
        entityType,
        entityName: block.heading,
        pageStart,
        pageEnd,
        tokenCount: estimateTokenCount(part),
      });
    }
  }

  return chunks;
};
