export default async function handler(req: any, res: any) {
  // ១. បើគេចូលមើលតាម Browser ធម្មតា
  if (req.method !== 'POST') {
    return res.status(200).send('SokBiz Telegram AI Webhook is running! 🚀');
  }

  try {
    const update = req.body;
    
    // ២. ចាប់យក Token ពី URL (ឧ. /api/telegram?token=123:ABC)
    const botToken = req.query.token;

    if (!botToken) {
      return res.status(400).send('Missing Bot Token in URL');
    }

    // ៣. ឆែកមើលថាតើមានសារផ្ញើចូលមែនឬអត់
    if (update && update.message && update.message.text) {
      const chatId = update.message.chat.id;
      const text = update.message.text;

      console.log(`ទទួលសារពី ChatID ${chatId}: ${text}`);

      // ៤. [ជំហានបឋម] កូដតបទៅ Telegram វិញភ្លាមៗ (Echo)
      // (នៅជំហានបន្ទាប់ យើងនឹងយក text នេះទៅឲ្យ Gemini គិតសិន ចាំតប)
      const replyMessage = `🤖 សួស្តីមេបញ្ជាការ! ខ្ញុំបានទទួលបញ្ជារបស់អ្នកហើយ៖ "${text}"`;
      
      await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text: replyMessage
        })
      });
    }

    // ៥. ត្រូវតែប្រាប់ Telegram វិញថា "ទទួលបានហើយ (200 OK)" ជានិច្ច
    // បើមិនអញ្ចឹងទេ Telegram នឹងផ្ញើសារដដែលៗមកយើងរហូត!
    return res.status(200).send('OK');

  } catch (error) {
    console.error('Webhook Error:', error);
    return res.status(500).send('Internal Server Error');
  }
}