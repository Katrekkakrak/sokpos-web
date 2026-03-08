import { GoogleGenerativeAI } from '@google/generative-ai';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(200).send('SokBiz Telegram AI Webhook is running! 🚀');
  }

  try {
    const update = req.body;
    const botToken = req.query.token;

    if (!botToken) {
      return res.status(400).send('Missing Bot Token');
    }

    // បើមានគេឆាតចូល...
    if (update && update.message && update.message.text) {
      const chatId = update.message.chat.id;
      const text = update.message.text;

      console.log(`ទទួលសារពី ChatID ${chatId}: ${text}`);

      // ១. ដាស់ខួរក្បាល Gemini (ត្រូវប្រាកដថាបងមានអថេរ GEMINI_API_KEY ក្នុង Vercel)
      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
      // យើងប្រើស៊េរី 2.5 flash-lite ឲ្យលឿនដូចរន្ទះ!
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" }); 

      // ២. បញ្ជាប្រាប់តួនាទី AI (Prompt Engineering)
      const prompt = `អ្នកគឺជាជំនួយការ AI ដ៏ឆ្លាតវៃរបស់ប្រព័ន្ធ SokBiz POS។ ថៅកែបានឆាតមកអ្នកថា៖ "${text}"។ សូមឆ្លើយតបទៅកាន់គាត់វិញជាភាសាខ្មែរឲ្យបានគួរសម ខ្លីខ្លឹម និងរហ័សរហួន។ បើគាត់សួរនាំអីវ៉ាន់ ប្រាប់គាត់ថាអ្នកកំពុងត្រៀមភ្ជាប់ប្រព័ន្ធ Database សិន។`;

      let aiReply = '';

      try {
        // ៣. ឲ្យ AI គិតរកចម្លើយ
        const result = await model.generateContent(prompt);
        aiReply = result.response.text();
      } catch (aiError) {
        console.error("Gemini Error:", aiError);
        aiReply = "សុំទោសមេបញ្ជាការ! ខួរក្បាល AI របស់ខ្ញុំកំពុងរវល់ ឬ API Key មិនទាន់ត្រូវ សូមពិនិត្យមើល Vercel ឡើងវិញ!";
      }

      // ៤. បាញ់ចម្លើយ AI នោះត្រឡប់ទៅ Telegram វិញ
      await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text: aiReply
        })
      });
    }

    // ត្រូវតែប្រាប់ Telegram វិញថា "ទទួលបានហើយ" ជានិច្ច
    return res.status(200).send('OK');

  } catch (error) {
    console.error('Webhook Error:', error);
    return res.status(500).send('Internal Server Error');
  }
}