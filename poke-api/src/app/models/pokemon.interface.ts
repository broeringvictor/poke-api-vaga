// --- Tipos Fundamentais ---
export interface NamedAPIResource {
  name: string;
  url: string;
}

// ✅ INTERFACE ADICIONADA DE VOLTA
export interface PokemonPagedResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: NamedAPIResource[];
}

// --- Interfaces para a API (Respostas Brutas) ---

export interface ApiPokemon {
  id: number;
  name:string;
  height: number;
  weight: number;
  sprites: PokemonSprites;
  cries: { latest: string };
  stats: PokemonStat[];
  moves: PokemonMove[];
  abilities: PokemonAbility[];
  types: { slot: number; type: NamedAPIResource }[];
  game_indices: { game_index: number; version: NamedAPIResource }[];
  species: NamedAPIResource;
}

export interface PokemonSpecies {
  flavor_text_entries: { flavor_text: string; language: NamedAPIResource }[];
  genera: { genus: string; language: NamedAPIResource }[];
  evolution_chain: { url: string };
}

export interface EvolutionChain {
  chain: ChainLink;
}

// --- Modelos de Dados para a Aplicação ---

/**
 * Usado nas listas e grids (home, poke-list, poke-grid).
 */
export interface SimplePokemon {
  id: number;
  name: string;
  sprites: PokemonSprites;
  types: { slot: number; type: NamedAPIResource; }[];
  isFavorite: boolean;
}

/**
 * Usado na página de detalhes. Contém todas as informações.
 */
export interface PokemonProfile extends ApiPokemon {
  description: string;
  genus: string;
  evolutionChain?: EvolutionChain;
  isFavorite: boolean;
}

// --- Interfaces de Suporte ---
export interface PokemonSprites {
  front_default: string;
  front_shiny: string;
  other?: { 'official-artwork'?: { front_default: string; front_shiny: string; } };
  versions?: any;
}
export interface PokemonStat { base_stat: number; stat: NamedAPIResource; }
export interface PokemonAbility { ability: NamedAPIResource; is_hidden: boolean; }
export interface PokemonMove { move: NamedAPIResource; version_group_details: { level_learned_at: number; move_learn_method: NamedAPIResource; version_group: NamedAPIResource; }[]; }
export interface ChainLink { species: NamedAPIResource; evolves_to: ChainLink[]; }