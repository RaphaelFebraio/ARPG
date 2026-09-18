import type { Background } from './types.js';

// DECISION: the SRD 5.1 (Creative Commons) only publishes ONE full
// background — Acolyte. The other 12 PHB backgrounds (Criminal, Soldier,
// Sage, ...) are exclusive to the paid Player's Handbook and are
// deliberately not included here — see the copyright restriction in the
// project's own README/ARCHITECTURE. Verified against the actual ingested
// SRD text: after Acolyte's write-up, the document jumps straight to
// general equipment rules with no other background entries.
export const BACKGROUNDS: Background[] = [
  {
    id: 'acolyte',
    name: 'Acolyte',
    skillProficiencies: ['insight', 'religion'],
    equipment: [
      'Holy symbol',
      'Prayer book or prayer wheel',
      '5 sticks of incense',
      'Vestments',
      'Common clothes',
      "Pouch with 15 gp",
    ],
    feature: {
      name: 'Shelter of the Faithful',
      description:
        'Você e seus companheiros de aventura podem receber cura e cuidados gratuitos em um templo, santuário ou outro local ligado à sua fé. Aqueles que compartilham sua religião te apoiarão (só a você) em um estilo de vida modesto.',
    },
  },
];
