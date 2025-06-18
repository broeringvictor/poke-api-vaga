import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonGrid,
  IonRow,
  IonCol,
  IonCard,
  IonCardHeader,
  IonCardContent,
  IonCardTitle,
  IonInfiniteScroll,
  IonInfiniteScrollContent
} from '@ionic/angular/standalone';
import { Pokemon } from 'src/app/models/pokemon.interface'; // Importe a interface Pokemon

@Component({
  selector: 'app-poke-grid',
  templateUrl: './poke-grid.component.html',
  styleUrls: ['./poke-grid.component.scss'],
  imports: [
    CommonModule,
    IonGrid,
    IonRow,
    IonCol,
    IonCard,
    IonCardHeader,
    IonCardContent,
    IonCardTitle,
    IonInfiniteScroll,
    IonInfiniteScrollContent
  ]
})
export class PokeGridComponent {
  
  @Input() pokemons: Pokemon[] = [];
  // masMore servirá para o infinite scroll, indicando se há mais Pokémon para carregar
  @Input() hasMore: boolean = false;

  // Output: Evento emitido quando um Pokémon é selecionado
  @Output() pokemonSelected = new EventEmitter<string | number>();
  // Output: Evento emitido quando o infinite scroll é ativado
  @Output() loadMore = new EventEmitter<any>();

  constructor() { }

  /**
   * Emite o evento 'pokemonSelected' com o nome do Pokémon clicado.
   * @param pokemonName O nome do Pokémon selecionado.
   * Depois vou utilizar isso para fazer uma popup com os detalhes do Pokémon.
   */
  selectPokemon(pokemonName: string) {
    this.pokemonSelected.emit(pokemonName);
  }

  /**
   * Emite o evento 'loadMore' quando o infinite scroll é acionado.
   * @param event O evento do IonInfiniteScroll.
   */
  onLoadMore(event: any) {
    this.loadMore.emit(event);
  }
}
