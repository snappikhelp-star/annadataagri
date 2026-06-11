/* ─── Annadata Agri & Seeds — SEO Review Engine ─── */
// Generates unique, natural, location-aware review text and shop reply text.
// Avoids repetition by randomly combining independent fragments.
// Target: 4,800+ unique review combinations; 1,200+ unique reply combinations.

export const LOCATIONS = [
  "Salamatpur", "Sanchi", "Raisen", "Vidisha", "Gyaraspur",
  "Bhopal", "Begumganj", "Bareli", "Obedullaganj", "Udaipura", "Silwani", "Mandideep",
];

export const SERVICES = [
  "धान बीज (1886/PB1)",
  "धान की दवाई",
  "धान प्रोजेक्ट",
  "कीटनाशक / दवाई",
  "खरपतवार नाशक",
  "खाद / Fertilizer",
  "किसान सलाह",
  "घर तक डिलीवरी",
];

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

/* ══════════════════════════════════════════════════
   CUSTOMER REVIEW FRAGMENTS
══════════════════════════════════════════════════ */

const REVIEW_OPENS: Record<string, Record<number | string, string[]>> = {
  hi: {
    5: [
      "दिल से धन्यवाद केशव भाई!",
      "बहुत शानदार अनुभव रहा!",
      "सच में बेहतरीन दुकान है!",
      "पूरी तरह से संतुष्ट हूं!",
      "हर किसान भाई को यहाँ जरूर जाना चाहिए!",
      "असली माल, सही दाम — यही है Annadata!",
      "केशव भाई पर पूरा भरोसा है!",
      "रायसेन जिले की सबसे भरोसेमंद कृषि दुकान!",
      "एक बार आए, बार-बार आना पड़ेगा!",
      "किसानों का असली साथी — अन्नदाता!",
      "मेरी फसल ने इस साल रिकॉर्ड पैदावार दी!",
      "बहुत खुश हूं इस दुकान से!",
    ],
    4: [
      "काफी अच्छा अनुभव रहा।",
      "अच्छी दुकान है, संतुष्ट हूं।",
      "केशव भाई की सलाह अच्छी लगी।",
      "सामान की quality ठीक रही।",
      "कुल मिलाकर अच्छी सेवा मिली।",
      "ज्यादातर चीजें बढ़िया रहीं।",
    ],
    3: [
      "ठीक-ठाक अनुभव रहा।",
      "सेवा average रही।",
      "काम चल जाता है।",
    ],
  },
  hi_en: {
    5: [
      "Annadata Agri pe bahut achha experience raha!",
      "Keshav Bhai ki service best hai yaar!",
      "Ekdum zabardast service mili!",
      "Sach mein best agri shop hai yeh MP mein!",
      "Pura dil se recommend karta hoon!",
      "Itna achha shop aur itne saste daam — kamaal hai!",
      "Is baar crop ka result bahut achha aaya!",
      "Keshav Bhai ne sahi variety suggest ki — fayda hua!",
      "Pehli baar gaya tha, ab regular ho gaya hoon!",
    ],
    4: [
      "Achha experience raha overall.",
      "Quality theek rahi, kafi satisfied hoon.",
      "Keshav Bhai ne acchi advice di.",
      "Aage bhi yahi se lunga.",
    ],
    3: [
      "Theek-thaak raha, improvements ho sakti hain.",
      "Average experience raha.",
    ],
  },
  en: {
    5: [
      "Excellent experience at Annadata Agri & Seeds!",
      "Best agriculture shop in Raisen district!",
      "Highly recommended for all farmers!",
      "Keshav Bhai is very knowledgeable and honest!",
      "Top quality seeds and genuine products!",
      "The crop results this season were outstanding!",
      "Best place to buy seeds and pesticides in MP!",
      "Trusted by all farmers around Salamatpur!",
      "Great service and genuine agricultural advice!",
    ],
    4: [
      "Good experience overall.",
      "Quality products at fair prices.",
      "Keshav Bhai gave good crop advice.",
      "Satisfied with the service.",
    ],
    3: [
      "Average experience.",
      "Things were okay.",
    ],
  },
};

const SERVICE_PHRASES: Record<string, Record<string, string[]>> = {
  hi: {
    "धान बीज (1886/PB1)": [
      "1886 हाइब्रिड धान बीज का अंकुरण 95%+ रहा।",
      "PB1 धान बीज की quality लाजवाब थी।",
      "सही variety बताई, फसल रिकॉर्ड हुई।",
      "धान बीज certified और असली था।",
      "1886 variety से इस साल दोगुनी पैदावार हुई।",
    ],
    "धान की दवाई": [
      "WhatsApp पर photo देखकर सही दवाई बताई।",
      "सही दवाई से फसल 3 दिन में ठीक हुई।",
      "घर तक दवाई पहुँचाई — बहुत सुविधाजनक।",
      "Blast और Sheath Blight की सही दवाई मिली।",
      "धान की दवाई की dose और timing बिल्कुल सही बताई।",
    ],
    "धान प्रोजेक्ट": [
      "पूरा धान प्रोजेक्ट plan शानदार रहा।",
      "बीज से harvest तक पूरी guidance मिली।",
      "धान project में केशव भाई ने हर कदम साथ दिया।",
    ],
    "कीटनाशक / दवाई": [
      "असली brand का कीटनाशक मिला, काम आया।",
      "फसल के रोग पूरी तरह ठीक हुए।",
      "सही कीटनाशक और सही dose बताई।",
      "कीड़ा एक ही spray में खत्म हो गया।",
    ],
    "खरपतवार नाशक": [
      "एक Spray में खेत बिल्कुल साफ हो गया।",
      "खरपतवार नाशक बहुत effective था।",
      "सही dose और सही समय बताया।",
    ],
    "खाद / Fertilizer": [
      "Zinc और Boron की सही advice मिली।",
      "DAP और Urea की सही मात्रा बताई।",
      "Fertilizer से फसल की ग्रोथ बहुत बेहतर हुई।",
    ],
    "किसान सलाह": [
      "निःशुल्क सलाह से फसल बच गई।",
      "WhatsApp पर तुरंत सही सलाह मिली।",
      "Keshav Bhai ने problem accurately diagnose की।",
      "रात को WhatsApp किया, सुबह जवाब मिला।",
    ],
    "घर तक डिलीवरी": [
      "घर पर ही सामान मिल गया — दुकान नहीं जाना पड़ा।",
      "समय पर delivery हुई, packaging अच्छी थी।",
      "Door delivery बहुत convenient है किसानों के लिए।",
    ],
    default: [
      "सेवा बहुत अच्छी रही।",
      "केशव भाई ने सही guidance दी।",
      "quality और price दोनों सही थे।",
    ],
  },
  hi_en: {
    "धान बीज (1886/PB1)": [
      "1886 hybrid dhan seed ka germination 95%+ tha!",
      "PB1 variety recommend ki, crop zyada hui!",
      "Certified dhan beej mila, result zabardast raha.",
    ],
    "धान की दवाई": [
      "WhatsApp pe photo bheja, turant sahi dawai batai!",
      "Dhan ki bimari 3 din mein theek ho gayi.",
      "Ghar tak dawai pahunchadi — bahut convenient!",
    ],
    "धान प्रोजेक्ट": [
      "Pura dhan project plan excellent tha.",
      "Beej se harvest tak guidance mili.",
    ],
    "कीटनाशक / दवाई": [
      "Asli brand ka keetnashak mila, kaam aaya.",
      "Fasal ka roga theek hua ek hi spray mein.",
    ],
    "खरपतवार नाशक": [
      "Ek spray mein khet saaf ho gaya!",
      "Weed killer ka dose aur timing sahi bataya.",
    ],
    "खाद / Fertilizer": [
      "Zinc aur Boron ki sahi advice di.",
      "Fertilizer se crop growth bahut better hui.",
    ],
    "किसान सलाह": [
      "Free advice se fasal bach gayi!",
      "WhatsApp pe turant jawab mila.",
    ],
    "घर तक डिलीवरी": [
      "Ghar pe hi saman aa gaya — convenient!",
      "Time pe delivery, packing bhi sahi thi.",
    ],
    default: [
      "Service bahut achhi rahi.",
      "Quality aur price dono theek the.",
    ],
  },
  en: {
    "धान बीज (1886/PB1)": [
      "The 1886 hybrid paddy seed had over 95% germination.",
      "PB1 variety gave record harvest this season.",
      "Certified genuine seeds — excellent results.",
    ],
    "धान की दवाई": [
      "Sent a WhatsApp photo, got the right medicine instantly.",
      "Crop disease recovered within 3 days.",
      "Home delivery of crop medicine — very convenient.",
    ],
    "धान प्रोजेक्ट": [
      "The Dhan Project plan was excellent.",
      "Got complete guidance from sowing to harvest.",
    ],
    "कीटनाशक / दवाई": [
      "Genuine branded pesticide worked perfectly.",
      "Crop disease cured in just one spray.",
    ],
    "खरपतवार नाशक": [
      "Field was completely weed-free in one spray.",
      "Correct herbicide dosage advice was very helpful.",
    ],
    "खाद / Fertilizer": [
      "Got the right fertilizer advice for my soil.",
      "Proper Zinc and Boron guidance improved crop yield.",
    ],
    "किसान सलाह": [
      "Free expert advice saved my crop.",
      "Got instant reply on WhatsApp — very helpful.",
    ],
    "घर तक डिलीवरी": [
      "Got home delivery — didn't need to visit the shop.",
      "On-time delivery with proper packaging.",
    ],
    default: [
      "Excellent service and genuine products.",
      "Good quality at fair prices.",
    ],
  },
};

const LOC_PHRASES: Record<string, string[]> = {
  hi: [
    "{loc} के किसान भाइयों के लिए यह best shop है।",
    "{loc} से आने वाले सभी किसान यहाँ आते हैं।",
    "{loc} और आसपास के गाँवों में इसकी बहुत तारीफ है।",
    "{loc} की तरफ से देखें तो यह सबसे नजदीकी और भरोसेमंद है।",
    "Annadata Agri Salamatpur, {loc} के किसानों का पहला choice है।",
  ],
  hi_en: [
    "{loc} ke kisan bhai yahi se lete hain.",
    "{loc} side ke sabhi farmers yahan aate hain.",
    "Annadata Agri, {loc} area ke liye best option hai.",
  ],
  en: [
    "Farmers from {loc} always shop here.",
    "Best seeds shop for {loc} area farmers.",
    "Annadata Agri is the top choice for {loc} farmers.",
  ],
};

const REVIEW_CLOSES: Record<string, Record<number | string, string[]>> = {
  hi: {
    5: [
      "100% recommend करता हूं — जरूर आएं!",
      "अगले सीजन भी यहीं से लूंगा — पक्का!",
      "पूरे गाँव को recommend कर दिया।",
      "हार्दिक आभार केशव भाई!",
      "आपकी दुकान सच में Annadata (भगवान का दिया अनाज) है!",
      "किसान भाइयों — एक बार जरूर आएं!",
      "Best agri shop in Madhya Pradesh!",
    ],
    4: [
      "अगली बार फिर आऊंगा।",
      "कुल मिलाकर अच्छी दुकान।",
      "Recommend करूंगा अपने मित्रों को।",
    ],
    3: [
      "सुधार की उम्मीद है।",
      "अगले सीजन देखेंगे।",
    ],
  },
  hi_en: {
    5: [
      "100% recommend karta hoon — zaroor aao!",
      "Agla season bhi yahan se hi lunga!",
      "Pure gaon ko suggest kar diya!",
      "Keshav Bhai ka dil se shukriya!",
      "Best agri shop MP mein — must visit!",
    ],
    4: [
      "Agli baar phir aaunga.",
      "Overall achhi shop hai.",
    ],
    3: [
      "Thodi improvements chahiye.",
      "Agli baar dekhenge.",
    ],
  },
  en: {
    5: [
      "100% recommended for all farmers!",
      "Will definitely come back next season!",
      "Told all my village friends about this shop!",
      "Best agricultural shop in Madhya Pradesh!",
      "Keshav Bhai is a true Annadata — provider!",
    ],
    4: [
      "Will visit again.",
      "Good shop overall.",
    ],
    3: [
      "Some improvements needed.",
      "Will see next time.",
    ],
  },
};

/* ══════════════════════════════════════════════════
   SHOP REPLY FRAGMENTS (for Keshav Bhai to reply)
══════════════════════════════════════════════════ */

const REPLY_OPENS: Record<string, string[]> = {
  hi: [
    "बहुत धन्यवाद आपकी प्रतिक्रिया के लिए!",
    "आपका आभार! किसान भाइयों का विश्वास हमारी ताकत है।",
    "हृदय से धन्यवाद!",
    "आपकी बात सुनकर मन खुश हो गया!",
    "शुक्रिया भाई! किसानों की सेवा ही हमारा धर्म है।",
    "बहुत बहुत शुक्रिया!",
    "आपका भरोसा हमारे लिए बहुत कीमती है।",
    "धन्यवाद! यही हमारी असली कमाई है।",
  ],
  hi_en: [
    "Bahut shukriya aapke review ke liye!",
    "Thank you bhai! Aapka vishwas hamari strength hai.",
    "Dil se shukriya!",
    "Aapki baat sun ke bahut achha laga!",
    "Thanks a lot! Kisan seva hi hamara kaam hai.",
  ],
  en: [
    "Thank you so much for your kind review!",
    "Your trust means everything to us!",
    "We are grateful for your feedback!",
    "Thank you for visiting Annadata Agri & Seeds!",
    "Much appreciated! Farmer satisfaction is our mission.",
  ],
};

const REPLY_BODIES: Record<string, string[]> = {
  hi: [
    "Annadata Agri & Seeds, Salamatpur में आपका स्वागत हमेशा है।",
    "रायसेन, सांची, विदिशा के किसानों को सर्वश्रेष्ठ सेवा देना हमारा लक्ष्य है।",
    "सलामतपुर से बेगमगंज, बरेली, ओबेदुल्लागंज तक — हम हर किसान के साथ हैं।",
    "Gyaraspur, Udaipura, Silwani के भाइयों को भी हमारी सेवा उपलब्ध है।",
    "Mandideep, Bhopal के किसान भी हमसे WhatsApp पर सलाह ले सकते हैं।",
    "गुणवत्तापूर्ण बीज और कृषि सलाह देना हमारा उद्देश्य है।",
    "किसान की मुस्कान — यही हमारी असली कमाई है।",
    "Seeds Shop Salamatpur में आपका भरोसा हमारे लिए सबसे बड़ा पुरस्कार है।",
    "Best Agriculture Store Raisen में आपकी सेवा के लिए हम हमेशा तैयार हैं।",
  ],
  hi_en: [
    "Annadata Agri, Salamatpur mein aapka hamesha swagat hai.",
    "Raisen, Sanchi, Vidisha ke farmers ko best service dena hamara goal hai.",
    "Salamatpur se Begumganj, Bareli tak — har kisan ke saath hain hum.",
    "WhatsApp pe seedha Keshav Bhai se baat karein — free advice milegi.",
    "Quality seeds aur genuine pesticides — yahi hai Annadata ki pehchaan.",
  ],
  en: [
    "Annadata Agri & Seeds, Salamatpur always welcomes you.",
    "Serving farmers from Raisen, Sanchi, Vidisha and all of MP is our mission.",
    "From Salamatpur to Bhopal, Begumganj, Bareli — we serve all farmers.",
    "Quality seeds and genuine agri solutions — that is Annadata's promise.",
    "Farmers from Obedullaganj, Udaipura, Silwani, Mandideep trust us.",
  ],
};

const REPLY_CLOSES: Record<string, string[]> = {
  hi: [
    "फिर से आएं — हम आपकी सेवा में हमेशा हाजिर हैं। 🌾",
    "जय जवान जय किसान! 🙏",
    "अन्नदाता — किसान का साथी, खेती का सहारा। 🌱",
    "हमें Google पर 5 ⭐ देने के लिए धन्यवाद!",
    "आपकी फसल हमेशा अच्छी हो — यही हमारी दुआ है। 🌾",
    "Keshav Bhai — Annadata Agri & Seeds, Salamatpur 🌿",
  ],
  hi_en: [
    "Phir aana bhai — hum ready hain! 🌾",
    "Jai Kisan! Annadata ke saath kheti better hogi. 🙏",
    "5 ⭐ review dene ka shukriya! 🌱",
    "Keshav Bhai — Annadata Agri, Salamatpur Raisen 🌿",
  ],
  en: [
    "Visit us again — we are always here for you! 🌾",
    "Jai Kisan! Thank you for supporting Annadata. 🙏",
    "Thank you for the 5-star review! 🌱",
    "Keshav Meena — Annadata Agri & Seeds, Salamatpur, Raisen MP 🌿",
  ],
};

/* ══════════════════════════════════════════════════
   PUBLIC API
══════════════════════════════════════════════════ */

export type Lang = "hi" | "hi_en" | "en";

export function generateCustomerReview(
  rating: number,
  service: string,
  lang: Lang = "hi",
): string {
  const r = rating <= 3 ? 3 : rating <= 4 ? 4 : 5;
  const opens = REVIEW_OPENS[lang]?.[r] ?? REVIEW_OPENS.hi[5];
  const svcPool = SERVICE_PHRASES[lang]?.[service] ?? SERVICE_PHRASES[lang]?.default ?? [];
  const locTmpl = pick(LOC_PHRASES[lang] ?? LOC_PHRASES.hi);
  const loc = pick(LOCATIONS);
  const closes = REVIEW_CLOSES[lang]?.[r] ?? REVIEW_CLOSES.hi[5];

  const parts = [
    pick(opens),
    svcPool.length ? pick(svcPool) : "",
    locTmpl.replace("{loc}", loc),
    pick(closes),
  ].filter(Boolean);

  const raw = parts.join(" ");
  return raw.length > 250 ? raw.slice(0, 247).trimEnd() + "…" : raw;
}

export function generateShopReply(
  rating: number,
  lang: Lang = "hi",
): string {
  const loc = pick(LOCATIONS);
  const body = pick(REPLY_BODIES[lang] ?? REPLY_BODIES.hi);
  const open = pick(REPLY_OPENS[lang] ?? REPLY_OPENS.hi);
  const close = pick(REPLY_CLOSES[lang] ?? REPLY_CLOSES.hi);

  let mid = body;
  // For 3★ replies add improvement note
  if (rating <= 3) {
    const notes: Record<Lang, string> = {
      hi: "आपकी राय से हम बेहतर बनेंगे।",
      hi_en: "Aapki feedback se hum improve karenge.",
      en: "We will improve based on your feedback.",
    };
    mid = notes[lang];
  }

  const raw = `${open} ${mid} ${close}`;
  return raw.length > 250 ? raw.slice(0, 247).trimEnd() + "…" : raw;
}

/* ─── SEO Schema Helpers ─── */

export const LOCAL_BUSINESS_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "@id": "https://annadataagri.com/#business",
  name: "Annadata Agri & Seeds",
  alternateName: ["अन्नदाता एग्री एंड सीड्स", "Annadata Agri Salamatpur", "Beej Bhandar Raisen"],
  description:
    "Best seeds shop and agriculture store in Salamatpur, Raisen, Madhya Pradesh. Serving farmers from Raisen, Sanchi, Vidisha, Bhopal, Begumganj, Bareli, Obedullaganj, Udaipura, Silwani, Mandideep and all of MP with quality hybrid seeds, pesticides, fertilizers and free farm advice.",
  url: "https://annadataagri.com",
  telephone: "+919691712455",
  email: "annadataagriandseeds@gmail.com",
  image: "https://annadataagri.com/og-image.jpg",
  priceRange: "₹₹",
  currenciesAccepted: "INR",
  paymentAccepted: "Cash, UPI",
  openingHours: "Mo-Sa 08:00-20:00",
  address: {
    "@type": "PostalAddress",
    streetAddress: "Raisen Road, Trimurti Chouraha, Salamatpur",
    addressLocality: "Raisen",
    addressRegion: "Madhya Pradesh",
    postalCode: "464993",
    addressCountry: "IN",
  },
  geo: {
    "@type": "GeoCoordinates",
    latitude: 23.3248,
    longitude: 77.7814,
  },
  hasMap: "https://maps.app.goo.gl/42WDXZz6qG67UkQY7",
  sameAs: [
    "https://www.instagram.com/ANNADATA_AGRI_AND_SEEDS",
    "https://www.facebook.com/share/1NNq1tBFvf/",
    "https://youtube.com/@keshavmeena2912",
  ],
  aggregateRating: {
    "@type": "AggregateRating",
    ratingValue: "4.9",
    reviewCount: "200",
    bestRating: "5",
    worstRating: "1",
  },
};

export const FAQ_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "Seeds shop near Raisen MP?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Annadata Agri & Seeds at Raisen Road, Trimurti Chouraha, Salamatpur, Dist. Raisen MP is the best seeds shop near Raisen. Call: 9691712455.",
      },
    },
    {
      "@type": "Question",
      name: "Beej Bhandar Salamatpur kahan hai?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Annadata Agri & Seeds, Raisen Road, Trimurti Chouraha, Salamatpur, Dist. Raisen MP. Call: 9691712455. Hybrid dhan beej, soyabean, gehu, chana aur sabhi fasal ki dawai uplabdh hai.",
      },
    },
    {
      "@type": "Question",
      name: "Agriculture store near Sanchi Vidisha?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Annadata Agri & Seeds, Salamatpur Raisen MP is the nearest trusted agriculture store for farmers in Sanchi, Vidisha, Gyaraspur, Bhopal, Begumganj and nearby areas.",
      },
    },
    {
      "@type": "Question",
      name: "1886 Dhan beej kahan milega?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "1886 Hybrid Dhan beej aur PB1 dhan beej Annadata Agri & Seeds, Salamatpur Raisen MP mein milta hai. Home delivery bhi uplabdh hai. WhatsApp: 9691712455.",
      },
    },
    {
      "@type": "Question",
      name: "Dhan ki dawai home delivery Raisen MP?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Annadata Agri & Seeds se dhan ki dawai, keetnaashak, kharpatwar naashak aur beej ghar tak delivary hoti hai. WhatsApp 9691712455 par order karein.",
      },
    },
    {
      "@type": "Question",
      name: "Free krishi salah kaise milegi?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Annadata Agri & Seeds ke Keshav Bhai se WhatsApp (9691712455) par fasal ki photo bhejein — turant free salaah milegi. Farmers from Bhopal, Obedullaganj, Udaipura, Silwani, Mandideep bhi contact kar sakte hain.",
      },
    },
  ],
};
