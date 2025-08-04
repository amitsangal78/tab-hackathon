require("dotenv").config();

// Check if HF_TOKEN is available
if (!process.env.HF_TOKEN) {
  console.error("❌ HF_TOKEN not found in environment variables!");
  console.log("Please create a .env file with your Hugging Face token:");
  console.log("HF_TOKEN=your_huggingface_token_here");
  process.exit(1);
}

(async () => {
  try {
    const model = "gpt2";
    const input = "Hey There!";
    
    console.log(`🤖 Calling Hugging Face API directly for model: ${model}`);
    console.log(`📝 Input: "${input}"`);
    
    const response = await fetch(
      `https://api-inference.huggingface.co/models/${model}`,
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.HF_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          inputs: input,
          parameters: {
            max_new_tokens: 10,
            return_full_text: false
          }
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    console.log("✅ Generated:", result[0].generated_text);
    
  } catch (error) {
    console.error("❌ Error occurred:", error.message);
    console.log("\n💡 This approach uses direct HTTP requests to the Hugging Face API.");
  }
})(); 