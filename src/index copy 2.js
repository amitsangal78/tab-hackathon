import express from 'express';
import ollama from 'ollama';

const app = express();
const port = 3000;

app.use(express.json());

ollama.baseUrl = 'http://localhost:11434';

// Health check endpoint
app.get('/health', async (req, res) => {
  try {
      const models = await ollama.models.list();
      res.json({ status: 'healthy', models: models.length });
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

// async function chatWithLlama() {
//   console.log('Chatting with Llama 3...');
//   try {
//     const response = await ollama.chat({
//       model: 'llama3',
//       messages: [{ role: 'user', content: 'What is the meaning of life?' }],
//     });
//     console.log(response.message.content);
//   } catch (error) {
//     console.error('Error interacting with Llama 3:', error);
//   }
// }

// chatWithLlama();