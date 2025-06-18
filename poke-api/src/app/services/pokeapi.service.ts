import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PokemonPagedResponse, Pokemon } from '../models/pokemon.interface';

@Injectable({
  providedIn: 'root' // Isso faz com que o serviço esteja disponível em toda a aplicação
})
export class PokeapiService {

  private baseUrl = 'https://pokeapi.co/api/v2';

  constructor(private http: HttpClient) { }


  getPokemonList(limit: number = 25, offset: number = 0): Observable<PokemonPagedResponse> {
    return this.http.get<PokemonPagedResponse>(`${this.baseUrl}/pokemon?limit=${limit}&offset=${offset}`);
  }

 
  getPokemonDetails(identifier: string | number): Observable<Pokemon> {
    return this.http.get<Pokemon>(`${this.baseUrl}/pokemon/${identifier}`);
  }
}