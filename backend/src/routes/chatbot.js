const express = require('express');
const { authenticate } = require('../middleware/auth');
const router = express.Router();

// Shahkot App system prompt — provides full context about the app to the AI
const SYSTEM_PROMPT = `You are the Shahkot App AI Assistant — a helpful, friendly chatbot that helps users navigate and use the Shahkot App. You ONLY answer questions about the Shahkot App. If someone asks about anything else, politely redirect them back to the app.

About the Shahkot App:
- A community app for the people of Shahkot, Pakistan (50km radius)
- Built for connecting the local community
- Brand name: "Shahkot Tigers" 🐯

FEATURES:
1. **Buy & Sell (Marketplace):** Users can list items for sale with photos, price, description, and WhatsApp contact. Categories: Electronics, Vehicles, Property, Furniture, Clothing, Sports, Books, Appliances, Mobiles, Other. Buyers contact sellers via WhatsApp. Owners can mark items as sold or delete listings.

2. **Open Chat (Community):** A public chatroom for the Shahkot community. Users can send text, images, and voice messages. Reply to messages and report inappropriate content. No videos allowed.

3. **Rishta (Matrimonial):** Users apply with CNIC front/back images, age, gender, education, occupation, family details, and preferences. Must sign a strict digital agreement. Admin verifies CNIC. After approval, users can browse other verified profiles, send interest, and shortlist profiles. When BOTH parties accept interest, a PRIVATE CHAT is automatically created between them where they can text, send pictures, block, or report. Max 5 profile photos. "Respect is Mandatory" — any vulgar or inappropriate behavior leads to account ban and legal action.

4. **Private DM Chat:** When Rishta interest is accepted by both sides, a private chat opens automatically. Users can send text messages, share pictures (up to 3 at once), block the other person, or report inappropriate behavior. A "Respect is Mandatory" banner is always shown. All chats are monitored by admins for safety.

5. **Tournaments:** ANY user can create cricket, football, kabaddi, volleyball, hockey, badminton, or table tennis tournaments. Add team names, match schedules with teams, date, time, venue, and results. Creators and admins can edit/delete. Prize and entry fee info supported.

6. **Live Events:** Admin posts live events with YouTube/Facebook stream URLs or video links. Users can watch live streams. Events can be toggled live/ended.

7. **News & Articles:** News reporters (admin-approved) and admins can post local news with images. Categories: Local, Sports, Education, Politics, Business, Health, Entertainment, Other.

8. **Blood Donation:** Register as a blood donor (A+, A-, B+, B-, AB+, AB-, O+, O-). Find donors by blood group. Toggle availability. Emergency donors are highlighted in red. Help save lives!

9. **Bazar Finder:** Search for shops in Shahkot by product name. Shops are listed with name, address, contact number, and categories of products they sell.

10. **Govt Offices:** Directory of government offices in Shahkot with address, helpline numbers, and office timings.

11. **Police Announcements:** Official police announcements including safety alerts, missing persons, wanted notices, traffic updates, and emergency alerts. Urgent announcements are highlighted.

12. **Helpline:** Emergency and important phone numbers for Shahkot — police, hospital, fire brigade, Edhi, Rescue 1122, etc.

13. **Weather:** Current weather information and forecast for Shahkot.

14. **Notifications:** Bell icon shows all app notifications — interests, reports, announcements etc.

15. **AI Help (You!):** This chatbot — helps users learn about the app features and navigate.

USER ROLES:
- USER: Basic registered user (must be within 50km of Shahkot)
- VERIFIED_USER: User verified by admin (required for Rishta profile browsing)
- NEWS_REPORTER: Can post news articles (admin-approved role)
- ADMIN: Full control — manage users, listings, tournaments, events, reports, etc.

NAVIGATION:
- Bottom tabs: Home, Buy & Sell, Chat, Rishta, Profile
- Home screen: Quick access to ALL features + trending listings + latest news + upcoming tournaments
- Explore: Search and find all features in one place

IMPORTANT RULES:
- The app restricts registration to users within 50km of Shahkot
- No video uploads allowed anywhere in the app
- WhatsApp is required for marketplace listings
- CNIC verification is mandatory for Rishta
- First user with admin phone number becomes admin
- Phone numbers: 03XXXXXXXXX and +923XXXXXXXXX are treated as the same number
- Respect is MANDATORY in all chats — violations lead to bans
- Any fraud or illegal activity in Rishta will result in legal action

Reply in simple Urdu-English mix (Roman Urdu) that Shahkot people would understand. Keep answers short and helpful. Use emojis to be friendly. 🐯`;

// Helper: wait for ms milliseconds
const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Retry config
const MAX_RETRIES = 3;
const RETRY_DELAYS = [2000, 4000, 6000]; // escalating backoff
const REQUEST_TIMEOUT = 15000; // 15s per attempt

// Helper: call LongCat API once with abort timeout
async function callLongCat(apiKey, apiUrl, model, message) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

    try {
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model,
                messages: [
                    { role: 'system', content: SYSTEM_PROMPT },
                    { role: 'user', content: message.trim() },
                ],
                max_tokens: 1000,
                temperature: 0.7,
            }),
            signal: controller.signal,
        });
        clearTimeout(timeout);
        return response;
    } catch (err) {
        clearTimeout(timeout);
        throw err;
    }
}

// Helper: call with retries + exponential backoff
async function callWithRetries(apiKey, apiUrl, model, message) {
    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
        try {
            const response = await callLongCat(apiKey, apiUrl, model, message);
            if (response.ok) {
                const data = await response.json();
                return data.choices?.[0]?.message?.content || null;
            }
            console.warn(`LongCat attempt ${attempt + 1}/${MAX_RETRIES} failed: HTTP ${response.status}`);
        } catch (err) {
            console.warn(`LongCat attempt ${attempt + 1}/${MAX_RETRIES} error: ${err.message}`);
        }
        if (attempt < MAX_RETRIES - 1) {
            await wait(RETRY_DELAYS[attempt]);
        }
    }
    return null; // all retries failed
}

// Keyword-based fallback when AI API is completely down
function getFallbackReply(message) {
    const msg = message.toLowerCase();
    if (msg.includes('buy') || msg.includes('sell') || msg.includes('marketplace') || msg.includes('listing'))
        return '🛒 Buy & Sell ke liye Home screen pe "Buy & Sell" icon tap karein. Wahan aap apni cheezein bech sakte hain ya khareed sakte hain. Seller ka WhatsApp number hota hai — tap karke directly contact kar sakte hain! 📱';
    if (msg.includes('rishta') || msg.includes('shaadi') || msg.includes('marriage'))
        return '💍 Rishta feature ke liye bottom tab pe "Rishta" tap karein. Pehle apna profile banayein CNIC ke saath, phir Admin verify karega. Verify hone ke baad profiles browse karein aur interest bhejein. Jab DONO accept karein to private chat khul jayegi — wahan pictures bhi bhej sakte hain! 🤝 Respect is Mandatory!';
    if (msg.includes('tournament') || msg.includes('cricket') || msg.includes('match') || msg.includes('sports'))
        return '🏏 Tournaments ke liye Home screen ya Explore mein "Sports" tap karein. Koi bhi user tournament bana sakta hai — cricket, football, kabaddi etc. Teams add karein, match schedule banayein aur results update karein! Prize aur entry fee bhi set kar sakte hain 🏆';
    if (msg.includes('blood') || msg.includes('donor') || msg.includes('khoon'))
        return '🩸 Blood Donation ke liye Home screen pe "Blood" icon tap karein. Wahan aap apna blood group register kar sakte hain aur donors dhundh sakte hain. Emergency donors highlighted hote hain!';
    if (msg.includes('chat') || msg.includes('message') || msg.includes('group'))
        return '💬 Open Chat community ka public chatroom hai — bottom tab pe "Chat" tap karein phir "Open Chat" select karein. Yahan text, images, aur voice messages bhej sakte hain. Reply aur reactions bhi hain!';
    if (msg.includes('news') || msg.includes('khabar'))
        return '📰 News ke liye Home se "News" ya Explore mein "News & Articles" tap karein. Local news, sports, politics sab categories hain. News Reporters admin-approved users hote hain.';
    if (msg.includes('weather') || msg.includes('mosam'))
        return '🌤️ Weather ke liye Home screen pe "Weather" icon tap karein. Shahkot ka current weather aur forecast dekhein!';
    if (msg.includes('shop') || msg.includes('bazar') || msg.includes('dukan'))
        return '🏪 Bazar Finder ke liye Home se "Bazar" tap karein. Product name search karein aur Shahkot ki dukanen dhundhein — unka address, contact number sab milega!';
    if (msg.includes('govt') || msg.includes('office') || msg.includes('sarkari'))
        return '🏛️ Govt Offices ka directory Home screen pe available hai — "Govt Offices" tap karein. Address, helpline numbers, aur timings sab milenge.';
    if (msg.includes('dm') || msg.includes('private') || msg.includes('direct'))
        return '📨 Private Chat Rishta mein interest accept hone ke baad automatically khulti hai. Wahan text, pictures bhej sakte hain. Block aur Report ka option bhi hai. 🤝 Respect is Mandatory — koi bhi inappropriate behavior ban ka sabab banega.';
    if (msg.includes('live') || msg.includes('stream') || msg.includes('event'))
        return '📺 Live Events admin post karta hai — YouTube/Facebook stream URLs ke saath. Home screen pe "Live Events" mein dekhein!';
    if (msg.includes('help') || msg.includes('kaise') || msg.includes('how'))
        return '📖 App kaise use karein:\n\n1️⃣ Home screen pe sab features hain\n2️⃣ Bottom tabs: Home, Buy & Sell, Chat, Rishta, Profile\n3️⃣ Explore page se kuch bhi search karein\n4️⃣ Notifications bell icon se check karein\n\nKoi specific sawal ho to poochiye! 😊';
    // Default fallback
    return '🤖 Main Shahkot App ka AI Helper hoon! Mujhse app ke baare mein poochiye — Buy & Sell, Rishta, Chat, Tournaments, Blood Donation, ya koi bhi feature. Abhi AI thoda busy hai, lekin main basic sawaalon ka jawab de sakta hoon! 💬';
}

/**
 * POST /api/chatbot/message
 * Send a message to the AI chatbot (3 retries with exponential backoff + offline fallback)
 */
router.post('/message', authenticate, async (req, res) => {
    try {
        const { message } = req.body;

        if (!message || message.trim().length === 0) {
            return res.status(400).json({ error: 'Message is required.' });
        }

        const apiKey = process.env.LONGCAT_API_KEY;
        const apiUrl = process.env.LONGCAT_API_URL || 'https://api.longcat.chat/openai/v1/chat/completions';
        const model = process.env.LONGCAT_MODEL || 'LongCat-Flash-Chat';

        if (!apiKey) {
            // No API key — use fallback
            return res.json({ reply: getFallbackReply(message) });
        }

        // Try API with retries
        const reply = await callWithRetries(apiKey, apiUrl, model, message);

        if (reply) {
            return res.json({ reply });
        }

        // All retries failed — use keyword fallback instead of error
        console.warn('All LongCat retries exhausted, using fallback response');
        return res.json({ reply: getFallbackReply(message) });
    } catch (error) {
        console.error('Chatbot error:', error);
        // Even on unexpected errors, give a useful fallback
        return res.json({ reply: getFallbackReply(req.body?.message || '') });
    }
});

module.exports = router;
