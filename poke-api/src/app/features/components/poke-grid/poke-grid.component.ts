import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonGrid,
  IonRow,
  IonCol,
  IonCard,
  IonCardContent,
  IonCardTitle,
  IonText,
  IonButton,
  IonIcon,
  IonFooter,
  IonToolbar,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { heart, heartOutline, chevronBack, chevronForward } from 'ionicons/icons';
import { Pokemon } from 'src/app/models/pokemon.interface';
// Passo 1: Importar o FavoriteService.
// (Ajuste o caminho do import se o seu serviço estiver em outra pasta).
import { FavoriteService } from 'src/app/services/favorite.service';

@Component({
  selector: 'app-poke-grid',
  templateUrl: './poke-grid.component.html',
  styleUrls: ['./poke-grid.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonGrid,
    IonRow,
    IonCol,
    IonCard,
    IonCardContent,
    IonCardTitle,
    IonText,
    IonButton,
    IonIcon,
    IonFooter,
    IonToolbar,
  ],
})
export class PokeGridComponent {
  @Input({ required: true }) public pokemons!: Pokemon[];
  @Input({ required: true }) public currentPage!: number;
  @Input({ required: true }) public totalPages!: number;

  @Output() public readonly pokemonSelected = new EventEmitter<Pokemon>();
  @Output() public readonly pageChange = new EventEmitter<number>();
  @Output() public readonly favoriteToggle = new EventEmitter<Pokemon>();

  // Passo 2: Injetar o FavoriteService como uma dependência pública.
  // Ao torná-lo 'public', podemos acessá-lo diretamente no template HTML.
  constructor(public favoriteService: FavoriteService) {
    addIcons({ heart, heartOutline, chevronBack, chevronForward });
  }

  public selectPokemon(pokemon: Pokemon): void {
    this.pokemonSelected.emit(pokemon);
  }

  public changePage(page: number): void {
    if (page > 0 && page <= this.totalPages) {
      this.pageChange.emit(page);
    }
  }

  // Passo 3: Atualizar a função para usar o serviço.
  // Esta função agora chama o serviço para adicionar ou remover o ID do Pokémon da lista de favoritos.
  public toggleFavorite(pokemon: Pokemon, event: MouseEvent): void {
    event.stopPropagation(); // Impede que o clique se propague para o card.
    this.favoriteService.toggleFavorite(pokemon.id);
  }

  public trackById(index: number, pokemon: Pokemon): number {
    return pokemon.id;
  }
}