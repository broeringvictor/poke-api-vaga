import { Injectable, inject } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Storage } from '@ionic/storage-angular'; 

@Injectable({
  providedIn: 'root'
})
export class FavoriteService {
  private readonly FAVORITES_KEY = 'favorite_pokemons';
  private storage = inject(Storage); 

  private readonly _favorites$ = new BehaviorSubject<Set<number>>(new Set());
  public readonly favorites$ = this._favorites$.asObservable();

  private storageInitialized = false;

  constructor() {
    this.init();
  }


  async init() {
    await this.storage.create();
    this.storageInitialized = true;
    this.loadFavoritesFromStorage();
  }

  public isFavorite(pokemonId: number): boolean {
    return this._favorites$.getValue().has(pokemonId);
  }


  public async toggleFavorite(pokemonId: number): Promise<void> {
    if (this.isFavorite(pokemonId)) {
      await this.removeFavorite(pokemonId);
    } else {
      await this.addFavorite(pokemonId);
    }
  }

  public async addFavorite(pokemonId: number): Promise<void> {
    const currentFavorites = this._favorites$.getValue();
    const newFavorites = new Set(currentFavorites);
    newFavorites.add(pokemonId);
    
    this._favorites$.next(newFavorites);
    await this.saveFavoritesToStorage();
  }
  
  public async removeFavorite(pokemonId: number): Promise<void> {
    const currentFavorites = this._favorites$.getValue();
    const newFavorites = new Set(currentFavorites);
    newFavorites.delete(pokemonId);

    this._favorites$.next(newFavorites);
    await this.saveFavoritesToStorage();
  }


  private async loadFavoritesFromStorage(): Promise<void> {
    if (!this.storageInitialized) {
      console.warn('Storage not initialized yet. Waiting...');
      await this.init(); // Garante que o storage esteja pronto
    }
    try {
      const favoriteIdsArray: number[] | null = await this.storage.get(this.FAVORITES_KEY);
      if (Array.isArray(favoriteIdsArray)) {
        this._favorites$.next(new Set(favoriteIdsArray));
      }
    } catch (error) {
      console.error('Erro ao carregar favoritos do Ionic Storage:', error);
    }
  }

  private async saveFavoritesToStorage(): Promise<void> {
    if (!this.storageInitialized) return;
    try {
      
      const favoriteIdsArray = Array.from(this._favorites$.getValue());
      await this.storage.set(this.FAVORITES_KEY, favoriteIdsArray);
    } catch (error) {
      console.error('Erro ao salvar favoritos no Ionic Storage:', error);
    }
  }
}