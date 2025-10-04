const express = require('express');
const { MongoClient, ObjectId } = require('mongodb');

const app = express();
app.use(express.json());

const url = 'mongodb+srv://henrique_sdc:<SUA_SENHA>@cluster01.nqnsgsl.mongodb.net/?retryWrites=true&w=majority';
const dbName = 'reality_show_db';
let client;
let db;

const start = async () => {
    try {
        client = new MongoClient(url);
        console.log('Conectando ao MongoDB Atlas...');
        await client.connect();
        console.log('Conectado com sucesso!');
        db = client.db(dbName);

        app.listen(3000, () => {
            console.log('Servidor rodando na porta 3000. Acesse http://localhost:3000');
        });
    } catch (error) {
        console.error('Falha ao conectar ao banco de dados', error);
        process.exit(1);
    }
};


app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/votacao.html');
});

app.get('/dashboard', (req, res) => {
    res.sendFile(__dirname + '/public/dashboard.html');
});

app.get('/premios', async (req, res) => {
    try {
        const realities = await db.collection('realities').find({}, {
            projection: {
                nome_reality: 1,
                'participantes.nome_participante': 1,
                'participantes.premios_ganhos': 1,
                _id: 0
            }
        }).toArray();
        res.json(realities);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/idade/:nome_reality', async (req, res) => {
    try {
        const { nome_reality } = req.params;
        const pipeline = [
            { $match: { nome_reality: nome_reality } },
            { $unwind: '$participantes' },
            { $sort: { 'participantes.idade': 1 } },
            {
                $group: {
                    _id: '$nome_reality',
                    mais_novo: { $first: '$participantes' },
                    mais_velho: { $last: '$participantes' }
                }
            },
            { $project: { _id: 0, nome_reality: '$_id', mais_novo: 1, mais_velho: 1 } }
        ];
        const result = await db.collection('realities').aggregate(pipeline).toArray();
        res.json(result[0] || { message: 'Reality show não encontrado.' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/maior/:valor', async (req, res) => {
    try {
        const valor = parseInt(req.params.valor, 10);
        const pipeline = [
            { $unwind: '$participantes' },
            { $unwind: '$participantes.premios_ganhos' },
            { $match: { 'participantes.premios_ganhos.valor': { $gte: valor } } },
            {
                $group: {
                    _id: { nome_reality: '$nome_reality', nome_emissora: '$emissora.nome_emissora' }
                }
            },
            { $project: { _id: 0, nome_reality: '$_id.nome_reality', nome_emissora: '$_id.nome_emissora' } }
        ];
        const result = await db.collection('realities').aggregate(pipeline).toArray();
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/total', async (req, res) => {
    try {
        const pipeline = [
            { $unwind: '$participantes' },
            {
                $project: {
                    nome_reality: 1,
                    total_premios_participante: { $size: '$participantes.premios_ganhos' }
                }
            },
            {
                $group: {
                    _id: '$nome_reality',
                    total_premios_reality: { $sum: '$total_premios_participante' }
                }
            }
        ];
        const result = await db.collection('realities').aggregate(pipeline).toArray();
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/audiencia', async (req, res) => {
    try {
        const pipeline = [
            {
                $group: {
                    _id: '$emissora.nome_emissora',
                    total_audiencia: { $sum: '$emissora.audiencia_pontos' }
                }
            }
        ];
        const result = await db.collection('realities').aggregate(pipeline).toArray();
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/reality/:nome_reality/participantes', async (req, res) => {
    const { nome_reality } = req.params;
    try {
        const reality = await db.collection('realities').findOne(
            { nome_reality: nome_reality },
            { projection: { 'participantes.nome_participante': 1, 'participantes._id': 1, _id: 1 } }
        );
        res.json(reality);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao buscar participantes.' });
    }
});

app.post('/votar', async (req, res) => {
    const { realityId, participanteId } = req.body;
    try {
        const result = await db.collection('realities').updateOne(
            { _id: new ObjectId(realityId), 'participantes._id': new ObjectId(participanteId) },
            { $inc: { 'participantes.$.votos': 1 } }
        );
        if (result.modifiedCount > 0) {
            res.json({ status: 'Voto computado com sucesso!' });
        } else {
            res.status(404).json({ error: 'Reality ou participante não encontrado.' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Erro ao computar voto.' });
    }
});

start();
