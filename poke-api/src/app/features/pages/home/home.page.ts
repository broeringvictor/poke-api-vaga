import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
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

  private readonly itemsPerPage = 24;
  private listOffset = 0;
  private readonly listLimit = 40;

  private pokeapiService = inject(PokeapiService);

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
    console.log('Pokémon selecionado na home page:', pokemon.name);
  }

  private async fetchAndProcessPokemonDetails(
    list: { name: string; url: string }[]
  ): Promise<Pokemon[]> {
    if (list.length === 0) {
      return [];
    }

    const detailRequests = list.map(p =>
      this.pokeapiService.getPokemonDetails(p.name).pipe(
        catchError(() => of(null))
      )
    );

    const detailedPokemons = await lastValueFrom(forkJoin(detailRequests));
    return detailedPokemons.filter((p): p is Pokemon => p !== null);
  }
}