import { GoogleGenerativeAI, SchemaType } from '@google/generative-ai';
import * as admin from 'firebase-admin';

// ១. ភ្ជាប់រន្ធ Firebase Admin
if (!admin.apps.length) {
  try {
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY || '{}');
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
    console.log("Firebase Admin Initialized Successfully!");
  } catch (error) {
    console.error("Firebase Admin Init Error:", error);
  }
}

const db = admin.firestore();

// ២. រៀបចំអាវុធ Function Calling (Tool) ដោយប្រើ SchemaType របស់ Google
const tools: any = [
  {
    functionDeclarations: [
      {
        name: "create_direct_order",
        description: "បង្កើតការកម្មង់ទិញថ្មី (Create Order) ពេលថៅកែបញ្ជាទិញទំនិញ ភ្ជាប់ជាមួយលេខទូរស័ព្ទ ឬទីតាំង។",
        parameters: {
          type: SchemaType.OBJECT,
          properties: {
            items: {
              type: SchemaType.ARRAY,
              description: "បញ្ជីទំនិញដែលថៅកែបញ្ជា (ឧ. កូកា ២កំប៉ុង)",
              items: {
                type: SchemaType.OBJECT,
                properties: {
                  name: { type: SchemaType.STRING, description: "ឈ្មោះទំនិញ" },
                  qty: { type: SchemaType.NUMBER, description: "ចំនួន" }
                },
                required: ["name", "qty"]
              }
            },
            customerInfo: {
              type: SchemaType.STRING,
              description: "ព័ត៌មានភ្ញៀវ (លេខទូរស័ព្ទ ឬទីតាំង)"
            }
          },
          required: ["items", "customerInfo"]
        }
      }
    ]
  }
];

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') return res.status(200).send('Webhook is running 🚀');

  try {
    const update = req.body;
    const botToken = req.query.token;

    if (!update?.message?.text || !botToken) return res.status(200).send('OK');

    const chatId = update.message.chat.id;
    const text = update.message.text;

    // ៣. ស្វែងរកហាងរបស់ថៅកែ
    const settingsSnapshot = await db.collectionGroup('settings').where('aiTelegramToken', '==', botToken).limit(1).get();
    
    let tenantId = '';
    if (!settingsSnapshot.empty) {
      tenantId = settingsSnapshot.docs[0].ref.parent.parent?.id || '';
    }

    if (!tenantId) {
      await sendTelegramMessage(botToken, chatId, "❌ សុំទោសមេបញ្ជាការ! ខ្ញុំរកមិនឃើញហាងដែលភ្ជាប់ជាមួយ Bot នេះទេ។");
      return res.status(200).send('OK');
    }

    // ៤. ដាស់ខួរក្បាល Gemini
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite", tools: tools });
    
    const chat = model.startChat({
      systemInstruction: `អ្នកគឺជាអ្នកគ្រប់គ្រងហាងដ៏ឆ្លាតវៃ។ ថៅកែឆាតមកអ្នកថា៖ "${text}"។ 
      - បើគាត់ប្រាប់ឲ្យកត់ Order ហើយមានព័ត៌មានគ្រប់គ្រាន់ (ឈ្មោះអីវ៉ាន់ និងលេខទូរស័ព្ទ/ទីតាំង) សូមហៅមុខងារ 'create_direct_order' ភ្លាម។
      - បើខ្វះព័ត៌មាន សូមសួរគាត់ត្រឡប់ទៅវិញជាភាសាខ្មែរខ្លីៗសិន។`
    });

    const result = await chat.sendMessage(text);
    const response = result.response;
    
    let aiReply = '';
    try { aiReply = response.text(); } catch (e) {}

    // ៥. ឆែកមើល Function Call
    const functionCalls = response.functionCalls();
    
    if (functionCalls && functionCalls.length > 0) {
      const call = functionCalls[0];
      if (call.name === "create_direct_order") {
        
        // បន្លំភ្នែក TypeScript ទីនេះ (as any) ដើម្បីកុំអោយវាលោត Error
        const args = call.args as any; 
        
        // ៦. បង្កើត Order
        const newOrder = {
          id: `SB-TG-${Date.now()}`,
          customerName: "Telegram Customer",
          customerPhone: args.customerInfo || "N/A",
          items: args.items || [],
          status: 'new',
          paymentStatus: 'unpaid',
          total: 0,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          source: 'telegram_ai'
        };

        await db.collection('tenants').doc(tenantId).collection('orders').doc(newOrder.id).set(newOrder);
        
        const itemNames = (args.items || []).map((i: any) => `${i.name} (${i.qty})`).join(', ');
        aiReply = `✅ រួចរាល់ហើយមេបញ្ជាការ! ខ្ញុំបានកត់ត្រាការកម្មង់ [${itemNames}] ចូលផ្ទាំង Order Board ជោគជ័យហើយ! 🚀`;
      }
    } else if (!aiReply) {
      aiReply = "សុំទោសមេបញ្ជាការ ខ្ញុំកំពុងវិភាគទិន្នន័យ សូមរង់ចាំបន្តិច...";
    }

    await sendTelegramMessage(botToken, chatId, aiReply);
    return res.status(200).send('OK');

  } catch (error) {
    console.error('Webhook Error:', error);
    return res.status(500).send('Error');
  }
}

async function sendTelegramMessage(token: string, chatId: string, text: string) {
  await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, text: text })
  });
}