import { auth, db } from '../src/config/firebase';
import { doc, getDoc } from 'firebase/firestore';

export const sendLowStockAlert = async (productName: string, remainingStock: number, sku: string = 'N/A') => {
    try {
        // Check if user is authenticated
        if (!auth.currentUser?.uid) {
            console.warn('⚠️ User not authenticated. Skipping Telegram alert.');
            return false;
        }

        // Fetch Telegram credentials from Firestore
        const settingsRef = doc(db, 'tenants', auth.currentUser.uid, 'settings', 'shopSettings');
        const settingsSnap = await getDoc(settingsRef);

        let telegramToken = "";
        let chatId = "";

        if (settingsSnap.exists()) {
            const data = settingsSnap.data();
            telegramToken = data.telegramToken || "";
            chatId = data.telegramChatId || "";
        }

        // Only proceed if both credentials exist
        if (!telegramToken || !chatId) {
            console.warn('⚠️ Telegram credentials not found for this tenant. Skipping alert.');
            return false;
        }

        const text = `🚨 <b>ប្រកាសអាសន្ន: ស្តុកជិតអស់!</b>\n\n📦 <b>ទំនិញ:</b> ${productName}\n🔖 <b>SKU:</b> ${sku}\n📉 <b>សល់ត្រឹមតែ:</b> ${remainingStock}\n\n<i>សូមប្រញាប់ធ្វើការកម្ម៉ង់បន្ថែម!</i>`;
        
        const response = await fetch(`https://api.telegram.org/bot${telegramToken}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chat_id: chatId,
                text: text,
                parse_mode: 'HTML'
            })
        });
        
        if (!response.ok) throw new Error('Telegram API error');
        console.log("✅ Low stock alert sent successfully!");
        return true;
    } catch (error) {
        console.error("❌ Failed to send low stock alert:", error);
        return false;
    }
};

export const sendReceiptAlert = async (order: any) => {
    try {
        // Check if user is authenticated
        if (!auth.currentUser?.uid) {
            console.warn('⚠️ User not authenticated. Skipping Telegram alert.');
            return false;
        }

        // Fetch Telegram credentials from Firestore
        const settingsRef = doc(db, 'tenants', auth.currentUser.uid, 'settings', 'shopSettings');
        const settingsSnap = await getDoc(settingsRef);

        let telegramToken = "";
        let chatId = "";

        if (settingsSnap.exists()) {
            const data = settingsSnap.data();
            telegramToken = data.telegramToken || "";
            chatId = data.telegramChatId || "";
        }

        // Only proceed if both credentials exist
        if (!telegramToken || !chatId) {
            console.warn('⚠️ Telegram credentials not found for this tenant. Skipping alert.');
            return false;
        }

        // Format items list with safe fallbacks, including unit names for UOM support
        const itemsList = order?.items?.map((item: any) => {
            const itemName = item?.name || 'Unknown Item';
            const qty = Number(item?.quantity) || 1;
            const unitName = item?.selectedUnit || 'unit';
            const price = Number(item?.selectedUnitPrice || item?.price) || 0;
            const itemTotal = (price * qty).toFixed(2);
            return `- ${itemName} x${qty} ${unitName}s = $${itemTotal}`;
        }).join('\n') || '📭 No items';

        const orderId = order?.id || order?.receiptId || 'N/A';
        const totalAmount = Number(order?.total || order?.subtotal || 0).toFixed(2);
        const paymentMethod = order?.paymentMethod || order?.method || order?.status || 'Unknown';

        const text = `🧾 <b>វិក្កយបត្រថ្មី: #${orderId}</b>\n⏱ <b>ម៉ោង:</b> ${new Date().toLocaleString('en-GB')}\n-----------------------------\n🛒 <b>ទំនិញ:</b>\n${itemsList}\n-----------------------------\n💰 <b>សរុប (Total):</b> $${totalAmount}\n💳 <b>បង់តាម:</b> ${paymentMethod}\n\n✅ <i>ការលក់ជោគជ័យ!</i>`;

        const response = await fetch(`https://api.telegram.org/bot${telegramToken}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                chat_id: chatId, 
                text: text, 
                parse_mode: 'HTML' 
            })
        });
        
        if (!response.ok) throw new Error('Telegram API error');
        console.log("✅ Receipt alert sent to Telegram successfully!");
        return true;
    } catch (error) {
        console.error("❌ Failed to send receipt alert:", error);
        return false;
    }
};
