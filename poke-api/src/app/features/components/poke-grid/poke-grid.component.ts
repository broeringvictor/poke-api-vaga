import { Component, Input, Output, EventEmitter, ChangeDetectorRef } from '@angular/core';
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


    constructor(public favoriteService: FavoriteService, private cdRef: ChangeDetectorRef) {
        addIcons({ heart, heartOutline, chevronBack, chevronForward });
    }

    public selectPokemon(pokemon: Pokemon): void {
        console.log('➡️ NAVEGAÇÃO CLICADA para:', pokemon.name); 
        this.pokemonSelected.emit(pokemon);

    }

    public changePage(page: number): void {
        if (page > 0 && page <= this.totalPages) {
            this.pageChange.emit(page);
        }
    }


    public async toggleFavorite(pokemon: Pokemon, event: MouseEvent): Promise<void> {
        console.log('❤️ FAVORITO CLICADO para:', pokemon.name);
        event.stopPropagation();

        console.log('Estado ANTES de favoritar:', pokemon.isFavorite);

        await this.favoriteService.toggleFavorite(pokemon.id);
        
        // Verifique se o serviço está funcionando
        const isNowFavorite = this.favoriteService.isFavorite(pokemon.id);
        pokemon.isFavorite = isNowFavorite;

        console.log('Estado DEPOIS de favoritar:', pokemon.isFavorite);

        this.cdRef.detectChanges();
        console.log('Detecção de mudanças executada.');
    }

    public trackById(pokemon: Pokemon): number {
        return pokemon.id;
    }
}