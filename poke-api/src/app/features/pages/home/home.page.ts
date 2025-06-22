import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router'; // Importação necessária
import { forkJoin, lastValueFrom, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import {
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonSpinner,
    IonSplitPane,
    IonMenu,
    IonButtons,
    IonMenuButton,
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
        IonSplitPane,
        IonMenu,
        IonButtons,
        IonMenuButton,
        PokeGridComponent,
        PokeListComponent,
    ],
})
export class HomePage implements OnInit {
    public pokemons: Pokemon[] = [];
    public allLoadedPokemons: Pokemon[] = [];

    public currentPage = 1;
    public totalPages = 0;
    public isLoading = true;
    public isListLoading = false;
    public hasMorePokemons = true;

    private readonly itemsPerPage = 18;
    private listOffset = 0;
    private readonly listLimit = 40;

    private pokeapiService = inject(PokeapiService);
    private router = inject(Router);

    async ngOnInit(): Promise<void> {
        await this.loadPaginatedPokemons(this.currentPage);
        this.loadMorePokemonDataForList();
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

            const newPokemons = await this.fetchAndProcessPokemonDetails(
                response.results
            );
            this.allLoadedPokemons = [...this.allLoadedPokemons, ...newPokemons];
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

    public onPokemonSelected(pokemon: Pokemon): void {
        console.log('Pokemon selecionado:', pokemon);
        
        this.router.navigate(['/pokemon', pokemon.name]);
    }

    private favoriteService = inject(FavoriteService); 

    private async fetchAndProcessPokemonDetails(
        list: { name: string; url: string }[]
    ): Promise<Pokemon[]> {
        if (list.length === 0) {
            return [];
        }

        const detailRequests = list.map(pokemonInfo =>
            this.pokeapiService.getPokemonDetails(pokemonInfo.name).pipe(
                catchError(error => {
                    // Log do erro para depuração
                    console.error(`Falha ao buscar detalhes para ${pokemonInfo.name}`, error);
                    
                    return of(null);
                })
            )
        );

        const detailedPokemonsWithNulls = await lastValueFrom(forkJoin(detailRequests));

        // Filtra os nulos e processa os dados válidos de uma só vez
        return detailedPokemonsWithNulls
            .filter((pokemon): pokemon is Pokemon => pokemon !== null)
            .map(pokemon => {
                // Adiciona a propriedade isFavorite
                return {
                    ...pokemon,
                    isFavorite: this.favoriteService.isFavorite(pokemon.id)
                };
            });
}}