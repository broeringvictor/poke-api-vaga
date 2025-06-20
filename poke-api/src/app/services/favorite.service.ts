import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FavoriteService {

  private readonly FAVORITES_STORAGE_KEY = 'favorite_pokemons';


  private readonly _favorites$ = new BehaviorSubject<Set<number>>(new Set<number>());


  public readonly favorites$ = this._favorites$.asObservable();

  constructor() {
    this.loadFavoritesFromStorage();
  }


  public isFavorite(pokemonId: number): boolean {

    return this._favorites$.getValue().has(pokemonId);
  }


  public toggleFavorite(pokemonId: number): void {
    if (this.isFavorite(pokemonId)) {
      this.removeFavorite(pokemonId);
    } else {
      this.addFavorite(pokemonId);
    }
  }


  public addFavorite(pokemonId: number): void {
    
    const currentFavorites = this._favorites$.getValue();
    const newFavorites = new Set(currentFavorites);
    newFavorites.add(pokemonId);


    this._favorites$.next(newFavorites);
    // Salva o novo estado no localStorage.
    this.saveFavoritesToStorage();
  }

  
// Remove um Pokémon da lista de favoritos    
  public removeFavorite(pokemonId: number): void {
 
    const currentFavorites = this._favorites$.getValue();
    const newFavorites = new Set(currentFavorites);
    newFavorites.delete(pokemonId);

    // Emite o novo Set atualizado.
    this._favorites$.next(newFavorites);
    // Salva o novo estado no localStorage.
    this.saveFavoritesToStorage();
  }


  private loadFavoritesFromStorage(): void {
    try {
      const savedFavorites = localStorage.getItem(this.FAVORITES_STORAGE_KEY);
      if (savedFavorites) {

        const favoriteIdsArray: number[] = JSON.parse(savedFavorites);
        if (Array.isArray(favoriteIdsArray)) {
          this._favorites$.next(new Set(favoriteIdsArray));
        }
      }
    } catch (error) {
      console.error('Erro ao carregar favoritos do localStorage:', error);
    }
  }

  // salva e converte para json
  private saveFavoritesToStorage(): void {
    try {

      const favoriteIdsArray = Array.from(this._favorites$.getValue());
      localStorage.setItem(this.FAVORITES_STORAGE_KEY, JSON.stringify(favoriteIdsArray));
    } catch (error) {
      console.error('Erro ao salvar favoritos no localStorage:', error);
    }
  }
}