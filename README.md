# API de Consulta ao Open Food Facts

Esta API fornece acesso programático aos dados do site Open Food Facts, especializando-se na busca de produtos e na apresentação de detalhes específicos de produtos alimentícios. Utiliza critérios de filtragem baseados nos sistemas de classificação Nutri-Score e NOVA para promover escolhas alimentares mais informadas.

## Características
* Busca de produtos: Suporta a filtragem por critérios Nutri-Score e NOVA.
* Detalhes do produto: Apresenta informações detalhadas, incluindo composição nutricional e ingredientes.
* Sem persistência de dados: Realiza web scraping em tempo real, sem armazenamento de dados.


## Tecnologias Utilizadas
* Fastify: Para a criação de um servidor web
* Puppeteer: Automatiza a navegação no site Open Food Facts para extrair dados.
* Swagger: Documenta a API.
---

### Instalação
* Clone o repositório e instale as dependências necessárias:

Instale as dependências:
   
   ```bash

   git clone https://github.com/EmmanuelBarbosaMonteiro/challenge-open-food-web-scraping.git

   cd challenge-open-food-web-scraping

   npm install
   
   npm run start:dev
  ```

## Exemplos de Uso

Buscar produtos:

   ```bash

   http://localhost:3333/products?nutrition=A&nova=1'
  ```

Detalhes de um produto:

   ```bash

   http://localhost:3333/products/<id-do-produto>'
  ```

### Documentação da API

A documentação interativa gerada pelo Swagger está disponível após iniciar o servidor, acessível em http://localhost:3333/docs

