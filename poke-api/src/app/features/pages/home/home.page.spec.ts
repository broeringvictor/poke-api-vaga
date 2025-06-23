import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { of } from 'rxjs';
import { HomePage } from './home.page';
import { PokeapiService } from 'src/app/services/pokeapi.service';
import { FavoriteService } from 'src/app/services/favorite.service';
import { PokemonDataService } from 'src/app/services/pokemon-data.service';
import { Storage } from '@ionic/storage-angular';

// 1. Criação dos Mocks para os serviços
// Usamos o Jasmine para criar objetos espiões que simulam os serviços reais.

const mockPokeapiService = jasmine.createSpyObj('PokeapiService', {
  getPokemonList: of({ count: 1, results: [{ name: 'bulbasaur', url: '' }] }),
  getPokemonDetails: of({ id: 1, name: 'bulbasaur', sprites: { front_default: '' }, types: [], abilities: [], height: 7, weight: 69 }),
});

const mockFavoriteService = jasmine.createSpyObj('FavoriteService', {
  isFavorite: false,
});

const mockPokemonDataService = jasmine.createSpyObj('PokemonDataService', {
  loadMasterList: Promise.resolve(),
  search: [{ name: 'pikachu', url: '' }],
});

// O PokemonDataService depende do Storage, então também precisamos de um mock para ele.
const mockStorage = jasmine.createSpyObj('Storage', ['create', 'get', 'set']);
mockStorage.create.and.returnValue(Promise.resolve(mockStorage)); // O método create deve retornar o próprio storage.

describe('HomePage', () => {
  let component: HomePage;
  let fixture: ComponentFixture<HomePage>;

  // Usamos waitForAsync para lidar com operações assíncronas no setup
  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [HomePage, IonicModule.forRoot()],
      providers: [
        provideRouter([]),
        // 2. Fornecendo os Mocks para o Ambiente de Teste
        // Dizemos ao Angular: "Quando alguém pedir o PokeapiService, entregue o nosso mockPokeapiService"
        { provide: PokeapiService, useValue: mockPokeapiService },
        { provide: FavoriteService, useValue: mockFavoriteService },
        { provide: PokemonDataService, useValue: mockPokemonDataService },
        { provide: Storage, useValue: mockStorage },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(HomePage);
    component = fixture.componentInstance;
    fixture.detectChanges(); // Dispara o ngOnInit
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // 3. Testes mais significativos
  it('deve carregar os Pokémon para a grade ao ser inicializado (ngOnInit)', () => {
    // O `beforeEach` já dispara o `ngOnInit`.
    // Verificamos se, após a inicialização, a lista de Pokémon da grade foi preenchida.
    // O mock do `PokeapiService` retorna 1 pokémon ('bulbasaur').
    expect(component.pokemons.length).toBeGreaterThan(0);
    expect(component.pokemons[0].name).toBe('bulbasaur');
    expect(component.isLoading).toBeFalse();
  });

  it('deve chamar o serviço de busca e atualizar os resultados ao usar o handleInput', () => {
    const testQuery = 'pika';
    const mockEvent = { target: { value: testQuery } };

    component.handleInput(mockEvent);

    // Verifica se o serviço de busca foi chamado com o termo correto
    expect(mockPokemonDataService.search).toHaveBeenCalledWith(testQuery);
    
    // Verifica se os resultados da busca no componente foram atualizados
    // com o retorno do nosso mock (`[{ name: 'pikachu', url: '' }]`).
    expect(component.isSearching).toBeTrue();
    expect(component.searchResults.length).toBeGreaterThan(0);
    expect(component.searchResults[0].name).toBe('pikachu');
  });

  it('deve limpar os resultados da busca quando o input estiver vazio', () => {
    const mockEvent = { target: { value: '' } };
    
    // Simula uma busca primeiro para ter resultados
    component.isSearching = true;
    component.searchResults = [{ name: 'pikachu', url: '' }];

    // Agora simula a limpeza do input
    component.handleInput(mockEvent);

    expect(component.isSearching).toBeFalse();
    expect(component.searchResults.length).toBe(0);
  });
});