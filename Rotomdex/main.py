from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware 
import requests

app = FastAPI(title="Pokedex API Gateway", description="Gateway REST com HATEOAS para a PokéAPI")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

URL_BASE_POKEAPI = "https://pokeapi.co/api/v2/pokemon"

@app.get("/api/pokemons", summary="Lista os Pokémons")
def listar_pokemons(limite: int = 2000): 
    resposta = requests.get(f"{URL_BASE_POKEAPI}?limit={limite}")
    
    if resposta.status_code != 200:
        raise HTTPException(status_code=502, detail="Erro ao se comunicar com a PokeAPI")
        
    dados_originais = resposta.json()
    lista_formatada = []

    for pokemon in dados_originais["results"]:
        nome = pokemon["name"]
        item = {
            "nome": nome.capitalize(),
            "_links": {
                "detalhes": {"href": f"/api/pokemons/{nome}"},
                "api_externa": {"href": pokemon["url"]}
            }
        }
        lista_formatada.append(item)

    return {"resultados": lista_formatada}

@app.get("/api/pokemons/{nome}", summary="Detalhes de um Pokémon")
def detalhes_pokemon(nome: str):
    nome = nome.lower()
    resposta = requests.get(f"{URL_BASE_POKEAPI}/{nome}")
    
    if resposta.status_code != 200:
        raise HTTPException(status_code=404, detail="Pokémon não encontrado")
        
    dados = resposta.json()
    
    resposta_formatada = {
        "nome": dados["name"].capitalize(),
        "altura": dados["height"],
        "peso": dados["weight"],
        "imagem": dados["sprites"]["front_default"],
        "_links": {
            "voltar_para_lista": {"href": "/api/pokemons"}
        }
    }
    
    return resposta_formatada