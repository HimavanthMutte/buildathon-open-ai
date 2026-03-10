const mongoose = require("mongoose");
const https = require("https");

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/yojana-sahayak";
const TARGET_LANGS = ["hi", "te", "ta", "bn"];

const SchemeSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true },
    schemeName: { type: String, required: true },
    category: { type: String, required: true },
    ministry: { type: String, required: true },
    state: { type: String, required: true },
    targetGroups: [{ type: String }],
    eligibility: { type: String },
    benefits: { type: String },
    documentsRequired: [{ type: String }],
    applyLink: { type: String },
    description: { type: String },
    languageSupport: [{ type: String }],
    translations: {
        type: Map,
        of: Object,
        default: {},
    },
}, { timestamps: true });

const Scheme = mongoose.models.Scheme || mongoose.model("Scheme", SchemeSchema);

function translateText(text, targetLang) {
    return new Promise((resolve) => {
        if (!text) return resolve("");
        const encodedText = encodeURIComponent(text);
        const googleUrl = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=${targetLang}&dt=t&q=${encodedText}`;

        https.get(googleUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0',
                'Accept': 'application/json',
            }
        }, (res) => {
            let data = '';
            res.on('data', (chunk) => { data += chunk; });
            res.on('end', () => {
                try {
                    const parsed = JSON.parse(data);
                    if (parsed && parsed[0] && Array.isArray(parsed[0])) {
                        const translatedText = parsed[0].map(item => item[0]).filter(Boolean).join('').trim();
                        resolve(translatedText);
                    } else {
                        resolve(text);
                    }
                } catch (e) {
                    resolve(text);
                }
            });
        }).on('error', (e) => {
            console.error(`Translation failed for ${targetLang}:`, e.message);
            resolve(text);
        });
    });
}

async function run() {
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB.");

    const schemes = await Scheme.find({});
    console.log(`Found ${schemes.length} schemes.`);

    for (const scheme of schemes) {
        console.log(`\nProcessing: ${scheme.schemeName}`);
        let updated = false;

        if (!scheme.translations) {
            scheme.translations = new Map();
        }

        const translations = scheme.get('translations') || new Map();

        for (const lang of TARGET_LANGS) {
            if (!translations.has(lang)) {
                console.log(`  Translating to ${lang}...`);

                const translatedName = await translateText(scheme.schemeName, lang);
                const translatedDesc = await translateText(scheme.description, lang);
                const translatedBenefits = await translateText(scheme.benefits, lang);
                const translatedEligibility = await translateText(scheme.eligibility, lang);

                translations.set(lang, {
                    schemeName: translatedName,
                    description: translatedDesc,
                    benefits: translatedBenefits,
                    eligibility: translatedEligibility,
                });

                updated = true;

                await new Promise(r => setTimeout(r, 1000));
            } else {
                console.log(`  Already has ${lang} translation.`);
            }
        }

        if (updated) {
            scheme.set('translations', translations);
            scheme.markModified('translations');
            await scheme.save();
            console.log(`  Saved translations for ${scheme.id}`);
        }
    }

    console.log("\nFinished translating schemes.");
    await mongoose.disconnect();
}

run().catch(console.error);
