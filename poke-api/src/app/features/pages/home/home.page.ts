// src/app/features/pages/home/home.page.ts

import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { forkJoin, lastValueFrom, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

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
} from '@ionic/angular/standalone';

import { Pokemon } from 'src/app/models/pokemon.interface';
import { PokeapiService } from 'src/app/services/pokeapi.service';
import { PokeGridComponent } from '../../components/poke-grid/poke-grid.component';
import { PokeListComponent } from '../../components/poke-list/poke-list.component';
import { FavoriteService } from 'src/app/services/favorite.service';

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
        IonSpinner,
        IonMenu,
        IonButtons,
        IonMenuButton,
        PokeGridComponent,
        PokeListComponent,
        IonInfiniteScroll, 
        IonInfiniteScrollContent,
        IonSearchbar
    ],
})
export class HomePage implements OnInit {
    public pokemons: Pokemon[] = [];
    public allLoadedPokemons: Pokemon[] = [];
    public filteredPokemons: Pokemon[] = [];
    private currentSearchQuery = '';

    public currentPage = 1;
    public totalPages = 0;
    public isLoading = true;
    public isListLoading = false;
    public hasMorePokemons = true;

    private readonly itemsPerPage = 18;
    private listOffset = 0;
    private readonly listLimit = 40;

    private pokeapiService = inject(PokeapiService);
    private favoriteService = inject(FavoriteService); 
    private router = inject(Router);

    async ngOnInit(): Promise<void> {
        await this.loadPaginatedPokemons(this.currentPage);
        await this.loadMorePokemonDataForList(); // Carrega a primeira leva para a lista lateral
    }
    
    // A função `loadMorePokemonDataForList` foi CORRIGIDA
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

            const newPokemons = await this.fetchAndProcessPokemonDetails(
                response.results
            );
            
            this.allLoadedPokemons.push(...newPokemons); // Adiciona os novos pokemons à lista principal
            this.listOffset += this.listLimit;

            // PONTO-CHAVE DA CORREÇÃO:
            // Atualiza a lista visível (filteredPokemons) para refletir os novos dados.
            this.applyFilter(); 
            
        } catch (error) {
            console.error('Erro ao carregar mais Pokémon para a lista:', error);
        } finally {
            this.isListLoading = false;
            event?.target.complete();
        }
    }

    // A função `handleInput` agora guarda a busca e chama um filtro central
    public handleInput(event: any): void {
        this.currentSearchQuery = event?.target.value || '';
        this.applyFilter();
    }

    /**
     * NOVA FUNÇÃO: Aplica o filtro atual à lista principal.
     * Esta função centraliza a lógica de filtragem.
     */
    private applyFilter(): void {
        const query = this.currentSearchQuery.toLowerCase();

        if (!query) {
            this.filteredPokemons = [...this.allLoadedPokemons];
            return;
        }

        this.filteredPokemons = this.allLoadedPokemons.filter(pokemon => {
            return pokemon.name.toLowerCase().includes(query);
        });
    }

    // As outras funções permanecem as mesmas
    public async loadPaginatedPokemons(page: number): Promise<void> {
        // ...código original sem alterações...
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

    public onPageChange(newPage: number): void {
        this.loadPaginatedPokemons(newPage);
    }

    public onPokemonSelected(pokemon: Pokemon): void {
        this.router.navigate(['/pokemon', pokemon.name]);
    }

    private async fetchAndProcessPokemonDetails(
        list: { name: string; url: string }[]
    ): Promise<Pokemon[]> {
        // ...código original sem alterações...
        if (list.length === 0) {
            return [];
        }
        const detailRequests = list.map(pokemonInfo =>
            this.pokeapiService.getPokemonDetails(pokemonInfo.name).pipe(
                catchError(error => {
                    console.error(`Falha ao buscar detalhes para ${pokemonInfo.name}`, error);
                    return of(null);
                })
            )
        );
        const detailedPokemonsWithNulls = await lastValueFrom(forkJoin(detailRequests));
        return detailedPokemonsWithNulls
            .filter((pokemon): pokemon is Pokemon => pokemon !== null)
            .map(pokemon => {
                return {
                    ...pokemon,
                    isFavorite: this.favoriteService.isFavorite(pokemon.id)
                };
            });
    }
}