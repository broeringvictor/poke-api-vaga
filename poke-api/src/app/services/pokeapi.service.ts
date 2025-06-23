import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PokemonPagedResponse, ApiPokemon } from '../models/pokemon.interface';

@Injectable({
  providedIn: 'root' // Isso faz com que o serviço esteja disponível em toda a aplicação
})
export class PokeapiService {

  private baseUrl = 'https://pokeapi.co/api/v2';

  constructor(private http: HttpClient) { }


  getPokemonList(limit: number = 25, offset: number = 0): Observable<PokemonPagedResponse> {
    return this.http.get<PokemonPagedResponse>(`${this.baseUrl}/pokemon?limit=${limit}&offset=${offset}`);
  }


  getPokemonDetails(identifier: string | number): Observable<ApiPokemon> {
    return this.http.get<ApiPokemon>(`${this.baseUrl}/pokemon/${identifier}`);
  }


  getDataFromUrl<T>(fullUrl: string): Observable<T> {
    return this.http.get<T>(fullUrl);
  }
}