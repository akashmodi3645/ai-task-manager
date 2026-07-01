import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

const apiKey = process.env.OPENAI_API_KEY;

console.log('🔑 API Key Check:');
console.log('Exists:', !!apiKey);
console.log('Length:', apiKey?.length);
console.log('Starts with:', apiKey?.substring(0, 15));
console.log('Ends with:', apiKey?.substring(apiKey.length - 10));

const openai = new OpenAI({ apiKey });

async function test() {
  try {
    console.log('\n🚀 Testing OpenAI API...\n');
    
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'user', content: 'Say "OpenAI is working!"' }
      ],
      max_tokens: 20
    });

    console.log('✅ SUCCESS!');
    console.log('Response:', completion.choices[0].message.content);
    console.log('\n🎉 Your OpenAI key is working perfectly!\n');
    
  } catch (error) {
    console.error('❌ FAILED!');
    console.error('Error:', error.message);
    console.error('Status:', error.status);
    
    if (error.status === 401) {
      console.error('\n🔴 Invalid API key! Check if:');
      console.error('1. Full key copied (not truncated)');
      console.error('2. No extra spaces in .env file');
      console.error('3. Server restarted after .env change');
    } else if (error.status === 429) {
      console.error('\n🔴 Quota exceeded or rate limit!');
      console.error('Check: https://platform.openai.com/account/billing');
    }
  }
  process.exit();
}

test();
