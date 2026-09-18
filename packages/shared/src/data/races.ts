import type { Race } from './types.js';

// DECISION: every field here was transcribed from the actual ingested
// SRD 5.1 text (server/src/rag — rule_chunks table), not from memory, to
// avoid mixing in PHB-exclusive content. The SRD 5.1 also only includes
// ONE subrace per race (no Mountain Dwarf, Wood Elf, Stout Halfling, or
// Forest Gnome) — verified against the raw document, not a data-entry gap.
export const RACES: Race[] = [
  {
    id: 'dwarf',
    name: 'Dwarf',
    size: 'Medium',
    speed: 25,
    abilityBonuses: [{ type: 'fixed', ability: 'con', amount: 2 }],
    languages: ['Common', 'Dwarvish'],
    traits: [
      { name: 'Darkvision', description: 'Você enxerga na penumbra a 60 pés como se fosse luz plena, e na escuridão como se fosse penumbra (sem cor, só tons de cinza).' },
      { name: 'Dwarven Resilience', description: 'Vantagem em testes de resistência contra veneno, e resistência a dano de veneno.' },
      { name: 'Dwarven Combat Training', description: 'Proficiência com machado de batalha, machadinha, martelo leve e martelo de guerra.' },
      { name: 'Tool Proficiency', description: 'Proficiência com um tipo de ferramenta de artesão à sua escolha: ferramentas de ferreiro, suprimentos de cervejeiro ou ferramentas de pedreiro.' },
      { name: 'Stonecunning', description: 'Dobra o bônus de proficiência em testes de Inteligência (História) relacionados à origem de trabalhos em pedra.' },
    ],
    subraces: [
      {
        id: 'hill-dwarf',
        name: 'Hill Dwarf',
        abilityBonuses: [{ type: 'fixed', ability: 'wis', amount: 1 }],
        traits: [
          { name: 'Dwarven Toughness', description: 'Seu máximo de pontos de vida aumenta em 1, e mais 1 a cada nível que você ganhar.' },
        ],
      },
    ],
  },
  {
    id: 'elf',
    name: 'Elf',
    size: 'Medium',
    speed: 30,
    abilityBonuses: [{ type: 'fixed', ability: 'dex', amount: 2 }],
    languages: ['Common', 'Elvish'],
    traits: [
      { name: 'Darkvision', description: 'Você enxerga na penumbra a 60 pés como se fosse luz plena, e na escuridão como se fosse penumbra (sem cor, só tons de cinza).' },
      { name: 'Keen Senses', description: 'Proficiência na perícia Percepção.' },
      { name: 'Fey Ancestry', description: 'Vantagem em testes de resistência contra ser enfeitiçado, e magia não pode fazer você dormir.' },
      { name: 'Trance', description: 'Elfos não precisam dormir — meditam profundamente por 4 horas ao dia, obtendo o mesmo benefício que um humano tira de 8 horas de sono.' },
    ],
    subraces: [
      {
        id: 'high-elf',
        name: 'High Elf',
        abilityBonuses: [{ type: 'fixed', ability: 'int', amount: 1 }],
        traits: [
          { name: 'Elf Weapon Training', description: 'Proficiência com espada longa, espada curta, arco curto e arco longo.' },
          { name: 'Cantrip', description: 'Você conhece um truque à sua escolha da lista de magias do mago. Inteligência é sua habilidade de conjuração para ele.' },
          { name: 'Extra Language', description: 'Você fala, lê e escreve mais um idioma à sua escolha.' },
        ],
      },
    ],
  },
  {
    id: 'halfling',
    name: 'Halfling',
    size: 'Small',
    speed: 25,
    abilityBonuses: [{ type: 'fixed', ability: 'dex', amount: 2 }],
    languages: ['Common', 'Halfling'],
    traits: [
      { name: 'Lucky', description: 'Ao tirar 1 num d20 em ataque, teste de habilidade ou resistência, você pode rolar novamente e deve usar o novo resultado.' },
      { name: 'Brave', description: 'Vantagem em testes de resistência contra ficar amedrontado.' },
      { name: 'Halfling Nimbleness', description: 'Você pode se mover através do espaço de qualquer criatura de tamanho maior que o seu.' },
    ],
    subraces: [
      {
        id: 'lightfoot',
        name: 'Lightfoot',
        abilityBonuses: [{ type: 'fixed', ability: 'cha', amount: 1 }],
        traits: [
          { name: 'Naturally Stealthy', description: 'Você pode tentar se esconder mesmo estando encoberto apenas por uma criatura pelo menos um tamanho maior que você.' },
        ],
      },
    ],
  },
  {
    id: 'human',
    name: 'Human',
    size: 'Medium',
    speed: 30,
    abilityBonuses: [{ type: 'all', amount: 1 }],
    languages: ['Common', '+1 idioma à escolha'],
    traits: [],
    subraces: [],
  },
  {
    id: 'dragonborn',
    name: 'Dragonborn',
    size: 'Medium',
    speed: 30,
    abilityBonuses: [
      { type: 'fixed', ability: 'str', amount: 2 },
      { type: 'fixed', ability: 'cha', amount: 1 },
    ],
    languages: ['Common', 'Draconic'],
    traits: [
      { name: 'Draconic Ancestry', description: 'Escolha um tipo de dragão para sua ascendência — determina o tipo de dano da sua arma de sopro e resistência a dano.' },
      { name: 'Breath Weapon', description: 'Você pode usar sua ação para exalar energia destrutiva, conforme sua ascendência dracônica.' },
      { name: 'Damage Resistance', description: 'Resistência ao tipo de dano associado à sua ascendência dracônica.' },
    ],
    subraces: [],
  },
  {
    id: 'gnome',
    name: 'Gnome',
    size: 'Small',
    speed: 25,
    abilityBonuses: [{ type: 'fixed', ability: 'int', amount: 2 }],
    languages: ['Common', 'Gnomish'],
    traits: [
      { name: 'Darkvision', description: 'Você enxerga na penumbra a 60 pés como se fosse luz plena, e na escuridão como se fosse penumbra (sem cor, só tons de cinza).' },
      { name: 'Gnome Cunning', description: 'Vantagem em todos os testes de resistência de Inteligência, Sabedoria e Carisma contra magia.' },
    ],
    subraces: [
      {
        id: 'rock-gnome',
        name: 'Rock Gnome',
        abilityBonuses: [{ type: 'fixed', ability: 'con', amount: 1 }],
        traits: [
          { name: "Artificer's Lore", description: 'Dobra o bônus de proficiência em testes de Inteligência (História) relacionados a itens mágicos, objetos alquímicos ou dispositivos tecnológicos.' },
          { name: 'Tinker', description: 'Proficiência com ferramentas de artesão (ferramentas de mecânico); você pode construir pequenos dispositivos de relojoaria.' },
        ],
      },
    ],
  },
  {
    id: 'half-elf',
    name: 'Half-Elf',
    size: 'Medium',
    speed: 30,
    abilityBonuses: [
      { type: 'fixed', ability: 'cha', amount: 2 },
      { type: 'choose', count: 2, amount: 1, excluding: ['cha'] },
    ],
    languages: ['Common', 'Elvish', '+1 idioma à escolha'],
    traits: [
      { name: 'Darkvision', description: 'Você enxerga na penumbra a 60 pés como se fosse luz plena, e na escuridão como se fosse penumbra (sem cor, só tons de cinza).' },
      { name: 'Fey Ancestry', description: 'Vantagem em testes de resistência contra ser enfeitiçado, e magia não pode fazer você dormir.' },
      { name: 'Skill Versatility', description: 'Você ganha proficiência em duas perícias à sua escolha.' },
    ],
    subraces: [],
  },
  {
    id: 'half-orc',
    name: 'Half-Orc',
    size: 'Medium',
    speed: 30,
    abilityBonuses: [
      { type: 'fixed', ability: 'str', amount: 2 },
      { type: 'fixed', ability: 'con', amount: 1 },
    ],
    languages: ['Common', 'Orc'],
    traits: [
      { name: 'Darkvision', description: 'Você enxerga na penumbra a 60 pés como se fosse luz plena, e na escuridão como se fosse penumbra (sem cor, só tons de cinza).' },
      { name: 'Menacing', description: 'Proficiência na perícia Intimidação.' },
      { name: 'Relentless Endurance', description: 'Ao ser reduzido a 0 pontos de vida sem morrer, você pode cair para 1 ponto de vida em vez disso (uma vez por descanso longo).' },
      { name: 'Savage Attacks', description: 'Ao acertar um crítico com arma corpo a corpo, você pode rolar um dado de dano da arma adicional e somar ao dano extra do crítico.' },
    ],
    subraces: [],
  },
  {
    id: 'tiefling',
    name: 'Tiefling',
    size: 'Medium',
    speed: 30,
    abilityBonuses: [
      { type: 'fixed', ability: 'int', amount: 1 },
      { type: 'fixed', ability: 'cha', amount: 2 },
    ],
    languages: ['Common', 'Infernal'],
    traits: [
      { name: 'Darkvision', description: 'Você enxerga na penumbra a 60 pés como se fosse luz plena, e na escuridão como se fosse penumbra (sem cor, só tons de cinza).' },
      { name: 'Hellish Resistance', description: 'Resistência a dano de fogo.' },
      { name: 'Infernal Legacy', description: 'Você conhece o truque taumaturgia. No nível 3, pode conjurar convocar castigo infernal uma vez por descanso longo; no nível 5, trevas uma vez por descanso longo. Carisma é sua habilidade de conjuração.' },
    ],
    subraces: [],
  },
];
