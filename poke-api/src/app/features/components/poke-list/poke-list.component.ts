import { Component, Input, Output, EventEmitter, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

import {
    IonList,
    IonItem,
    IonAvatar,
    IonLabel,
    IonButton,
    IonIcon,
    IonText
} from '@ionic/angular/standalone';

import { addIcons } from 'ionicons';
import { heart, heartOutline } from 'ionicons/icons';

import { Pokemon } from 'src/app/models/pokemon.interface';
import { FavoriteService } from 'src/app/services/favorite.service';
import { PadNumberPipe } from 'src/app/pipes/pad-number.pipe';

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
        IonButton,
        IonIcon,        
        PadNumberPipe
    ],
})
export class PokeListComponent {
    @Input({ required: true }) public pokemons!: Pokemon[];
    @Output() public readonly pokemonSelected = new EventEmitter<Pokemon>();

    constructor(public favoriteService: FavoriteService, private cdRef: ChangeDetectorRef) {
        addIcons({ heart, heartOutline });
    }

    public selectPokemon(pokemon: Pokemon): void {
        this.pokemonSelected.emit(pokemon);
    }

    public async toggleFavorite(pokemon: Pokemon, event: MouseEvent): Promise<void> {
    
    event.stopPropagation(); 
    
    await this.favoriteService.toggleFavorite(pokemon.id);
    pokemon.isFavorite = this.favoriteService.isFavorite(pokemon.id);
    this.cdRef.detectChanges();
  }
    public trackById(index: number, pokemon: Pokemon): number {
        return pokemon.id;
    }
}