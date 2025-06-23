import { Injectable, inject } from '@angular/core';
import { Storage } from '@ionic/storage-angular';
import { PokeapiService } from './pokeapi.service';
import { lastValueFrom } from 'rxjs';

// Interface para a nossa lista mestra simplificada
export interface PokemonReference {
  name: string;
  url: string;
}

const POKEMON_MASTER_LIST_KEY = 'pokemonMasterList';

@Injectable({
  providedIn: 'root'
})
export class PokemonDataService {
  private storage = inject(Storage);
  private pokeapiService = inject(PokeapiService);
  
  private masterList: PokemonReference[] = [];
  private storageInitialized = false;

  constructor() {
    this.init();
  }

  async init() {

    const storage = await this.storage.create();
    this.storage = storage;
    this.storageInitialized = true;
  }


  async loadMasterList(): Promise<void> {
    if (!this.storageInitialized) await this.init();
    
 
    if (this.masterList.length > 0) {
      return;
    }


    const cachedList = await this.storage.get(POKEMON_MASTER_LIST_KEY);
    if (cachedList) {
      this.masterList = cachedList;
      return;
    }


    console.log('Fetching master list from API for the first time...');
    const response = await lastValueFrom(this.pokeapiService.getPokemonList(1500, 0)); // Pega todos
    this.masterList = response.results;
    await this.storage.set(POKEMON_MASTER_LIST_KEY, this.masterList); // Salva no cache
  }


  search(query: string): PokemonReference[] {
    if (!query) {
      return []; // Retorna vazio se a busca for vazia
    }

    const lowerCaseQuery = query.toLowerCase();
    return this.masterList.filter(pokemon => 
      pokemon.name.toLowerCase().includes(lowerCaseQuery)
    );
  }
}