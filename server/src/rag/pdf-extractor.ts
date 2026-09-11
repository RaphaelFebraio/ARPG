import pdf from 'pdf-parse';

export type ExtractedPage = {
  pageNumber: number;
  text: string;
};

type PdfTextItem = { str: string; transform: number[]; hasEOL?: boolean };
type PdfTextContent = { items: PdfTextItem[] };
type PdfPageProxy = { getTextContent: () => Promise<PdfTextContent> };

// DECISION: pdf-parse's default renderer flattens each page into a single
// string, which destroys line boundaries the chunker relies on to detect
// headings (spell names, monster names, section titles). We rebuild lines
// ourselves from the raw text items using their Y-coordinate, which is the
// standard pdf.js technique for reconstructing layout from a text stream.
const reconstructPageText = (items: PdfTextItem[]): string => {
  const lines: string[] = [];
  let currentLine = '';
  let lastY: number | null = null;

  for (const item of items) {
    const y = item.transform[5] ?? 0;

    if (lastY !== null && Math.abs(y - lastY) > 1) {
      lines.push(currentLine.trim());
      currentLine = '';
    }

    const needsSpace = currentLine.length > 0 && !currentLine.endsWith(' ') && !item.str.startsWith(' ');
    currentLine += needsSpace ? ` ${item.str}` : item.str;
    lastY = y;

    if (item.hasEOL) {
      lines.push(currentLine.trim());
      currentLine = '';
      lastY = null;
    }
  }

  if (currentLine.trim().length > 0) {
    lines.push(currentLine.trim());
  }

  return lines.filter((line) => line.length > 0).join('\n');
};

export const extractPdfPages = async (buffer: Buffer): Promise<ExtractedPage[]> => {
  const pages: ExtractedPage[] = [];
  let pageNumber = 0;

  await pdf(buffer, {
    // DECISION: call getTextContent() directly on the page proxy instead of
    // destructuring it first — pdf.js's PDFPageProxy methods rely on `this`
    // being the proxy instance, so a destructured reference throws.
    pagerender: async (pageData: unknown) => {
      pageNumber += 1;
      const page = pageData as PdfPageProxy;
      const textContent = await page.getTextContent();
      const text = reconstructPageText(textContent.items);
      pages.push({ pageNumber, text });
      return text;
    },
  });

  return pages;
};
