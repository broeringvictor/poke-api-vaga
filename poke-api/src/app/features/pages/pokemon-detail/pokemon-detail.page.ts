import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';


import { 
  IonContent, 
  IonHeader, 
  IonTitle, 
  IonToolbar, 
  IonBackButton, 
  IonButtons,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonChip,
  IonLabel,
  IonGrid,
  IonRow,
  IonCol,
  IonList,
  IonListHeader,
  IonItem,
  IonBadge,
  IonSpinner
} from '@ionic/angular/standalone';

import { Pokemon } from 'src/app/models/pokemon.interface';
import { PokeapiService } from 'src/app/services/pokeapi.service';

@Component({
  selector: 'app-pokemon-detail',
  templateUrl: './pokemon-detail.page.html',
  styleUrls: ['./pokemon-detail.page.scss'],
  standalone: true,
 
  imports: [
    CommonModule, 
    FormsModule,
    IonContent, 
    IonHeader, 
    IonTitle, 
    IonToolbar, 
    IonBackButton, 
    IonButtons,
    IonCard,
    IonCardContent,
    IonCardHeader,
    IonCardTitle,
    IonChip,
    IonLabel,
    IonGrid,
    IonRow,
    IonCol,
    IonList,
    IonListHeader,
    IonItem,
    IonBadge,
    IonSpinner
  ]
})
export class PokemonDetailPage implements OnInit {

  public pokemon$!: Observable<Pokemon>;

  constructor(
    private route: ActivatedRoute,
    private pokeapiService: PokeapiService
  ) { }

  ngOnInit() {
    this.loadPokemonDetails();
  }

  loadPokemonDetails(): void {
    const pokemonName = this.route.snapshot.paramMap.get('name');
    if (pokemonName) {
      this.pokemon$ = this.pokeapiService.getPokemonDetails(pokemonName);
    } else {
      console.error('Pokemon name not found in route parameters');
    }
  }

  getPokemonImageUrl(pokemon: Pokemon): string {
    return pokemon.sprites.other?.['official-artwork']?.front_default ??
           pokemon.sprites.other?.dream_world?.front_default ??
           pokemon.sprites.front_default;
  }
}