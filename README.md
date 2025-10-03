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
-   **Plugins/Drivers:**
    -   `mongodb`: Driver oficial do MongoDB para Node.js.
    -   `express`: Framework para a construção da API.

## 📋 Pré-requisitos

Para executar este projeto, você precisará de:

-   **[Node.js](https://nodejs.org/)** (versão 18 ou superior)
-   **[Git](https://git-scm.com/downloads/)**
-   Uma conta no **[MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register)** para criar o cluster.
-   **[Postman](https://www.postman.com/downloads/)** (opcional, para testar os endpoints com a collection fornecida).

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

## ⚙️ Configuração e Execução

1.  **Clone o repositório:**
    ```bash
    git clone https://github.com/henrique-sdc/api-reality-show-mongodb.git
    ```

2.  **Instale as dependências do Node.js:**
    ```bash
    npm install
    ```

3.  **Configure o Banco de Dados no MongoDB Atlas:**
    -   Crie um cluster gratuito no Atlas.
    -   Crie um usuário de banco de dados e libere o acesso para qualquer IP (0.0.0.0/0).
    -   Obtenha sua **string de conexão**.

4.  **Importe os dados iniciais:**
    Use o comando `mongoimport` no seu terminal, substituindo com sua string de conexão, para popular as coleções.
    ```bash
    # Importar realities
    mongoimport --uri "SUA_STRING_DE_CONEXAO" --collection realities --file realities.json --jsonArray

    # Importar prêmios
    mongoimport --uri "SUA_STRING_DE_CONEXAO" --collection premios_potenciais --file premios_potenciais.json --jsonArray
    ```

5.  **Configure a Conexão no Código:**
    -   Abra o arquivo `server.js`.
    -   Localize a variável `url` e substitua o placeholder pela **sua string de conexão completa**.

6.  **Execute a aplicação:**
    ```bash
    node server.js
    ```
    O servidor estará rodando em `http://localhost:3000`.

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

## 🚀 Testando a API

-   **Páginas Web:**
    -   Acesse `http://localhost:3000` para a página de votação.
    -   Acesse `http://localhost:3000/dashboard` para visualizar o gráfico de votos (requer configuração no Atlas Charts).
-   **Postman:**
    -   Importe o arquivo `RealityShow.postman_collection.json` no Postman.
    -   A coleção contém requisições prontas para todos os endpoints da API, com descrições detalhadas do que cada um faz.
