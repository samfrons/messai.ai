#!/usr/bin/env node

const { exec } = require('child_process');
const { promisify } = require('util');
const execAsync = promisify(exec);

async function testOllama() {
  const testPrompt = `Generate a brief technical definition (2-3 sentences) for the parameter "biofilm_conductivity" in microbial fuel cells. Include typical value ranges.`;

  try {
    console.log('🧪 Testing Ollama with simple prompt...');

    const curlCommand = `curl -s -X POST http://localhost:11434/api/generate -H "Content-Type: application/json" -d '${JSON.stringify(
      {
        model: 'qwen2.5-coder:latest',
        prompt: testPrompt,
        stream: false,
        options: {
          temperature: 0.3,
          num_predict: 300,
        },
      }
    ).replace(/'/g, "'\\''")}' --max-time 60`;

    const { stdout } = await execAsync(curlCommand);
    const response = JSON.parse(stdout);

    if (response.error) {
      throw new Error(`Ollama API error: ${response.error}`);
    }

    console.log('✅ Ollama Response:');
    console.log(response.response);
    console.log('\n📊 Response Stats:');
    console.log(`Length: ${response.response.length} characters`);
    console.log(
      `Generation time: ${
        response.total_duration ? (response.total_duration / 1000000000).toFixed(2) : 'unknown'
      } seconds`
    );
  } catch (error) {
    console.error(`❌ Test failed: ${error.message}`);
  }
}

testOllama();
