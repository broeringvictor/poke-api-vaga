import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MenuController } from '@ionic/angular'; 
import { lastValueFrom, forkJoin, of, catchError } from 'rxjs';

import {
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonSpinner,
    IonMenu,
    IonButtons,
    IonMenuButton,
    IonInfiniteScroll,
    IonInfiniteScrollContent, 
    IonSearchbar,
    IonList, 
    IonItem, 
    IonLabel 
} from '@ionic/angular/standalone';

import { ApiPokemon, SimplePokemon  } from 'src/app/models/pokemon.interface';
import { PokeapiService } from 'src/app/services/pokeapi.service';
import { PokeGridComponent } from '../../components/poke-grid/poke-grid.component';
import { PokeListComponent } from '../../components/poke-list/poke-list.component';
import { FavoriteService } from 'src/app/services/favorite.service';


import { PokemonDataService, PokemonReference } from 'src/app/services/pokemon-data.service';

@Component({
    selector: 'app-home',
    templateUrl: 'home.page.html',
    styleUrls: ['home.page.scss'],
    standalone: true,
    imports: [
        CommonModule,
        IonHeader, IonToolbar, IonTitle, IonContent, IonSpinner, IonMenu,
        IonButtons, IonMenuButton, IonInfiniteScroll, IonInfiniteScrollContent,
        IonSearchbar, PokeGridComponent, PokeListComponent,
        IonList, IonItem, IonLabel 
    ],
})
export class HomePage implements OnInit {
   
    public pokemons: SimplePokemon[] = [];
    public currentPage = 1;
    public totalPages = 0;
    public isLoading = true;

    // Propriedades para a lista lateral (modo de navegação)
    public allLoadedPokemons: SimplePokemon[] = [];
    public isListLoading = false;
    public hasMorePokemons = true;
    private listOffset = 0;
    private readonly listLimit = 40;

    // Propriedades para a busca (modo de busca)
    public searchResults: PokemonReference[] = [];
    public isSearching = false;

    // Injeção de dependências
    private dataService = inject(PokemonDataService);
    private pokeapiService = inject(PokeapiService);
    private favoriteService = inject(FavoriteService);
    private router = inject(Router);
    private menuCtrl = inject(MenuController);
    private readonly itemsPerPage = 18; 

   

    async ngOnInit(): Promise<void> {
 
        await this.dataService.loadMasterList();
        

        await this.loadPaginatedPokemons(this.currentPage);
        await this.loadMorePokemonDataForList();
    }

    public handleInput(event: any): void {
        const query = event?.target.value || '';
        if (!query) {
        this.isSearching = false;
        this.searchResults = [];
        return;
        }
        this.isSearching = true;
        this.searchResults = this.dataService.search(query);
    }
    

    public onPokemonSelected(pokemon: SimplePokemon): void {
        this.router.navigate(['/pokemon', pokemon.name]);
    }

    public onSearchResultSelected(pokemonName: string): void {
        this.router.navigate(['/pokemon', pokemonName]);
        this.menuCtrl.close('pokedex-list-menu');
    }

 
    public async loadPaginatedPokemons(page: number): Promise<void> {
        this.isLoading = true;
        this.currentPage = page;
        const offset = (page - 1) * this.itemsPerPage;
        try {
        const response = await lastValueFrom(
            this.pokeapiService.getPokemonList(this.itemsPerPage, offset)
        );
        if (this.totalPages === 0) {
            this.totalPages = Math.ceil(response.count / this.itemsPerPage);
        }
        this.pokemons = await this.fetchAndProcessPokemonDetails(response.results);
        } catch (error) {
        console.error('Erro ao carregar Pokémon para a grade:', error);
        this.pokemons = [];
        } finally {
        this.isLoading = false;
        }
    }

    public async loadMorePokemonDataForList(event?: any): Promise<void> {
        if (this.isListLoading || !this.hasMorePokemons) {
        event?.target.complete();
        return;
        }
        this.isListLoading = true;
        try {
        const response = await lastValueFrom(
            this.pokeapiService.getPokemonList(this.listLimit, this.listOffset)
        );
        if (!response.next) {
            this.hasMorePokemons = false;
        }
        const newPokemons = await this.fetchAndProcessPokemonDetails(response.results);
        this.allLoadedPokemons.push(...newPokemons);
        this.listOffset += this.listLimit;
        } catch (error) {
        console.error('Erro ao carregar mais Pokémon para a lista:', error);
        } finally {
        this.isListLoading = false;
        event?.target.complete();
        }
    }

    public onPageChange(newPage: number): void {
        this.loadPaginatedPokemons(newPage);
    }

    private async fetchAndProcessPokemonDetails(
        list: { name: string; url: string }[]
    ): Promise<SimplePokemon[]> {
        if (list.length === 0) { return []; }

        const detailRequests = list.map(p => this.pokeapiService.getPokemonDetails(p.name).pipe(
        catchError(() => of(null))
        ));

        const detailedPokemons = await lastValueFrom(forkJoin(detailRequests));

        return detailedPokemons
        .filter((p): p is ApiPokemon => p !== null) // Filtra nulos e afirma que o que sobra é do tipo ApiPokemon
        .map((p: ApiPokemon) => { // Mapeia a resposta completa para o nosso modelo simples
            return {
            id: p.id,
            name: p.name,
            sprites: p.sprites,
            types: p.types,
            isFavorite: this.favoriteService.isFavorite(p.id)
            };
        });
  }
}
