// Este script deve ser executado no Mongosh para criar a coleção 'realities'
// com as regras de validação de schema.
//
// Comando para usar: use reality_show_db;
// Em seguida, copie e cole todo o conteúdo abaixo.

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
                    description: "'ano' é obrigatório e deve ser um inteiro maior ou igual a 2000."
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