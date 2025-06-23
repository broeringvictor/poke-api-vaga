import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { Observable, of } from 'rxjs';
import { map, switchMap, tap } from 'rxjs/operators';
import { addIcons } from 'ionicons';
import { volumeHighOutline, arrowForwardOutline } from 'ionicons/icons';

import {
  IonContent, IonHeader, IonTitle, IonToolbar, IonBackButton, IonButtons,
  IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonChip,
  IonLabel, IonGrid, IonRow, IonCol, IonList, IonItem, IonBadge, IonSpinner,
  IonButton, IonIcon, IonProgressBar, IonAvatar,
  IonSelect, IonSelectOption, IonCardSubtitle, IonText  
} from '@ionic/angular/standalone';

import {
  ApiPokemon, PokemonProfile, PokemonSpecies, EvolutionChain, ChainLink, PokemonMove
} from 'src/app/models/pokemon.interface';
import { PokeapiService } from 'src/app/services/pokeapi.service';




export interface FilteredMove {
  name: string;
  level: number;
  method: string;
}

@Component({
  selector: 'app-pokemon-detail',
  templateUrl: './pokemon-detail.page.html',
  styleUrls: ['./pokemon-detail.page.scss'],
  standalone: true,
  imports: [
    CommonModule, IonContent, IonHeader, IonTitle, IonToolbar, IonBackButton,
    IonButtons, IonCard, IonCardContent, IonCardHeader, IonCardTitle,
    IonChip, IonLabel, IonGrid, IonRow, IonCol, IonList, IonItem, IonBadge,
    IonSpinner, IonButton, IonIcon, IonProgressBar, IonAvatar,
    IonSelect, IonSelectOption, IonCardSubtitle, IonText
  ]
})
export class PokemonDetailPage implements OnInit {
  private route = inject(ActivatedRoute);
  private pokeapiService = inject(PokeapiService);

  public pokemon$!: Observable<PokemonProfile>;
  public showShiny = false;
  private spriteInterval: any;

  public gameVersions: string[] = [];
  public selectedVersion: string = '';
  public filteredMoves: FilteredMove[] = [];
  private fullPokemonProfile?: PokemonProfile; // Para guardar o pokemon completo

  constructor() {
    addIcons({ volumeHighOutline, arrowForwardOutline });
  }

  ngOnInit() {
    this.loadPokemonData();
  }
  ngAfterViewInit(): void {
    // Inicia a animação após a view ser carregada
    this.spriteInterval = setInterval(() => {
      this.showShiny = !this.showShiny;
    }, 3000); // Alterna a cada 3 segundos
  }
  ngOnDestroy(): void {
    if (this.spriteInterval) {
    clearInterval(this.spriteInterval);
    }
  }


  loadPokemonData(): void {
    const pokemonName = this.route.snapshot.paramMap.get('name');
    if (!pokemonName) { return; }

    this.pokemon$ = this.pokeapiService.getPokemonDetails(pokemonName).pipe(
      switchMap((pokemon: ApiPokemon) => this.pokeapiService.getDataFromUrl<PokemonSpecies>(pokemon.species.url).pipe(
        map(species => [pokemon, species] as [ApiPokemon, PokemonSpecies])
      )),
      switchMap(([pokemon, species]) => {
        if (!species.evolution_chain?.url) {
          return of([pokemon, species, null] as [ApiPokemon, PokemonSpecies, EvolutionChain | null]);
        }
        return this.pokeapiService.getDataFromUrl<EvolutionChain>(species.evolution_chain.url).pipe(
          map(evolutionChain => [pokemon, species, evolutionChain] as [ApiPokemon, PokemonSpecies, EvolutionChain])
        );
      }),
      map(([pokemon, species, evolutionChain]) => {
        const description = species.flavor_text_entries.find(entry => entry.language.name === 'en')?.flavor_text.replace(/[\n\f]/g, ' ') ?? 'No description available.';
        const genus = species.genera.find(entry => entry.language.name === 'en')?.genus ?? '';
        
        return {
          ...pokemon,
          isFavorite: false,
          description,
          genus,
          evolutionChain: evolutionChain ?? undefined,
           gender_rate: species.gender_rate, 
          color: species.color.name
        } as PokemonProfile;
      }),
      tap(pokemon => {
        // Após receber o perfil completo, inicializamos o filtro
        this.fullPokemonProfile = pokemon;
        this.initializeMoveFilter(pokemon);
      })
    );
  }

  private initializeMoveFilter(pokemon: PokemonProfile): void {
    // Pega todas as versões de jogos únicas e ordena
    const allVersions = new Set<string>();
    pokemon.moves.forEach(move => {
      move.version_group_details.forEach(detail => allVersions.add(detail.version_group.name));
    });
    this.gameVersions = Array.from(allVersions).sort();

    // Define a versão mais recente como padrão
    this.selectedVersion = this.gameVersions.length > 0 ? this.gameVersions[this.gameVersions.length - 1] : '';
    
    // Filtra os golpes para a versão padrão
    this.filterMoves(this.selectedVersion);
  }

  // Chamado quando o usuário muda a seleção no dropdown
  public onVersionChange(event: any): void {
    this.selectedVersion = event.detail.value;
    this.filterMoves(this.selectedVersion);
  }
  
  // A Lógica Central do Filtro
  private filterMoves(version: string): void {
    if (!this.fullPokemonProfile) return;

    const movesForVersion = this.fullPokemonProfile.moves
      .map(moveData => {
        const detail = moveData.version_group_details.find(d => d.version_group.name === version);
        if (detail) {
          return {
            name: moveData.move.name.replace('-', ' '),
            level: detail.level_learned_at,
            method: detail.move_learn_method.name,
          };
        }
        return null;
      })
      .filter((move): move is FilteredMove => move !== null)
      .sort((a, b) => a.level - b.level || a.name.localeCompare(b.name)); // Ordena por nível, depois por nome

    this.filteredMoves = movesForVersion;
  }
  
  // --- Métodos Auxiliares Antigos ---
  public playCry(cryUrl: string): void {
    if (cryUrl) new Audio(cryUrl).play();
  }

  public getEvolutionChain(evolutionChain: EvolutionChain): ChainLink[] {
    const chain: ChainLink[] = [];
    let currentLink: ChainLink | undefined = evolutionChain.chain;
    while (currentLink) {
      chain.push(currentLink);
      currentLink = currentLink.evolves_to[0];
    }
    return chain;
  }
  public getGender(rate: number): string {
    if (rate === -1) {
      return 'Sem Gênero';
    }
    // A taxa é em oitavos de chance de ser fêmea. 
    // 1/8 = 12.5% Fêmea, 87.5% Macho
    const femaleChance = (rate / 8) * 100;
    const maleChance = 100 - femaleChance;
    return `♂ ${maleChance}% / ♀ ${femaleChance}%`;
  }
  
  public getEvolutionSpriteUrl(speciesUrl: string): string {
   
    const id = speciesUrl.split('/').filter(Boolean).pop(); 

    return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`;
    } 
}