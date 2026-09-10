import { customType } from 'drizzle-orm/pg-core';

// DECISION: drizzle-orm has no first-class pgvector column type, so we
// define one via customType. Values round-trip as plain number[].
// Usage: vector(768)('embedding')
export const vector = (dimensions: number) =>
  customType<{ data: number[]; driverData: string }>({
    dataType() {
      return `vector(${dimensions})`;
    },
    toDriver(value: number[]): string {
      return `[${value.join(',')}]`;
    },
    fromDriver(value: string): number[] {
      return value
        .slice(1, -1)
        .split(',')
        .map(Number);
    },
  });
