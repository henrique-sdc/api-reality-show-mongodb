# 📺 Reality Show API - Gerenciador com MongoDB

![Node.js](https://img.shields.io/badge/Node.js-18.x-blue.svg?logo=node.js)![Express.js](https://img.shields.io/badge/Express.js-4.x-green.svg?logo=express)![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-green.svg?logo=mongodb)![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-yellow.svg?logo=javascript)

## 📌 Visão Geral

Esta aplicação é uma API RESTful desenvolvida como atividade da matéria de **NoSQL**. Ela simula o backend para o gerenciamento de um reality show, utilizando **Node.js** e **Express.js**. Todos os dados são persistidos em um banco de dados **MongoDB Atlas**, modelado com documentos embutidos para representar realities, emissoras e participantes de forma eficiente.

A API fornece endpoints para consultas complexas utilizando o **Aggregation Framework** do MongoDB, além de uma funcionalidade de votação que se integra com um dashboard de visualização de dados criado no **Atlas Charts**.

## 🛠️ Tecnologias Utilizadas

-   **Backend:** Node.js, Express.js
-   **Banco de Dados:** MongoDB (com MongoDB Atlas)
-   **Frontend (Demonstração):** HTML5, CSS3, JavaScript (Vanilla)
-   **Testes:** Postman
-   **Ferramentas:** Atlas CLI, Mongosh, Atlas Charts
-   **Drivers:** `mongodb`, `express`

## 📋 Pré-requisitos

-   **[Node.js](https://nodejs.org/)** (versão 18 ou superior)
-   **[Git](https://git-scm.com/downloads/)**
-   Uma conta no **[MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register)**
-   **[Atlas CLI](https://www.mongodb.com/try/download/atlascli)** instalado e configurado no PATH do sistema.
-   **[Postman](https://www.postman.com/downloads/)** (opcional, para testes).

## 📂 Estrutura do Projeto

```
api-reality-show-mongodb/
├── public/
│   ├── votacao.html        # Página para votação nos participantes
│   └── dashboard.html      # Página para exibir o gráfico do Atlas Charts
├── realities.json          # Dados iniciais para importação
├── premios_potenciais.json  # Dados iniciais para importação
├── RealityShow.postman_collection.json # Coleção para testes no Postman
├── server.js               # Código principal da API
├── package.json            # Dependências e metadados do projeto
└── README.md                 # Este arquivo
```

## 🔑 JSON Schema Validator

Para garantir a integridade dos dados na coleção `realities`, o seguinte schema de validação foi aplicado durante sua criação. Ele define os campos obrigatórios e seus tipos, incluindo a estrutura para documentos embutidos como `emissora` e `participantes`.

```javascript
db.createCollection("realities", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      title: "Validação de Reality Show",
      required: ["nome_reality", "ano", "emissora", "participantes"],
      properties: {
        nome_reality: {
          bsonType: "string",
          description: "'nome_reality' é obrigatório e deve ser uma string."
        },
        ano: {
          bsonType: "int",
          minimum: 2000,
          description: "'ano' deve ser um inteiro maior ou igual a 2000."
        },
        emissora: {
          bsonType: "object",
          required: ["nome_emissora", "audiencia_pontos"],
          properties: {
            nome_emissora: { bsonType: "string" },
            audiencia_pontos: { bsonType: "int" }
          }
        },
        participantes: {
          bsonType: "array",
          description: "'participantes' deve ser um array de documentos.",
          items: {
            bsonType: "object",
            required: ["nome_participante", "idade", "cidade"],
            properties: {
              nome_participante: { bsonType: "string" },
              idade: { bsonType: "int" },
              cidade: { bsonType: "string" },
              votos: { bsonType: "int" },
              premios_ganhos: { bsonType: "array" }
            }
          }
        }
      }
    }
  }
});
```

## ⚙️ Configuração e Execução Completa

Este guia detalha todos os passos, desde a criação da infraestrutura na nuvem até a execução da API local.

### Parte A: Ambiente Local

1.  **Clone o repositório:**
    ```bash
    git clone https://github.com/henrique-sdc/api-reality-show-mongodb.git
    cd api-reality-show-mongodb
    ```

2.  **Instale as dependências do Node.js:**
    ```bash
    npm install
    ```

### Parte B: Ambiente MongoDB Atlas (Via Atlas CLI)

Execute os comandos abaixo em seu terminal para configurar o projeto no MongoDB Atlas.

1.  **Login no Atlas:**
    ```bash
    # Este comando abrirá uma aba no navegador para você autenticar.
    atlas login
    ```

2.  **Criação do Projeto e Cluster:**
    ```bash
    # Cria o projeto
    atlas projects create reality-show
    ```
    **Atenção:** Anote o **ID do projeto** retornado (ex: `Project '68d...7405' created.`).
    ```bash
    # Define o projeto recém-criado como padrão
    atlas config set project_id <SEU_PROJECT_ID>

    # Cria o cluster gratuito M0 (pode levar alguns minutos)
    atlas clusters create cluster01 --provider AWS --region US_EAST_1 --tier M0
    ```

3.  **Configuração de Acesso e Usuário:**
    ```bash
    # Libera o acesso de qualquer IP para facilitar o desenvolvimento
    atlas accessLists create 0.0.0.0/0 --comment "Acesso geral"

    # Cria um usuário e senha para o banco de dados (guarde essas credenciais!)
    atlas dbusers create readWriteAnyDatabase --username <SEU_USUARIO> --password <SUA_SENHA>
    ```

4.  **Obter a String de Conexão:**
    ```bash
    atlas clusters connectionStrings describe cluster01
    ```
    Copie a string de conexão do tipo `standard`. Ela será a chave para conectar sua API ao banco.

### Parte C: Preparando o Banco de Dados

1.  **Conecte-se ao Cluster via Mongosh:**
    Use a string de conexão obtida no passo anterior.
    ```bash
    mongosh "SUA_STRING_DE_CONEXAO_STANDARD" --username <SEU_USUARIO>
    ```

2.  **Crie a Coleção com Validação (JSON Schema):**
    Dentro do `mongosh`, execute o comando abaixo para criar a coleção `realities` com as regras de integridade.
    ```javascript
    use reality_show_db;

    db.createCollection("realities", {
      validator: {
        $jsonSchema: {
          bsonType: "object",
          title: "Validação de Reality Show",
          required: ["nome_reality", "ano", "emissora", "participantes"],
          properties: {
            nome_reality: { bsonType: "string" },
            ano: { bsonType: "int", minimum: 2000 },
            emissora: {
              bsonType: "object",
              required: ["nome_emissora", "audiencia_pontos"],
              properties: {
                nome_emissora: { bsonType: "string" },
                audiencia_pontos: { bsonType: "int" }
              }
            },
            participantes: {
              bsonType: "array",
              items: {
                bsonType: "object",
                required: ["nome_participante", "idade", "cidade"],
                properties: {
                  nome_participante: { bsonType: "string" },
                  idade: { bsonType: "int" },
                  cidade: { bsonType: "string" },
                  votos: { bsonType: "int" },
                  premios_ganhos: { bsonType: "array" }
                }
              }
            }
          }
        }
      }
    });
    ```

3.  **Importe os Dados Iniciais:**
    Em um **novo terminal**, na pasta do projeto, execute os comandos `mongoimport` com sua string de conexão.
    ```bash
    # Importar realities
    mongoimport --uri "SUA_STRING_DE_CONEXAO_COMPLETA/reality_show_db" --collection realities --file realities.json --jsonArray

    # Importar prêmios
    mongoimport --uri "SUA_STRING_DE_CONEXAO_COMPLETA/reality_show_db" --collection premios_potenciais --file premios_potenciais.json --jsonArray
    ```

### Parte D: Configurando o Gráfico de Votação (Atlas Charts)

1.  No site do MongoDB Atlas, navegue até a aba **Charts**.
2.  Crie um novo **Dashboard** (ex: "Votação Dashboard").
3.  Clique em **Add Chart** e selecione a Data Source: `reality_show_db` -> `realities`.
4.  **Configure o gráfico da seguinte forma:**
    -   **Chart Type:** `Grouped Bar`
    -   ⚠️ **Unwind Array:** Na lista de campos à esquerda, encontre o array `participantes` e **ative a opção "Unwind array"**. Este passo é crucial.
    -   **Y Axis (Eixo das Categorias):** Arraste o campo `participantes.nome_participante`.
    -   **X Axis (Eixo dos Valores):** Arraste o campo `participantes.votos`.
        -   **Aggregate:** Selecione `sum`.
    -   **Filter:** Adicione um filtro onde o campo `nome_reality` seja igual a `A Ilha dos Desafios`.
5.  **Salve o gráfico**. No dashboard, clique nos três pontos (...) do gráfico > **Embed Chart**. Ative o embedding, vá para a aba **IFrame** e copie o código.
6.  **Cole o código do `<iframe>`** dentro do arquivo `public/dashboard.html`.

### Parte E: Execução Final da API

1.  **Configure a Conexão no Código:**
    -   Abra o arquivo `server.js`.
    -   Localize a variável `url` e substitua o placeholder pela **sua string de conexão completa**.
2.  **Inicie o servidor:**
    ```bash
    node server.js
    ```

## 🚀 Testando a API

-   **Páginas Web:**
    -   Acesse `http://localhost:3000` para a página de votação.
    -   Acesse `http://localhost:3000/dashboard` para visualizar o gráfico. Lembre-se que no plano gratuito do Atlas, a atualização pode não ser em tempo real. Use o botão de refresh no dashboard para forçar a atualização.
-   **Postman:**
    -   Importe o arquivo `RealityShow.postman_collection.json` no Postman para ter acesso a requisições prontas para todos os endpoints.
