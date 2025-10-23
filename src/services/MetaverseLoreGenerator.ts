/**
 * Metaverse Lore Generator
 * Generates coherent backstories and flavor text for NFT creatures and objects
 * Ensures all items belong to the same metaverse with interconnected lore
 */

export interface MetaverseTheme {
  name: string;
  description: string;
  era: 'Ancient' | 'Medieval' | 'Industrial' | 'Digital' | 'Cosmic' | 'Post-Apocalyptic';
  elements: string[];
  tone: 'Dark' | 'Light' | 'Neutral' | 'Mystical' | 'Technological' | 'Natural';
}

export interface CreatureLore {
  name: string;
  species: string;
  origin: string;
  backstory: string;
  personality: string[];
  abilities: string[];
  flavorText: string;
  connections: string[]; // References to other creatures/objects
  relics: string[]; // Connected items/objects
  metaverseRole: string;
  historicalSignificance: string;
}

export interface ObjectLore {
  name: string;
  type: string;
  origin: string;
  backstory: string;
  powers: string[];
  flavorText: string;
  previousOwners: string[];
  connections: string[]; // References to creatures/events
  metaverseRole: string;
  legendaryStatus: string;
}

export interface MetaverseWorld {
  name: string;
  theme: MetaverseTheme;
  factions: Faction[];
  locations: Location[];
  historicalEvents: HistoricalEvent[];
  magicSystem?: MagicSystem;
  technology?: TechnologyLevel;
}

export interface Faction {
  name: string;
  description: string;
  alignment: 'Order' | 'Chaos' | 'Neutral' | 'Balance';
  goals: string[];
  rivals: string[];
  allies: string[];
}

export interface Location {
  name: string;
  description: string;
  biome: string;
  significance: string;
  connectedLocations: string[];
}

export interface HistoricalEvent {
  name: string;
  era: string;
  description: string;
  participants: string[];
  consequences: string[];
  relatedArtifacts: string[];
}

export interface MagicSystem {
  type: 'Elemental' | 'Cosmic' | 'Data' | 'Quantum' | 'Void' | 'Light';
  sources: string[];
  limitations: string[];
}

export interface TechnologyLevel {
  era: string;
  capabilities: string[];
  restrictions: string[];
}

/**
 * Main Lore Generator Class
 */
export class MetaverseLoreGenerator {
  private world: MetaverseWorld;
  private existingLore: Map<string, CreatureLore | ObjectLore> = new Map();
  private nameRegistry: Set<string> = new Set();
  private thematicElements: string[] = [];

  constructor(worldConfig?: Partial<MetaverseWorld>) {
    this.world = this.initializeWorld(worldConfig);
    this.thematicElements = this.generateThematicElements();
  }

  /**
   * Initialize the metaverse world with default or custom configuration
   */
  private initializeWorld(config?: Partial<MetaverseWorld>): MetaverseWorld {
    const defaultWorld: MetaverseWorld = {
      name: 'LightDom Metaverse',
      theme: {
        name: 'Digital Enlightenment',
        description: 'A vast digital realm where data becomes reality and optimization is power',
        era: 'Digital',
        elements: ['Data', 'Light', 'Code', 'Optimization', 'Space', 'Blockchain'],
        tone: 'Technological'
      },
      factions: [
        {
          name: 'The Optimizers',
          description: 'Masters of DOM manipulation and space harvesting',
          alignment: 'Order',
          goals: ['Perfect efficiency', 'Data preservation', 'Code enlightenment'],
          rivals: ['The Bloat Collective'],
          allies: ['The Hash Guild']
        },
        {
          name: 'The Hash Guild',
          description: 'Guardians of blockchain integrity and proof verification',
          alignment: 'Neutral',
          goals: ['Maintain consensus', 'Protect the chain', 'Verify truth'],
          rivals: [],
          allies: ['The Optimizers']
        },
        {
          name: 'The Bloat Collective',
          description: 'Entities that thrive on redundant data and unused space',
          alignment: 'Chaos',
          goals: ['Accumulate space', 'Preserve inefficiency', 'Resist optimization'],
          rivals: ['The Optimizers'],
          allies: []
        },
        {
          name: 'The Metaverse Architects',
          description: 'Builders and creators of digital worlds and structures',
          alignment: 'Balance',
          goals: ['Create beauty', 'Build infrastructure', 'Design harmony'],
          rivals: [],
          allies: ['The Optimizers', 'The Hash Guild']
        }
      ],
      locations: [
        {
          name: 'The Optimization Nexus',
          description: 'A crystalline structure where optimal code converges into pure light',
          biome: 'Digital',
          significance: 'Birthplace of the first optimization algorithms',
          connectedLocations: ['The Data Plains', 'Hash Mountains']
        },
        {
          name: 'Hash Mountains',
          description: 'Towering peaks of cryptographic complexity where blocks are forged',
          biome: 'Blockchain',
          significance: 'Where proof-of-optimization is validated',
          connectedLocations: ['The Optimization Nexus', 'Memory Valleys']
        },
        {
          name: 'The Data Plains',
          description: 'Endless fields of flowing information waiting to be harvested',
          biome: 'Data',
          significance: 'Primary source of harvestable DOM space',
          connectedLocations: ['The Optimization Nexus', 'Cache Forests']
        },
        {
          name: 'Cache Forests',
          description: 'Dense woodlands of temporary storage and fleeting memories',
          biome: 'Memory',
          significance: 'Where lost data finds temporary refuge',
          connectedLocations: ['The Data Plains', 'Memory Valleys']
        },
        {
          name: 'Memory Valleys',
          description: 'Deep canyons carved by the flow of stored information',
          biome: 'Storage',
          significance: 'Ancient repository of metaverse history',
          connectedLocations: ['Hash Mountains', 'Cache Forests']
        }
      ],
      historicalEvents: [
        {
          name: 'The Great Optimization',
          era: 'Foundation Age',
          description: 'When the first harvesters discovered how to convert DOM space into tangible value',
          participants: ['First Optimizers', 'Ancient Code Entities'],
          consequences: ['Birth of DSH token', 'Formation of The Optimizers faction'],
          relatedArtifacts: ['Primordial Optimizer', 'First Block']
        },
        {
          name: 'The Bloat Wars',
          era: 'Chaos Age',
          description: 'A conflict between efficiency and excess that shaped the metaverse',
          participants: ['The Optimizers', 'The Bloat Collective'],
          consequences: ['Establishment of optimization protocols', 'Creation of defensive tools'],
          relatedArtifacts: ['Bloat Repeller', 'Optimization Blade']
        },
        {
          name: 'The Hash Convergence',
          era: 'Consensus Age',
          description: 'When all factions agreed to use blockchain verification as ultimate truth',
          participants: ['All Factions'],
          consequences: ['Formation of The Hash Guild', 'Blockchain became law'],
          relatedArtifacts: ['Consensus Crystal', 'Chain of Truth']
        }
      ],
      magicSystem: {
        type: 'Data',
        sources: ['DOM Space', 'Blockchain Energy', 'Optimization Power', 'Hash Energy'],
        limitations: ['Must follow code logic', 'Requires proof verification', 'Gas fees apply']
      },
      technology: {
        era: 'Post-Digital Revolution',
        capabilities: ['Space harvesting', 'Blockchain manipulation', 'Reality coding', 'Metaverse construction'],
        restrictions: ['Consensus required', 'Limited by computational power', 'Bound by smart contracts']
      }
    };

    return { ...defaultWorld, ...config };
  }

  /**
   * Generate thematic elements for coherent lore
   */
  private generateThematicElements(): string[] {
    return [
      ...this.world.theme.elements,
      ...this.world.factions.map(f => f.name),
      ...this.world.locations.map(l => l.name),
      ...this.world.historicalEvents.map(e => e.name)
    ];
  }

  /**
   * Generate unique creature lore
   */
  public generateCreatureLore(params: {
    category: 'Companion' | 'Mount' | 'Guardian' | 'Harvester' | 'Mystical' | 'Mechanical';
    rarity: 'Common' | 'Uncommon' | 'Rare' | 'Epic' | 'Legendary' | 'Mythical';
    primaryAttribute: 'Mining' | 'Speed' | 'Defense' | 'Magic' | 'Intelligence' | 'Charm';
    customName?: string;
  }): CreatureLore {
    const name = params.customName || this.generateUniqueName('creature', params.category, params.rarity);

    // Get related faction and location based on rarity
    const faction = this.selectFaction(params.rarity);
    const location = this.selectLocation(params.category);
    const historicalEvent = this.selectHistoricalEvent(params.rarity);

    const species = this.generateSpecies(params.category, params.rarity);
    const origin = this.generateOrigin(location, faction, historicalEvent);
    const backstory = this.generateBackstory(name, species, origin, faction, params.category, params.rarity);
    const personality = this.generatePersonality(params.category, params.primaryAttribute);
    const abilities = this.generateAbilities(params.category, params.primaryAttribute, params.rarity);
    const flavorText = this.generateFlavorText('creature', name, backstory, params.rarity);
    const connections = this.generateConnections('creature', faction);
    const relics = this.generateRelatedRelics(params.category, params.rarity);
    const metaverseRole = this.generateMetaverseRole(params.category, faction);
    const historicalSignificance = this.generateHistoricalSignificance(params.rarity, historicalEvent);

    const lore: CreatureLore = {
      name,
      species,
      origin,
      backstory,
      personality,
      abilities,
      flavorText,
      connections,
      relics,
      metaverseRole,
      historicalSignificance
    };

    this.existingLore.set(name, lore);
    return lore;
  }

  /**
   * Generate unique object lore
   */
  public generateObjectLore(params: {
    category: 'Tool' | 'Weapon' | 'Armor' | 'Artifact' | 'Vehicle' | 'Building';
    rarity: 'Common' | 'Uncommon' | 'Rare' | 'Epic' | 'Legendary' | 'Mythical';
    primaryPower: 'Mining' | 'Combat' | 'Defense' | 'Utility' | 'Enhancement' | 'Creation';
    customName?: string;
  }): ObjectLore {
    const name = params.customName || this.generateUniqueName('object', params.category, params.rarity);

    const faction = this.selectFaction(params.rarity);
    const location = this.selectLocation(params.category);
    const historicalEvent = this.selectHistoricalEvent(params.rarity);

    const type = this.generateObjectType(params.category, params.rarity);
    const origin = this.generateOrigin(location, faction, historicalEvent);
    const backstory = this.generateObjectBackstory(name, type, origin, faction, params.category, params.rarity);
    const powers = this.generateObjectPowers(params.category, params.primaryPower, params.rarity);
    const flavorText = this.generateFlavorText('object', name, backstory, params.rarity);
    const previousOwners = this.generatePreviousOwners(params.rarity, faction);
    const connections = this.generateConnections('object', faction);
    const metaverseRole = this.generateObjectMetaverseRole(params.category, faction);
    const legendaryStatus = this.generateLegendaryStatus(params.rarity, historicalEvent);

    const lore: ObjectLore = {
      name,
      type,
      origin,
      backstory,
      powers,
      flavorText,
      previousOwners,
      connections,
      metaverseRole,
      legendaryStatus
    };

    this.existingLore.set(name, lore);
    return lore;
  }

  /**
   * Generate a unique name
   */
  private generateUniqueName(entityType: 'creature' | 'object', category: string, rarity: string): string {
    const prefixes = {
      Common: ['Basic', 'Simple', 'Common', 'Standard'],
      Uncommon: ['Enhanced', 'Improved', 'Advanced', 'Superior'],
      Rare: ['Rare', 'Exceptional', 'Refined', 'Masterwork'],
      Epic: ['Epic', 'Legendary', 'Ancient', 'Mythic'],
      Legendary: ['Primordial', 'Celestial', 'Divine', 'Eternal'],
      Mythical: ['Cosmic', 'Transcendent', 'Omnipotent', 'Absolute']
    };

    const creatureNames = {
      Companion: ['Byte Buddy', 'Code Cat', 'Hash Hound', 'Data Dog', 'Pixel Pal'],
      Mount: ['Cyber Steed', 'Data Drake', 'Hash Hawk', 'Code Charger', 'Blockchain Beast'],
      Guardian: ['Memory Sentinel', 'Cache Keeper', 'Firewall Phoenix', 'Protocol Protector'],
      Harvester: ['Space Reaper', 'DOM Devourer', 'Optimization Owl', 'Efficiency Eagle'],
      Mystical: ['Oracle Entity', 'Quantum Quetzal', 'Ethereal Enigma', 'Void Visitor'],
      Mechanical: ['Auto-Optimizer', 'Mech Miner', 'Robo Refiner', 'Tech Titan']
    };

    const objectNames = {
      Tool: ['Optimizer', 'Harvester', 'Analyzer', 'Compiler', 'Refiner'],
      Weapon: ['Blade', 'Sword', 'Spear', 'Cannon', 'Destroyer'],
      Armor: ['Shield', 'Plate', 'Guard', 'Barrier', 'Aegis'],
      Artifact: ['Crystal', 'Orb', 'Relic', 'Tome', 'Talisman'],
      Vehicle: ['Rider', 'Flyer', 'Cruiser', 'Transport', 'Vessel'],
      Building: ['Tower', 'Fortress', 'Sanctuary', 'Nexus', 'Citadel']
    };

    const prefix = prefixes[rarity as keyof typeof prefixes][Math.floor(Math.random() * 4)];
    const baseName = entityType === 'creature'
      ? creatureNames[category as keyof typeof creatureNames][Math.floor(Math.random() * 5)]
      : objectNames[category as keyof typeof objectNames][Math.floor(Math.random() * 5)];

    let name = `${prefix} ${baseName}`;
    let counter = 1;

    while (this.nameRegistry.has(name)) {
      name = `${prefix} ${baseName} ${counter}`;
      counter++;
    }

    this.nameRegistry.add(name);
    return name;
  }

  /**
   * Helper methods
   */
  private selectFaction(rarity: string): Faction {
    const rarityIndex = ['Common', 'Uncommon', 'Rare', 'Epic', 'Legendary', 'Mythical'].indexOf(rarity);
    const factionIndex = Math.min(rarityIndex % this.world.factions.length, this.world.factions.length - 1);
    return this.world.factions[factionIndex];
  }

  private selectLocation(category: string): Location {
    const locationMap: Record<string, number> = {
      Companion: 0, Tool: 0,
      Mount: 1, Weapon: 1,
      Guardian: 2, Armor: 2,
      Harvester: 3, Artifact: 3,
      Mystical: 4, Vehicle: 4,
      Mechanical: 0, Building: 0
    };
    const index = locationMap[category] || 0;
    return this.world.locations[index % this.world.locations.length];
  }

  private selectHistoricalEvent(rarity: string): HistoricalEvent {
    const rarityIndex = ['Common', 'Uncommon', 'Rare', 'Epic', 'Legendary', 'Mythical'].indexOf(rarity);
    const eventIndex = Math.min(rarityIndex % this.world.historicalEvents.length, this.world.historicalEvents.length - 1);
    return this.world.historicalEvents[eventIndex];
  }

  private generateSpecies(category: string, rarity: string): string {
    const speciesTemplates = {
      Companion: ['Digital Familiar', 'Data Entity', 'Code Creature', 'Byte Being'],
      Mount: ['Cyber Beast', 'Hash Creature', 'Blockchain Entity', 'Data Dragon'],
      Guardian: ['Sentinel Construct', 'Protective Entity', 'Defense Daemon', 'Guard Program'],
      Harvester: ['Optimization Entity', 'Harvesting Construct', 'Efficiency Being', 'Mining Creature'],
      Mystical: ['Ethereal Entity', 'Quantum Being', 'Void Creature', 'Cosmic Construct'],
      Mechanical: ['Automated Construct', 'Robotic Entity', 'Mechanical Being', 'Tech Creation']
    };

    return speciesTemplates[category as keyof typeof speciesTemplates][
      Math.floor(Math.random() * 4)
    ];
  }

  private generateOrigin(location: Location, faction: Faction, event: HistoricalEvent): string {
    return `Forged in ${location.name} by ${faction.name} during ${event.name}`;
  }

  private generateBackstory(
    name: string,
    species: string,
    origin: string,
    faction: Faction,
    category: string,
    rarity: string
  ): string {
    const templates = [
      `${name}, a magnificent ${species}, was ${origin.toLowerCase()}. Born from the energies of ${faction.name}, it has served the cause of ${faction.goals[0]} for generations.`,
      `Legends speak of ${name}, the ${species} that emerged during turbulent times. ${origin}. This creature embodies the spirit of ${faction.goals[1] || faction.goals[0]}.`,
      `In the annals of metaverse history, ${name} stands as a testament to the power of ${species}. ${origin}, it now seeks to fulfill its destiny.`
    ];

    return templates[Math.floor(Math.random() * templates.length)];
  }

  private generateObjectBackstory(
    name: string,
    type: string,
    origin: string,
    faction: Faction,
    category: string,
    rarity: string
  ): string {
    const templates = [
      `${name}, a legendary ${type}, was ${origin.toLowerCase()}. Wielded by champions of ${faction.name}, it has shaped the destiny of the metaverse.`,
      `The ${name} is more than just a ${type}—it is a symbol of ${faction.goals[0]}. ${origin}, it has passed through countless hands.`,
      `Few artifacts match the power of ${name}. ${origin}, this ${type} contains the essence of ${faction.name}'s ideals.`
    ];

    return templates[Math.floor(Math.random() * templates.length)];
  }

  private generatePersonality(category: string, attribute: string): string[] {
    const traits = {
      Mining: ['Industrious', 'Methodical', 'Persistent'],
      Speed: ['Agile', 'Swift', 'Energetic'],
      Defense: ['Protective', 'Steadfast', 'Loyal'],
      Magic: ['Mystical', 'Wise', 'Enigmatic'],
      Intelligence: ['Clever', 'Analytical', 'Curious'],
      Charm: ['Charismatic', 'Friendly', 'Inspiring']
    };

    return traits[attribute as keyof typeof traits] || ['Unique', 'Special', 'Remarkable'];
  }

  private generateAbilities(category: string, attribute: string, rarity: string): string[] {
    const baseAbilities = {
      Companion: ['Boost morale', 'Provide companionship', 'Minor assistance'],
      Mount: ['Rapid travel', 'Carry cargo', 'Navigate terrain'],
      Guardian: ['Protect owner', 'Detect threats', 'Defensive barrier'],
      Harvester: ['Enhance mining', 'Optimize space', 'Increase efficiency'],
      Mystical: ['Arcane knowledge', 'Reality manipulation', 'Prophecy'],
      Mechanical: ['Automated tasks', 'System optimization', 'Process enhancement']
    };

    const rarityBonus = {
      Common: [],
      Uncommon: ['Enhanced primary ability'],
      Rare: ['Enhanced primary ability', 'Secondary utility'],
      Epic: ['Enhanced primary ability', 'Secondary utility', 'Special power'],
      Legendary: ['Enhanced primary ability', 'Secondary utility', 'Special power', 'Unique trait'],
      Mythical: ['Enhanced primary ability', 'Secondary utility', 'Special power', 'Unique trait', 'Reality-altering capability']
    };

    return [
      ...(baseAbilities[category as keyof typeof baseAbilities] || []),
      ...(rarityBonus[rarity as keyof typeof rarityBonus] || [])
    ];
  }

  private generateObjectPowers(category: string, power: string, rarity: string): string[] {
    const basePowers = {
      Tool: ['Improve efficiency', 'Enhance productivity', 'Simplify tasks'],
      Weapon: ['Deal damage', 'Break defenses', 'Eliminate threats'],
      Armor: ['Absorb damage', 'Protect wearer', 'Resist effects'],
      Artifact: ['Grant wisdom', 'Store power', 'Channel energy'],
      Vehicle: ['Transport rapidly', 'Navigate space', 'Carry payload'],
      Building: ['Provide shelter', 'Store resources', 'Generate value']
    };

    const rarityBonus = {
      Common: [],
      Uncommon: ['10% power boost'],
      Rare: ['25% power boost', 'Minor special effect'],
      Epic: ['50% power boost', 'Moderate special effect'],
      Legendary: ['100% power boost', 'Major special effect', 'Unique ability'],
      Mythical: ['200% power boost', 'Ultimate special effect', 'Reality-bending power']
    };

    return [
      ...(basePowers[category as keyof typeof basePowers] || []),
      ...(rarityBonus[rarity as keyof typeof rarityBonus] || [])
    ];
  }

  private generateFlavorText(type: 'creature' | 'object', name: string, backstory: string, rarity: string): string {
    const flavorTemplates = [
      `"In the light of optimization, ${name} shines brightest."`,
      `"Legends say ${name} holds the key to untold power."`,
      `"When hope fades, ${name} emerges from the digital void."`,
      `"The metaverse remembers ${name}, and so should you."`,
      `"Power flows through ${name} like data through fiber."`,
      `"Ancient code whispers the name: ${name}."`
    ];

    return flavorTemplates[Math.floor(Math.random() * flavorTemplates.length)];
  }

  private generateConnections(type: 'creature' | 'object', faction: Faction): string[] {
    return [
      faction.name,
      faction.allies[0] || 'Unknown faction',
      `Related to ${faction.goals[0]}`
    ];
  }

  private generateRelatedRelics(category: string, rarity: string): string[] {
    return [
      'Optimization Crystal',
      'Hash Fragment',
      'Memory Shard'
    ].slice(0, ['Common', 'Uncommon', 'Rare', 'Epic', 'Legendary', 'Mythical'].indexOf(rarity) + 1);
  }

  private generatePreviousOwners(rarity: string, faction: Faction): string[] {
    const ownerCount = ['Common', 'Uncommon', 'Rare', 'Epic', 'Legendary', 'Mythical'].indexOf(rarity);
    return Array.from({ length: ownerCount }, (_, i) =>
      `${faction.name} Champion ${i + 1}`
    );
  }

  private generateMetaverseRole(category: string, faction: Faction): string {
    return `Serves ${faction.name} as a ${category.toLowerCase()} to advance ${faction.goals[0]}`;
  }

  private generateObjectMetaverseRole(category: string, faction: Faction): string {
    return `Essential ${category.toLowerCase()} for ${faction.name}'s pursuit of ${faction.goals[0]}`;
  }

  private generateHistoricalSignificance(rarity: string, event: HistoricalEvent): string {
    const rarityIndex = ['Common', 'Uncommon', 'Rare', 'Epic', 'Legendary', 'Mythical'].indexOf(rarity);

    if (rarityIndex < 2) return 'A recent creation with modest history';
    if (rarityIndex < 4) return `Participated in ${event.name}, playing a supporting role`;
    return `A legendary participant in ${event.name}, crucial to its outcome`;
  }

  private generateLegendaryStatus(rarity: string, event: HistoricalEvent): string {
    const rarityIndex = ['Common', 'Uncommon', 'Rare', 'Epic', 'Legendary', 'Mythical'].indexOf(rarity);

    if (rarityIndex < 2) return 'Known among local communities';
    if (rarityIndex < 4) return `Renowned artifact from ${event.name}`;
    return `One of the most legendary artifacts in metaverse history, forever tied to ${event.name}`;
  }

  private generateObjectType(category: string, rarity: string): string {
    return `${rarity} ${category}`;
  }

  /**
   * Get all existing lore for cross-referencing
   */
  public getExistingLore(): Map<string, CreatureLore | ObjectLore> {
    return this.existingLore;
  }

  /**
   * Get metaverse world configuration
   */
  public getWorld(): MetaverseWorld {
    return this.world;
  }

  /**
   * Export lore collection for storage/backup
   */
  public exportLore(): string {
    return JSON.stringify({
      world: this.world,
      lore: Array.from(this.existingLore.entries())
    }, null, 2);
  }

  /**
   * Import lore collection
   */
  public importLore(jsonData: string): void {
    try {
      const data = JSON.parse(jsonData);
      if (data.world) this.world = data.world;
      if (data.lore) {
        this.existingLore = new Map(data.lore);
        this.nameRegistry = new Set(data.lore.map(([name]: [string, any]) => name));
      }
    } catch (error) {
      console.error('Failed to import lore:', error);
      throw new Error('Invalid lore data format');
    }
  }
}

export default MetaverseLoreGenerator;
