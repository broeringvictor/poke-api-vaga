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


import { FavoriteService } from 'src/app/services/favorite.service';
import { PadNumberPipe } from 'src/app/pipes/pad-number.pipe';

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
        PadNumberPipe,
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


    public async toggleFavorite(pokemon: Pokemon, event: MouseEvent): Promise<void> { 
    event.stopPropagation(); 
    

    await this.favoriteService.toggleFavorite(pokemon.id);
    

    pokemon.isFavorite = this.favoriteService.isFavorite(pokemon.id);
    }

    public trackById(pokemon: Pokemon): number {
        return pokemon.id;
    }
}