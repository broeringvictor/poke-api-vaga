import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { forkJoin } from 'rxjs'; // Importado para lidar com múltiplas requisições de detalhes
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonList,
  IonItem,
  IonLabel,
  IonAvatar, 
  IonGrid,
  IonRow,
  IonCol, 
  IonCard,
  IonCardHeader,
  IonCardContent,
  IonCardTitle, // Adicionado para os cartões de Pokémon
  IonSpinner, // Adicionado para o indicador de carregamento
  IonSplitPane, // Adicionado para o layout com barra lateral
  IonMenu, // Adicionado para a barra lateral
  IonButtons,
  IonMenuButton 
} from '@ionic/angular/standalone';

import { NamedAPIResource, Pokemon } from 'src/app/models/pokemon.interface';
import { PokeapiService } from 'src/app/services/pokeapi.service';

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
    IonList,
    IonItem,
    IonLabel,    
    IonAvatar,
    IonGrid,
    IonRow,
    IonCol,
    IonCard,
    IonCardHeader,
    IonCardContent,
    IonCardTitle,
    IonSpinner,
    IonSplitPane,
    IonMenu,
    IonButtons,
    IonMenuButton
  ],
})
export class HomePage implements OnInit {

  // Iniciando as variáveis necessárias
  mainPokemonList: Pokemon[] = []; // Lista principal
  sidebarPokemonList: Pokemon[] = []; // Lista lateral
  selectedPokemonDetails: Pokemon | null = null; // Detalhes do Pokémon selecionado
  isLoading: boolean = false; // Indicador de carregamento

  constructor(private pokeapiService: PokeapiService) {}

  ngOnInit() {
    this.loadAllPokemonData(); 
  }

  // Método para carregar todos os dados dos Pokémon
  loadAllPokemonData() {
    this.isLoading = true; 

    
    this.pokeapiService.getPokemonList(20, 0).subscribe({
      next: (pagedResponse) => {
        
        const pokemonDetailRequests = pagedResponse.results.map(p =>
          this.pokeapiService.getPokemonDetails(p.name)
        );

        
        forkJoin(pokemonDetailRequests).subscribe({
          next: (detailedPokemons: Pokemon[]) => {
            this.sidebarPokemonList = detailedPokemons; 
            this.mainPokemonList = detailedPokemons.slice(0, 25); 

            this.isLoading = false; // Desativa o indicador de carregamento

            // Seleciona o primeiro Pokémon da lista principal para exibição inicial, se houver
            if (this.mainPokemonList.length > 0) {
              this.selectedPokemonDetails = this.mainPokemonList[0];
            }
          },
          error: (err) => {
            console.error('Erro ao carregar detalhes dos Pokémon:', err);
            this.isLoading = false; // Desativa o indicador de carregamento em caso de erro
          }
        });
      },
      error: (err) => {
        console.error('Erro ao carregar lista inicial de Pokémon:', err);
        this.isLoading = false; // Desativa o indicador de carregamento em caso de erro
      }
    });
  }


  getPokemonDetails(identifier: string | number) {
    this.pokeapiService.getPokemonDetails(identifier).subscribe({
      next: (data) => {
        this.selectedPokemonDetails = data; 
        console.log('Detalhes do Pokémon:', this.selectedPokemonDetails);
      },
      error: (err) => {
        console.error(`Erro ao carregar detalhes do Pokémon ${identifier}:`, err);
      }
    });
  }
}
