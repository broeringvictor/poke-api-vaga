// Buscar apenas pelo nome do pokemon | Named (endpoint) --> Named (endpoint) https://pokeapi.co/docs/v2#resource-listspagination-section
export interface NamedAPIResource{
  name: string; 
  url: string;  
}
// Resposta paginada  da pokedex | NamedAPIResourceList (type)
export interface PokemonPagedResponse{
  count: number;
  next: string | null;
  previous: string | null;
  results: NamedAPIResource[];
}

export interface Pokemon {
  
  id: number;
  name: string;
  height: number;
  weight: number;
  isFavorite: boolean;
  sprites: {
    front_default: string; // URL da imagem frontal padrão do Pokémon
    other?: {
      dream_world?: {
        front_default: string;
      };
      'official-artwork'?: {
        front_default: string;
      };
    };
  };
  types: {
    slot: number;
    type: NamedAPIResource;
  }[];
  abilities: {
    ability: NamedAPIResource;
    is_hidden: boolean;
    slot: number;
  }[];
}