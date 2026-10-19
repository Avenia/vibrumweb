import type { CollectionEntry } from 'astro:content';

type Guitar = CollectionEntry<'guitars'>;

/**
 * Sort comparator: newest guitar first.
 *
 * `year` is the primary key. Within a year the entry id breaks the tie —
 * guitar files carry a running number (001-zora, 002-zora-sc, …) that
 * records the order they were added, so a higher number is newer.
 * Without the tiebreaker, same-year guitars kept their file order and
 * the oldest showed first.
 */
export function newestFirst(a: Guitar, b: Guitar): number {
  return b.data.year - a.data.year || b.id.localeCompare(a.id);
}
