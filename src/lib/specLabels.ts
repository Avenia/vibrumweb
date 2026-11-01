// Display labels for the `specs` frontmatter in the guitars collection, per
// language. Shared by every place that renders a spec table, so a new field
// in src/content.config.ts only needs a label added here, in both languages.
import type { Lang } from '../i18n';

interface SpecLabels {
  // Instrument types from the `type` frontmatter field, as shown to people
  // (image alt text) and to search engines (Product category).
  typeLabels: Record<string, string>;
  // The word that follows the type: "electric guitar", "električna gitara".
  guitarNoun: string;
  sectionLabels: Record<string, string>;
  fieldLabels: Record<string, string>;
}

const en: SpecLabels = {
  typeLabels: {
    electric: 'Electric',
    acoustic: 'Acoustic',
    bass: 'Bass',
    jazz: 'Jazz',
    classical: 'Classical',
  },
  guitarNoun: 'guitar',
  sectionLabels: {
    materials: 'Materials',
    technical: 'Technical',
    hardware: 'Hardware',
    // Older section names, kept so any existing entry still renders
    body: 'Body',
    neck: 'Neck',
    fingerboard: 'Fingerboard',
    electronics: 'Electronics',
  },
  fieldLabels: {
    // Materials
    top: 'Top', top_and_bracing: 'Top and Bracing',
    base: 'Base', back_and_sides: 'Back and Sides',
    neck: 'Neck', fretboard: 'Fingerboard',
    headstock_top: 'Headstock Top', pickguard: 'Pickguard', pins: 'Pins',
    fretmarkers: 'Fret Markers', details: 'Details',
    nut: 'Nut', saddle: 'Saddle', nut_and_saddle: 'Nut and Saddle',
    binding: 'Binding', finish: 'Finish',
    // Technical
    body_shape: 'Body Shape', scale: 'Scale Length', nut_width: 'Nut Width',
    radius: 'Fingerboard Radius', neck_profile: 'Neck Profile',
    frets: 'Frets', weight: 'Weight',
    // Hardware
    pickups: 'Pickups', bridge: 'Bridge', tailpiece: 'Tailpiece',
    pots: 'Pots', controls: 'Controls', switch: 'Switch',
    tuners: 'Tuners', neck_plate: 'Neck Plate', strap_locks: 'Strap Locks',
    output: 'Output Jack',
    // Older field names, kept so any existing entry still renders
    wood: 'Wood', profile: 'Profile', inlays: 'Inlays',
  },
};

const sr: SpecLabels = {
  typeLabels: {
    electric: 'Električna',
    acoustic: 'Akustična',
    bass: 'Bas',
    jazz: 'Džez',
    classical: 'Klasična',
  },
  guitarNoun: 'gitara',
  sectionLabels: {
    materials: 'Materijali',
    technical: 'Tehnički podaci',
    hardware: 'Hardver',
    body: 'Telo',
    neck: 'Vrat',
    fingerboard: 'Prstnica',
    electronics: 'Elektronika',
  },
  fieldLabels: {
    // Materials
    top: 'Gornja ploča', top_and_bracing: 'Gornja ploča i rebra',
    base: 'Telo', back_and_sides: 'Dno i stranice',
    neck: 'Vrat', fretboard: 'Prstnica',
    headstock_top: 'Ploča glave', pickguard: 'Štitnik', pins: 'Čivije',
    fretmarkers: 'Markeri', details: 'Detalji',
    nut: 'Gornji prag', saddle: 'Donji prag', nut_and_saddle: 'Gornji i donji prag',
    binding: 'Obrub', finish: 'Završna obrada',
    // Technical
    body_shape: 'Oblik tela', scale: 'Menzura', nut_width: 'Širina gornjeg praga',
    radius: 'Radijus prstnice', neck_profile: 'Profil vrata',
    frets: 'Pragovi', weight: 'Težina',
    // Hardware
    pickups: 'Magneti', bridge: 'Kobilica', tailpiece: 'Repnik',
    pots: 'Potenciometri', controls: 'Kontrole', switch: 'Prekidač',
    tuners: 'Mašinice', neck_plate: 'Pločica vrata', strap_locks: 'Brave za kaiš',
    output: 'Izlazni džek',
    wood: 'Drvo', profile: 'Profil', inlays: 'Intarzije',
  },
};

const labels = { en, sr };

export function specLabels(lang: Lang): SpecLabels {
  return labels[lang];
}

/** "electric guitar" / "električna gitara", for alt text. */
export function guitarKind(type: string, lang: Lang): string {
  const { typeLabels, guitarNoun } = labels[lang];
  return `${(typeLabels[type] ?? type).toLowerCase()} ${guitarNoun}`;
}
