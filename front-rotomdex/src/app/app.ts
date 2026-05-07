import { Component, signal, computed, OnInit } from '@angular/core';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, HttpClientModule],
  templateUrl: './app.html',
})
export class AppComponent implements OnInit {
  
  pokemons = signal<any[]>([]);
  detalhes = signal<any | null>(null);
  carregandoPoderesDe = signal<string | null>(null);

  totalPokemons = computed(() => this.pokemons().length);

  constructor(private http: HttpClient) {}

  urlapi = 'https://fictional-broccoli-g4rjpxpgwq45h9qq9-8000.app.github.dev';

  ngOnInit() {}

  carregarPokemons() {
    this.http.get<any>(this.urlapi + '/api/pokemons').subscribe({
      next: (dados) => {

        this.pokemons.set(
          dados.resultados.map((pokemon: any) => ({
            ...pokemon,
            imagemFrente: this.obterImagemDaUrlExterna(pokemon._links.api_externa.href),
          }))
        );
      },
      error: (erro) => console.error('Erro ao buscar Pokémons', erro),
    });
  }

  obterImagemDaUrlExterna(url: string): string {
    const partes = url.split('/').filter(Boolean);
    const id = partes[partes.length - 1];
    return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`;
  }

  verDetalhes(nomePokemon: string, linkHateoas: string) {

    this.carregandoPoderesDe.set(nomePokemon);

    const tempoExato = new Date().getTime();
    const urlCompleta = this.urlapi + linkHateoas + '?t=' + tempoExato;

    this.http.get<any>(urlCompleta).subscribe({
      next: (dados) => {
        this.detalhes.set(dados);
        this.carregandoPoderesDe.set(null);
      },
      error: (erro) => {
        console.error('Erro ao buscar detalhes:', erro);
        this.carregandoPoderesDe.set(null);
        alert('O servidor demorou a responder. Tente clicar novamente!');
      },
    });
  }

  fecharDetalhes() {
    this.detalhes.set(null);
  }
}