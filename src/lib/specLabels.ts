// Display labels for the `specs` frontmatter in the guitars collection.
// Shared by every place that renders a spec table, so a new field in
// src/content/config.ts only needs a label added here.

export const sectionLabels: Record<string, string> = {
  materials: 'Materials',
  technical: 'Technical',
  hardware: 'Hardware',
  // Older section names, kept so any existing entry still renders
  body: 'Body',
  neck: 'Neck',
  fingerboard: 'Fingerboard',
  electronics: 'Electronics',
};

export const fieldLabels: Record<string, string> = {
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
};
