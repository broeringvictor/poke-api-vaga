// Buscar apenas pelo nome do pokemon | Named (endpoint)
export interface NamedAPIResource {
  name: string;
  url: string;
}

// Resposta paginada da pokedex | NamedAPIResourceList (type)
export interface PokemonPagedResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: NamedAPIResource[];
}

// Sprites do Pokémon
export interface PokemonSprites {
  front_default: string;
  front_shiny: string; // Sprite da versão shiny
  other?: {
    dream_world?: {
      front_default: string;
    };
    home?: {
      front_default: string;
      front_shiny: string;
    };
    'official-artwork'?: {
      front_default: string;
      front_shiny: string; // Arte oficial da versão shiny
    };
  };
  versions?: any; // Para a galeria de sprites de todas as gerações
}

// Som (grito) do Pokémon
export interface PokemonCry {
  latest: string;
}

// Atributos base do Pokémon
export interface PokemonStat {
  base_stat: number;
  stat: NamedAPIResource; 
}

// Habilidades do Pokémon
export interface PokemonAbility {
  ability: NamedAPIResource;
  is_hidden: boolean; 
}

// Detalhes de como um golpe é aprendido
export interface VersionGroupDetail {
  level_learned_at: number; 
  move_learn_method: NamedAPIResource; // Método (level-up, machine, tutor, egg)
  version_group: NamedAPIResource; // Versão do jogo
}

// Golpes (moves) do Pokémon
export interface PokemonMove {
  move: NamedAPIResource;
  version_group_details: VersionGroupDetail[];
}

// Descrição da Pokédex
export interface FlavorTextEntry {
  flavor_text: string;
  language: NamedAPIResource; // Idioma da descrição
  version: NamedAPIResource;
}

// Categoria do Pokémon
export interface Genus {
  genus: string; // ex: "Seed Pokémon"
  language: NamedAPIResource;
}

// Dados da espécie do Pokémon (obtidos da species.url)
export interface PokemonSpecies {
  flavor_text_entries: FlavorTextEntry[];
  genera: Genus[];
  evolution_chain: {
    url: string; // URL para buscar a cadeia de evolução
  };
}


export interface ChainLink {
  species: NamedAPIResource;
  evolves_to: ChainLink[]; 
}

// A cadeia de evolução completa
export interface EvolutionChain {
  chain: ChainLink; // O início da cadeia
}


export interface Pokemon {
  id: number;
  name: string;
  height: number;
  weight: number;
  isFavorite: boolean; // Estado local, não vem da API

  sprites: PokemonSprites;
  cries: PokemonCry;
  stats: PokemonStat[];
  moves: PokemonMove[];
  abilities: PokemonAbility[];
  types: {
    slot: number;
    type: NamedAPIResource;
  }[];
  game_indices: {
    game_index: number;
    version: NamedAPIResource;
  }[];

  // Campos a serem preenchidos após chamadas secundárias
  description?: string; // Descrição em inglês (filtrada da species)
  genus?: string; // Categoria em inglês (filtrada da species)
  evolutionChain?: EvolutionChain; // Cadeia de evolução (buscada da evolution_chain.url)
}