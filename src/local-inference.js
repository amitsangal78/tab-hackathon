const { pipeline } = require('@xenova/transformers');

(async () => {
  try {
    console.log("🤖 Loading model locally...");
    
    // Load the text generation pipeline
    const generator = await pipeline('text-generation', 'Xenova/gpt2');
    
    const input = "Hey There!";
    console.log(`📝 Input: "${input}"`);
    
    // Generate text
    const result = await generator(input, {
      max_new_tokens: 10,
      do_sample: true,
      temperature: 0.7
    });
    
    console.log("✅ Generated:", result[0].generated_text);
    
  } catch (error) {
    console.error("❌ Error occurred:", error.message);
    console.log("\n💡 This approach runs the model locally without needing API tokens.");
  }
})(); 