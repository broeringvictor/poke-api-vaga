import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonList,
  IonItem,
  IonAvatar,
  IonLabel,
  IonInfiniteScroll,
  IonInfiniteScrollContent
} from '@ionic/angular/standalone';
import { Pokemon } from 'src/app/models/pokemon.interface';

@Component({
  selector: 'app-poke-list',
  templateUrl: './poke-list.component.html',
  styleUrls: ['./poke-list.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonList,
    IonItem,
    IonAvatar,
    IonLabel,
    IonInfiniteScroll,
    IonInfiniteScrollContent
  ]
})
export class PokeListComponent {

  @Input() pokemons: Pokemon[] = [];
  @Input() hasMore: boolean = false;

  @Output() pokemonSelected = new EventEmitter<string | number>();
  @Output() loadMore = new EventEmitter<any>();

  constructor() { }

  /**
   * Emite o evento 'pokemonSelected' com o nome do Pokémon clicado.
   * @param pokemonName O nome do Pokémon selecionado.
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

  /**
   * Função trackBy para otimizar a renderização da lista no ngFor.
   * @param index O índice do item.
   * @param pokemon O objeto Pokémon.
   * @returns O ID único do Pokémon.
   */
  trackByFn(index: number, pokemon: Pokemon): number {
    return pokemon.id;
  }
}