import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'home',
    loadComponent: () => import('./features/pages/home/home.page').then((m) => m.HomePage),
  },  
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full',
  },
  
  {
    path: 'pokemon/:name',
    loadComponent: () => import('./features/pages/pokemon-detail/pokemon-detail.page').then( m => m.PokemonDetailPage)
  },
];

