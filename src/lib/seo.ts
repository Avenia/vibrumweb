/**
 * Everything that describes the workshop to search engines and link
 * previews: the site constants, the Organization and WebSite records, and
 * builders for the per-page structured data (schema.org JSON-LD).
 *
 * BaseLayout emits the Organization on every page and whatever a page passes
 * in its `schema` prop. A change here (new phone number, another social
 * account) reaches every page at once.
 *
 * Records that carry words or page addresses take the page's language. The
 * site description lives with the other copy, in src/i18n/en.ts and sr.ts.
 */
import type { CollectionEntry } from 'astro:content';
import { LANGS, localizePath, useTranslations, type Lang } from '../i18n';
import { specLabels } from './specLabels';

// `site` from astro.config.mjs — the one place the public URL is written.
const site = import.meta.env.SITE;
if (!site) throw new Error('[seo] `site` is not set in astro.config.mjs');

export const SITE_URL = site.replace(/\/$/, '');
export const SITE_NAME = 'Vibrum Guitars';

// Link-preview image for pages without a photo of their own (1200 × 630,
// the shape Facebook, LinkedIn, Slack and iMessage cards are cut to).
export const DEFAULT_OG_IMAGE = '/images/og-default.png';

// Square logo, referenced as the Organization logo in structured data.
export const LOGO_IMAGE = '/images/og-logo.png';

export const CONTACT = {
  email: 'info@vibrumguitars.com',
  phone: '+38166458888',
  instagram: 'https://www.instagram.com/vibrumguitars',
  facebook: 'https://www.facebook.com/vibrumguitars',
};

export const ORG_ID = `${SITE_URL}/#organization`;
export const WEBSITE_ID = `${SITE_URL}/#website`;

export function absoluteUrl(path: string): string {
  return new URL(path, `${SITE_URL}/`).href;
}

const logo = {
  '@type': 'ImageObject',
  url: absoluteUrl(LOGO_IMAGE),
  width: 1200,
  height: 1200,
};

/** The workshop itself. Emitted on every page; other records point at it by @id. */
export function organization(lang: Lang) {
  return {
    '@type': 'Organization',
    '@id': ORG_ID,
    name: SITE_NAME,
    alternateName: 'Vibrum',
    url: `${SITE_URL}/`,
    logo,
    description: useTranslations(lang).site.description,
    email: CONTACT.email,
    telephone: CONTACT.phone,
    foundingDate: '2022',
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Belgrade',
      addressCountry: 'RS',
    },
    sameAs: [CONTACT.instagram, CONTACT.facebook],
  };
}

/** The site as a whole, in both its languages. Home page only. */
export function website(lang: Lang) {
  return {
    '@type': 'WebSite',
    '@id': WEBSITE_ID,
    url: `${SITE_URL}/`,
    name: SITE_NAME,
    description: useTranslations(lang).site.description,
    publisher: { '@id': ORG_ID },
    inLanguage: LANGS.map(l => useTranslations(l).meta.htmlLang),
  };
}

/** Compact publisher/author reference for articles: Google wants name and logo inline. */
export const publisherRef = {
  '@type': 'Organization',
  '@id': ORG_ID,
  name: SITE_NAME,
  logo,
};

/** A simple page record (AboutPage, ContactPage, …) tied to the site. `path` is the English path. */
export function webPage(type: string, name: string, path: string, lang: Lang, extra: object = {}) {
  return {
    '@type': type,
    name,
    url: absoluteUrl(localizePath(path, lang)),
    isPartOf: { '@id': WEBSITE_ID },
    inLanguage: useTranslations(lang).meta.htmlLang,
    ...extra,
  };
}

/**
 * URL slug of a guitar: its entry id without the running number that orders
 * the files ("003-pyrocaster" → "pyrocaster"). Two guitars whose names only
 * differ by that number would collide; the guitar page build checks for it.
 */
export function guitarSlug(id: string): string {
  return id.replace(/^\d+-/, '');
}

/** Path of a guitar's own page. */
export function guitarPath(id: string, lang: Lang): string {
  return localizePath(`/guitars/${guitarSlug(id)}/`, lang);
}

export function guitarUrl(id: string, lang: Lang): string {
  return absoluteUrl(guitarPath(id, lang));
}

/**
 * Fragment that opens a guitar's quick view on the current page: GuitarModal
 * opens on load when the URL carries it, and a plain click on a trigger
 * pushes the same hash. As the href of the trigger links, it means a
 * middle-click or Cmd/Ctrl-click lands in a new tab exactly where a plain
 * click lands in this one: the same page, modal open on that guitar.
 */
export function guitarModalHash(id: string): string {
  return `#guitar-${id}`;
}

/** One entry of the gallery's list: name and link only, the page carries the rest. */
export function guitarListItem(g: CollectionEntry<'guitars'>, position: number, lang: Lang) {
  return {
    '@type': 'ListItem',
    position,
    name: g.data.title,
    url: guitarUrl(g.id, lang),
  };
}

/**
 * A guitar as a schema.org Product, for its own page. No price, so no
 * `offers`: an Offer without one fails Google's validation. `g` is the
 * guitar in the page's language (src/i18n/content.ts).
 */
export function guitarProduct(g: CollectionEntry<'guitars'>, lang: Lang) {
  const { typeLabels, guitarNoun, fieldLabels } = specLabels(lang);
  const specs = g.data.specs ?? {};
  const materials = [...new Set(Object.values(specs.materials ?? {}).filter(Boolean))];
  const additionalProperty = Object.values(specs).flatMap(group =>
    Object.entries(group ?? {})
      .filter(([, value]) => value !== undefined && value !== null)
      .map(([key, value]) => ({
        '@type': 'PropertyValue',
        name: fieldLabels[key] ?? key,
        value: String(value),
      }))
  );

  return {
    '@type': 'Product',
    '@id': guitarUrl(g.id, lang),
    name: g.data.title,
    url: guitarUrl(g.id, lang),
    image: [g.data.coverImage, ...g.data.images].map(absoluteUrl),
    description: g.data.excerpt,
    category: `${typeLabels[g.data.type] ?? g.data.type} ${guitarNoun}`,
    brand: { '@type': 'Brand', name: SITE_NAME },
    manufacturer: { '@id': ORG_ID },
    productionDate: String(g.data.year),
    countryOfOrigin: 'RS',
    ...(materials.length > 0 && { material: materials.join(', ') }),
    ...(additionalProperty.length > 0 && { additionalProperty }),
  };
}

/**
 * Serialise for a <script type="application/ld+json">. Adds the schema.org
 * context and escapes `<`, so no text from a content file can close the tag.
 */
export function jsonLd(data: object): string {
  return JSON.stringify({ '@context': 'https://schema.org', ...data }).replace(/</g, '\\u003c');
}
