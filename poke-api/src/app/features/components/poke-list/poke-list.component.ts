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


  selectPokemon(pokemonName: string) {
    this.pokemonSelected.emit(pokemonName);
  }

  onLoadMore(event: any) {
    this.loadMore.emit(event);
  }


  trackByFn(index: number, pokemon: Pokemon): number {
    return pokemon.id;
  }
}