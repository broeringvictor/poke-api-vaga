import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
// HttpClientModule foi removido daqui pois não é usado diretamente no template.
// A injeção do HttpClient é feita no provider global (geralmente app.config.ts)
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonSpinner,
  IonSplitPane,
  IonMenu,
  IonButtons,
  IonMenuButton,
  IonCard,
  IonCardHeader,
  IonCardContent,
  IonCardTitle
} from '@ionic/angular/standalone';

import { Pokemon } from 'src/app/models/pokemon.interface';
import { PokeapiService } from 'src/app/services/pokeapi.service';
import { PokeGridComponent } from '../../components/poke-grid/poke-grid.component';
import { PokeListComponent } from '../../components/poke-list/poke-list.component'; // Verifique se o caminho está correto

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonSpinner,
    IonSplitPane,
    IonMenu,
    IonButtons,
    IonMenuButton,
    IonCard,
    IonCardHeader,
    IonCardContent,
    IonCardTitle,
    PokeGridComponent,
    PokeListComponent // Importação do novo componente
  ],
})
export class HomePage implements OnInit {

  allLoadedPokemons: Pokemon[] = [];
  selectedPokemonDetails: Pokemon | null = null;
  isLoading: boolean = false;
  currentOffset: number = 0;
  pokemonLoadLimit: number = 20;
  hasMorePokemons: boolean = true;

  constructor(private pokeapiService: PokeapiService) {}

  ngOnInit() {
    this.loadMorePokemonData();
  }

  loadMorePokemonData(event?: any) {
    if (this.isLoading || !this.hasMorePokemons) {
      if (event) event.target.complete();
      return;
    }

    this.isLoading = true;

    this.pokeapiService.getPokemonList(this.pokemonLoadLimit, this.currentOffset).subscribe({
      next: (pagedResponse) => {
        if (!pagedResponse.next) {
          this.hasMorePokemons = false;
        }

        const pokemonDetailRequests = pagedResponse.results.map(p =>
          this.pokeapiService.getPokemonDetails(p.name).pipe(
            catchError(err => {
              console.error(`Erro ao carregar detalhes do Pokémon ${p.name}:`, err);
              return of(null);
            })
          )
        );

        forkJoin(pokemonDetailRequests).subscribe({
          next: (detailedPokemons: (Pokemon | null)[]) => {
            const validPokemons = detailedPokemons.filter(p => p !== null) as Pokemon[];
            this.allLoadedPokemons = [...this.allLoadedPokemons, ...validPokemons];
            this.currentOffset += this.pokemonLoadLimit;
            this.isLoading = false;
            if (event) {
              event.target.complete();
            }

            if (!this.selectedPokemonDetails && this.allLoadedPokemons.length > 0) {
              this.selectedPokemonDetails = this.allLoadedPokemons[0];
            }
          },
          error: (err) => {
            console.error('Erro ao carregar detalhes dos Pokémon:', err);
            this.isLoading = false;
            if (event) {
              event.target.complete();
            }
          }
        });
      },
      error: (err) => {
        console.error('Erro ao carregar lista inicial de Pokémon:', err);
        this.isLoading = false;
        if (event) {
          event.target.complete();
        }
      }
    });
  }

  onPokemonSelected(identifier: string | number) {
    const foundPokemon = this.allLoadedPokemons.find(p => p.name === identifier || p.id === identifier);
    if (foundPokemon) {
      this.selectedPokemonDetails = foundPokemon;
    } else {
      this.pokeapiService.getPokemonDetails(identifier).subscribe({
        next: (data) => {
          this.selectedPokemonDetails = data;
        },
        error: (err) => {
          console.error(`Erro ao carregar detalhes do Pokémon ${identifier}:`, err);
        }
      });
    }
  }

  getPokemonImageUrl(pokemon: Pokemon): string {
    return pokemon.sprites.other?.['official-artwork']?.front_default || pokemon.sprites.front_default;
  }
}