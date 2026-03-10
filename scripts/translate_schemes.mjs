import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://himu26:HHimavanth4762105@ac-ldqb0tl-shard-00-00.rwe1nc9.mongodb.net:27017,ac-ldqb0tl-shard-00-01.rwe1nc9.mongodb.net:27017,ac-ldqb0tl-shard-00-02.rwe1nc9.mongodb.net:27017/yojana-sahayak?ssl=true&replicaSet=atlas-j8s18y-shard-0&authSource=admin&retryWrites=true&w=majority&appName=HimuCluster";
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

async function translateText(text, targetLang) {
    if (!text) return "";
    try {
        const encodedText = encodeURIComponent(text);
        const googleUrl = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=${targetLang}&dt=t&q=${encodedText}`;
        const response = await fetch(googleUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0',
                'Accept': 'application/json',
            },
        });
        if (response.ok) {
            const data = await response.json();
            if (data && data[0] && Array.isArray(data[0])) {
                const translatedText = data[0].map(item => item[0]).filter(Boolean).join('').trim();
                return translatedText;
            }
        }
    } catch (err) {
        console.error(`Translation failed for ${targetLang}:`, err.message);
    }
    return text; // Fallback
}

async function run() {
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB.");

    const schemes = await Scheme.find({});
    console.log(`Found ${schemes.length} schemes.`);

    for (const scheme of schemes) {
        console.log(`\nProcessing: ${scheme.schemeName}`);
        let updated = false;

        // Ensure translations map exists
        if (!scheme.translations) {
            scheme.translations = new Map();
        }

        // Convert existing translations if it's an old format
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

                // Sleep slightly to respect rate limits
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
