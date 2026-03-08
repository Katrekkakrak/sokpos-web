import { GoogleGenerativeAI, SchemaType } from '@google/generative-ai';
import { getApps, initializeApp, cert } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';

if (!getApps().length) {
  try {
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY || '{}');
    initializeApp({
      credential: cert(serviceAccount)
    });
    console.log("Firebase Admin Initialized Successfully!");
  } catch (error) {
    console.error("Firebase Admin Init Error:", error);
  }
}

const db = getFirestore();

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

    const settingsSnapshot = await db.collectionGroup('settings').where('aiTelegramToken', '==', botToken).limit(1).get();
    
    let tenantId = '';
    if (!settingsSnapshot.empty) {
      tenantId = settingsSnapshot.docs[0].ref.parent.parent?.id || '';
    }

    if (!tenantId) {
      await sendTelegramMessage(botToken, chatId, "❌ សុំទោសមេបញ្ជាការ! ខ្ញុំរកមិនឃើញហាងដែលភ្ជាប់ជាមួយ Bot នេះទេ។");
      return res.status(200).send('OK');
    }

    // 💡 អាប់ដេតថ្មី៖ ដំឡើងទៅ flash និងដាក់ច្បាប់ដែកថែប!
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.5-flash", // ឆ្លាតជាង Lite! អត់ឡប់ព្រួសកូដចេញមកទេ!
      tools: tools,
      systemInstruction: "អ្នកគឺជាអ្នកគ្រប់គ្រងហាងដ៏ឆ្លាតវៃ។ ច្បាប់ដែកថែប៖ ត្រូវតែឆ្លើយតបជា 'ភាសាខ្មែរ' ជានិច្ច (១០០%)! ហាមនិយាយអង់គ្លេស និងហាមបង្ហាញកូដ (Code) ដាច់ខាត! ពេលថៅកែឆាតបញ្ជាកត់ Order ហើយមានព័ត៌មានគ្រប់គ្រាន់ (ឈ្មោះអីវ៉ាន់ និងលេខទូរស័ព្ទ/ទីតាំង) សូមហៅមុខងារ 'create_direct_order' ភ្លាម។ បើខ្វះព័ត៌មាន សូមសួរគាត់ត្រឡប់ទៅវិញជាភាសាខ្មែរធម្មតា។"
    });
    
    const result = await model.generateContent(text);
    const response = result.response;
    
    let aiReply = '';
    try { aiReply = response.text(); } catch (e) {}

    const functionCalls = response.functionCalls();
    
    if (functionCalls && functionCalls.length > 0) {
      const call = functionCalls[0];
      if (call.name === "create_direct_order") {
        const args = call.args as any; 
        
        // ៦. បង្កើត Order ឲ្យត្រូវស្តង់ដារ onlineOrders ១០០%
        const newOrder = {
          id: `SB-TG-${Date.now()}`,
          amountPaid: 0,
          bankSlipImage: null,
          barcode: "",
          batches: [],
          branchId: tenantId, 
          cost: 0,
          customer: {
            address: "N/A",
            avatar: "",
            name: "Telegram Customer",
            phone: args.customerInfo || "N/A"
          },
          date: new Date().toISOString(),
          debtAmount: 0,
          deliveryDate: null,
          deposit: 0,
          description: "កម្មង់ពី Telegram AI",
          discount: 0,
          elapsedTime: "Just now",
          image: "",
          items: (args.items || []).map((i: any) => ({
             id: Date.now().toString() + Math.random().toString(36).substring(7),
             name: i.name,
             qty: i.qty,
             price: 0,
             amount: 0,
             cost: 0,
             image: ""
          })),
          method: "",
          nameKh: "",
          notes: "",
          paymentMethod: "COD",
          paymentStatus: "COD",
          shippingCarrier: "J&T Express",
          shippingDetails: { courier: "J&T Express", fee: 0 },
          shippingFee: 0,
          sku: "",
          source: "Sok AI",
          staffId: tenantId,
          staffName: "SokPos Bot",
          status: "New", 
          subtotal: 0,
          tax: 0,
          tenantId: tenantId,
          total: 0,
          transactionId: null,
          units: [],
          variants: [],
          createdAt: FieldValue.serverTimestamp()
        };

        // ប្តូរពី orders ទៅ onlineOrders វិញ!
        await db.collection('tenants').doc(tenantId).collection('onlineOrders').doc(newOrder.id).set(newOrder);
        
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