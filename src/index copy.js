import express from 'express';
import { Ollama } from 'ollama';

const app = express();
const port = 3000;

app.use(express.json());

const ollama = new Ollama({ host: 'http://localhost:11434' });

// Health check endpoint
app.get('/health', async (req, res) => {
    try {
        const models = await ollama.list();
        res.json({ status: 'healthy', models: models.models.length });
    } catch (error) {
        res.status(500).json({ status: 'unhealthy', error: error.message });
    }
});

const router = express.Router();

router.post('/ask-query', async (req, res) => {
  const { query } = req.body;
  try {
    const response = await ollama.chat({
      model: 'llama3', // Replace with your model name
      messages: [{ role: 'user', content: query }],
    });
    res.json({ reply: response.message.content });
  } catch (error) {
    res.status(500).send({ error: 'Error interacting with the model' });
  }
});

app.use('/api', router);


app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});