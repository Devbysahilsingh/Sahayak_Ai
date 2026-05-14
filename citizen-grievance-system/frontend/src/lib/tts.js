export const TTS_LANGUAGE_OPTIONS = [
  { label: "English", lang: "en-IN" },
  { label: "Hindi", lang: "hi-IN" },
  { label: "Bengali", lang: "bn-IN" },
  { label: "Tamil", lang: "ta-IN" },
  { label: "Telugu", lang: "te-IN" },
  { label: "Punjabi", lang: "pa-IN" },
  { label: "Gujarati", lang: "gu-IN" },
  { label: "Kannada", lang: "kn-IN" },
  { label: "Malayalam", lang: "ml-IN" },
  { label: "Marathi", lang: "mr-IN" },
  { label: "Urdu", lang: "ur-IN" },
];

const TTS_LANGUAGE_KEY = "sahayak_tts_language";
const DEFAULT_TTS_LANGUAGE = "en-IN";

const SPEECH_TEXT = {
  en: {
    rejected: (reason) => `Your complaint was rejected because ${reason || "it does not appear to be a valid government grievance"}.`,
    resolved: () => "Your complaint has been marked resolved. Please check the details and confirm if the issue is actually fixed.",
    escalated: () => "Your complaint has been escalated to a higher authority because it was not resolved within the expected time.",
    manual: (proofLine) => `Your complaint needs manual review. An officer will verify the correct department.${proofLine}`,
    submitted: (proofLine) => `Your complaint has been submitted successfully and is being analyzed by the system.${proofLine}`,
    generic: (status, department, eta) => `Your complaint is currently ${status || "being processed"}. Department is ${department || "not assigned yet"}. Estimated resolution is ${eta}.`,
    proof: (count) => ` You also uploaded ${count} proof file${count > 1 ? "s" : ""}.`,
    notification: (title, message) => `${title}. ${message}`,
  },
  hi: {
    rejected: (reason) => `आपकी शिकायत अस्वीकार कर दी गई है। कारण: ${reason || "यह सरकारी शिकायत नहीं लगती"}.`,
    resolved: () => "आपकी शिकायत को समाधान किया गया बताया गया है। कृपया विवरण देखें और पुष्टि करें कि समस्या सच में ठीक हुई है।",
    escalated: () => "आपकी शिकायत समय पर समाधान न होने के कारण उच्च अधिकारी को भेज दी गई है।",
    manual: (proofLine) => `आपकी शिकायत को मैनुअल समीक्षा की जरूरत है। अधिकारी सही विभाग की जांच करेगा।${proofLine}`,
    submitted: (proofLine) => `आपकी शिकायत सफलतापूर्वक दर्ज हो गई है और सिस्टम उसका विश्लेषण कर रहा है।${proofLine}`,
    generic: (status, department, eta) => `आपकी शिकायत अभी ${status || "प्रक्रिया में है"}। विभाग ${department || "अभी तय नहीं हुआ"}। अनुमानित समाधान समय ${eta} है।`,
    proof: (count) => ` आपने ${count} प्रमाण फाइल भी अपलोड की है।`,
    notification: (title, message) => `सूचना। ${title}. ${message}`,
  },
  bn: {
    rejected: (reason) => `আপনার অভিযোগ বাতিল করা হয়েছে। কারণ: ${reason || "এটি সরকারি অভিযোগ বলে মনে হচ্ছে না"}.`,
    resolved: () => "আপনার অভিযোগ সমাধান হয়েছে বলে চিহ্নিত করা হয়েছে। দয়া করে বিস্তারিত দেখে নিশ্চিত করুন সমস্যাটি সত্যিই ঠিক হয়েছে কি না।",
    escalated: () => "সময়ের মধ্যে সমাধান না হওয়ায় আপনার অভিযোগ উচ্চ কর্তৃপক্ষের কাছে পাঠানো হয়েছে।",
    manual: (proofLine) => `আপনার অভিযোগের ম্যানুয়াল রিভিউ দরকার। একজন কর্মকর্তা সঠিক বিভাগ যাচাই করবেন।${proofLine}`,
    submitted: (proofLine) => `আপনার অভিযোগ সফলভাবে জমা হয়েছে এবং সিস্টেম এটি বিশ্লেষণ করছে।${proofLine}`,
    generic: (status, department, eta) => `আপনার অভিযোগ বর্তমানে ${status || "প্রক্রিয়াধীন"}। বিভাগ ${department || "এখনও নির্ধারিত নয়"}। আনুমানিক সমাধান সময় ${eta}.`,
    proof: (count) => ` আপনি ${count}টি প্রমাণ ফাইলও আপলোড করেছেন।`,
    notification: (title, message) => `নোটিফিকেশন। ${title}. ${message}`,
  },
  ta: {
    rejected: (reason) => `உங்கள் புகார் நிராகரிக்கப்பட்டது. காரணம்: ${reason || "இது அரசு புகாராக தெரியவில்லை"}.`,
    resolved: () => "உங்கள் புகார் தீர்க்கப்பட்டது என குறிக்கப்பட்டுள்ளது. விவரங்களை பார்த்து பிரச்சனை உண்மையில் சரியானதா என்பதை உறுதிப்படுத்தவும்.",
    escalated: () => "காலக்கெடுவுக்குள் தீர்க்கப்படாததால் உங்கள் புகார் மேலதிக அதிகாரிக்கு அனுப்பப்பட்டுள்ளது.",
    manual: (proofLine) => `உங்கள் புகாருக்கு கைமுறை ஆய்வு தேவை. அதிகாரி சரியான துறையை சரிபார்ப்பார்.${proofLine}`,
    submitted: (proofLine) => `உங்கள் புகார் வெற்றிகரமாக பதிவு செய்யப்பட்டுள்ளது. அமைப்பு அதை ஆய்வு செய்கிறது.${proofLine}`,
    generic: (status, department, eta) => `உங்கள் புகார் தற்போது ${status || "செயல்பாட்டில் உள்ளது"}. துறை ${department || "இன்னும் ஒதுக்கப்படவில்லை"}. மதிப்பிடப்பட்ட தீர்வு நேரம் ${eta}.`,
    proof: (count) => ` நீங்கள் ${count} ஆதார கோப்பையும் பதிவேற்றியுள்ளீர்கள்.`,
    notification: (title, message) => `அறிவிப்பு. ${title}. ${message}`,
  },
  te: {
    rejected: (reason) => `మీ ఫిర్యాదు తిరస్కరించబడింది. కారణం: ${reason || "ఇది ప్రభుత్వ ఫిర్యాదుగా కనిపించడం లేదు"}.`,
    resolved: () => "మీ ఫిర్యాదు పరిష్కరించబడినట్లు గుర్తించబడింది. సమస్య నిజంగా పరిష్కారమైందో లేదో వివరాలు చూసి నిర్ధారించండి.",
    escalated: () => "గడువులోగా పరిష్కారం కాలేదని మీ ఫిర్యాదు ఉన్నత అధికారికి పంపబడింది.",
    manual: (proofLine) => `మీ ఫిర్యాదుకు మాన్యువల్ సమీక్ష అవసరం. అధికారి సరైన విభాగాన్ని తనిఖీ చేస్తారు.${proofLine}`,
    submitted: (proofLine) => `మీ ఫిర్యాదు విజయవంతంగా నమోదు అయింది. సిస్టమ్ దానిని విశ్లేషిస్తోంది.${proofLine}`,
    generic: (status, department, eta) => `మీ ఫిర్యాదు ప్రస్తుతం ${status || "ప్రాసెస్ అవుతోంది"}. విభాగం ${department || "ఇంకా కేటాయించలేదు"}. అంచనా పరిష్కార సమయం ${eta}.`,
    proof: (count) => ` మీరు ${count} ఆధార ఫైల్ కూడా అప్లోడ్ చేశారు.`,
    notification: (title, message) => `నోటిఫికేషన్. ${title}. ${message}`,
  },
  pa: {
    rejected: (reason) => `ਤੁਹਾਡੀ ਸ਼ਿਕਾਇਤ ਰੱਦ ਕੀਤੀ ਗਈ ਹੈ। ਕਾਰਨ: ${reason || "ਇਹ ਸਰਕਾਰੀ ਸ਼ਿਕਾਇਤ ਨਹੀਂ ਲੱਗਦੀ"}.`,
    resolved: () => "ਤੁਹਾਡੀ ਸ਼ਿਕਾਇਤ ਨੂੰ ਹੱਲ ਹੋਇਆ ਦਰਸਾਇਆ ਗਿਆ ਹੈ। ਕਿਰਪਾ ਕਰਕੇ ਵੇਰਵੇ ਵੇਖੋ ਅਤੇ ਪੁਸ਼ਟੀ ਕਰੋ ਕਿ ਸਮੱਸਿਆ ਸੱਚਮੁੱਚ ਠੀਕ ਹੋਈ ਹੈ।",
    escalated: () => "ਸਮੇਂ ਅੰਦਰ ਹੱਲ ਨਾ ਹੋਣ ਕਰਕੇ ਤੁਹਾਡੀ ਸ਼ਿਕਾਇਤ ਉੱਚ ਅਧਿਕਾਰੀ ਨੂੰ ਭੇਜੀ ਗਈ ਹੈ।",
    manual: (proofLine) => `ਤੁਹਾਡੀ ਸ਼ਿਕਾਇਤ ਲਈ ਮੈਨੁਅਲ ਸਮੀਖਿਆ ਦੀ ਲੋੜ ਹੈ। ਅਧਿਕਾਰੀ ਸਹੀ ਵਿਭਾਗ ਦੀ ਜਾਂਚ ਕਰੇਗਾ।${proofLine}`,
    submitted: (proofLine) => `ਤੁਹਾਡੀ ਸ਼ਿਕਾਇਤ ਸਫਲਤਾਪੂਰਵਕ ਦਰਜ ਹੋ ਗਈ ਹੈ ਅਤੇ ਸਿਸਟਮ ਇਸ ਦਾ ਵਿਸ਼ਲੇਸ਼ਣ ਕਰ ਰਿਹਾ ਹੈ।${proofLine}`,
    generic: (status, department, eta) => `ਤੁਹਾਡੀ ਸ਼ਿਕਾਇਤ ਇਸ ਵੇਲੇ ${status || "ਪ੍ਰਕਿਰਿਆ ਵਿੱਚ ਹੈ"}। ਵਿਭਾਗ ${department || "ਹਾਲੇ ਨਿਰਧਾਰਤ ਨਹੀਂ"}। ਅੰਦਾਜ਼ਨ ਹੱਲ ਸਮਾਂ ${eta}.`,
    proof: (count) => ` ਤੁਸੀਂ ${count} ਸਬੂਤ ਫਾਈਲ ਵੀ ਅਪਲੋਡ ਕੀਤੀ ਹੈ।`,
    notification: (title, message) => `ਸੂਚਨਾ। ${title}. ${message}`,
  },
  gu: {
    rejected: (reason) => `તમારી ફરિયાદ નકારી કાઢવામાં આવી છે. કારણ: ${reason || "આ સરકારી ફરિયાદ લાગતી નથી"}.`,
    resolved: () => "તમારી ફરિયાદનું નિરાકરણ થયું હોવાનું દર્શાવવામાં આવ્યું છે. કૃપા કરીને વિગતો તપાસો અને સમસ્યા ખરેખર ઠીક થઈ છે કે નહીં તેની પુષ્ટિ કરો.",
    escalated: () => "સમયસર નિરાકરણ ન થતા તમારી ફરિયાદ ઉચ્ચ અધિકારીને મોકલવામાં આવી છે.",
    manual: (proofLine) => `તમારી ફરિયાદને મેન્યુઅલ સમીક્ષા જરૂરી છે. અધિકારી યોગ્ય વિભાગ ચકાસશે.${proofLine}`,
    submitted: (proofLine) => `તમારી ફરિયાદ સફળતાપૂર્વક નોંધાઈ ગઈ છે અને સિસ્ટમ તેનું વિશ્લેષણ કરી રહી છે.${proofLine}`,
    generic: (status, department, eta) => `તમારી ફરિયાદ હાલમાં ${status || "પ્રક્રિયામાં છે"}. વિભાગ ${department || "હજુ સોંપાયો નથી"}. અંદાજિત નિરાકરણ સમય ${eta}.`,
    proof: (count) => ` તમે ${count} પુરાવા ફાઇલ પણ અપલોડ કરી છે.`,
    notification: (title, message) => `સૂચના. ${title}. ${message}`,
  },
  kn: {
    rejected: (reason) => `ನಿಮ್ಮ ದೂರು ತಿರಸ್ಕರಿಸಲಾಗಿದೆ. ಕಾರಣ: ${reason || "ಇದು ಸರ್ಕಾರಿ ದೂರು ಎಂದು ಕಾಣುವುದಿಲ್ಲ"}.`,
    resolved: () => "ನಿಮ್ಮ ದೂರು ಪರಿಹಾರವಾಗಿದೆ ಎಂದು ಗುರುತಿಸಲಾಗಿದೆ. ಸಮಸ್ಯೆ ನಿಜವಾಗಿಯೂ ಸರಿಯಾಗಿದೆ ಎಂದು ವಿವರಗಳನ್ನು ಪರಿಶೀಲಿಸಿ ದೃಢೀಕರಿಸಿ.",
    escalated: () => "ನಿಗದಿತ ಸಮಯದಲ್ಲಿ ಪರಿಹಾರವಾಗದ ಕಾರಣ ನಿಮ್ಮ ದೂರನ್ನು ಮೇಲಧಿಕಾರಿಗಳಿಗೆ ಕಳುಹಿಸಲಾಗಿದೆ.",
    manual: (proofLine) => `ನಿಮ್ಮ ದೂರಿಗೆ ಕೈಯಾರೆ ಪರಿಶೀಲನೆ ಅಗತ್ಯವಿದೆ. ಅಧಿಕಾರಿ ಸರಿಯಾದ ಇಲಾಖೆಯನ್ನು ಪರಿಶೀಲಿಸುತ್ತಾರೆ.${proofLine}`,
    submitted: (proofLine) => `ನಿಮ್ಮ ದೂರು ಯಶಸ್ವಿಯಾಗಿ ದಾಖಲಾಗಿದೆ ಮತ್ತು ವ್ಯವಸ್ಥೆ ಅದನ್ನು ವಿಶ್ಲೇಷಿಸುತ್ತಿದೆ.${proofLine}`,
    generic: (status, department, eta) => `ನಿಮ್ಮ ದೂರು ಈಗ ${status || "ಪ್ರಕ್ರಿಯೆಯಲ್ಲಿದೆ"}. ಇಲಾಖೆ ${department || "ಇನ್ನೂ ನಿಯೋಜಿಸಲಿಲ್ಲ"}. ಅಂದಾಜು ಪರಿಹಾರ ಸಮಯ ${eta}.`,
    proof: (count) => ` ನೀವು ${count} ಸಾಕ್ಷ್ಯ ಫೈಲ್ ಕೂಡ ಅಪ್ಲೋಡ್ ಮಾಡಿದ್ದೀರಿ.`,
    notification: (title, message) => `ಅಧಿಸೂಚನೆ. ${title}. ${message}`,
  },
  ml: {
    rejected: (reason) => `നിങ്ങളുടെ പരാതി നിരസിച്ചു. കാരണം: ${reason || "ഇത് സർക്കാർ പരാതിയായി തോന്നുന്നില്ല"}.`,
    resolved: () => "നിങ്ങളുടെ പരാതി പരിഹരിച്ചതായി രേഖപ്പെടുത്തിയിട്ടുണ്ട്. പ്രശ്നം യഥാർത്ഥത്തിൽ പരിഹരിച്ചോ എന്ന് വിശദാംശങ്ങൾ പരിശോധിച്ച് സ്ഥിരീകരിക്കുക.",
    escalated: () => "സമയത്തിനകം പരിഹരിക്കാത്തതിനാൽ നിങ്ങളുടെ പരാതി മേലധികാരിക്ക് കൈമാറി.",
    manual: (proofLine) => `നിങ്ങളുടെ പരാതിക്ക് മാനുവൽ റിവ്യൂ ആവശ്യമാണ്. ശരിയായ വകുപ്പ് ഉദ്യോഗസ്ഥൻ പരിശോധിക്കും.${proofLine}`,
    submitted: (proofLine) => `നിങ്ങളുടെ പരാതി വിജയകരമായി രജിസ്റ്റർ ചെയ്തു. സിസ്റ്റം അത് വിശകലനം ചെയ്യുന്നു.${proofLine}`,
    generic: (status, department, eta) => `നിങ്ങളുടെ പരാതി ഇപ്പോൾ ${status || "പ്രോസസ്സിലാണ്"}. വകുപ്പ് ${department || "ഇനിയും നിശ്ചയിച്ചിട്ടില്ല"}. പ്രതീക്ഷിക്കുന്ന പരിഹാര സമയം ${eta}.`,
    proof: (count) => ` നിങ്ങൾ ${count} തെളിവ് ഫയൽ അപ്ലോഡ് ചെയ്തിട്ടുണ്ട്.`,
    notification: (title, message) => `അറിയിപ്പ്. ${title}. ${message}`,
  },
  mr: {
    rejected: (reason) => `तुमची तक्रार नाकारली आहे. कारण: ${reason || "ही सरकारी तक्रार वाटत नाही"}.`,
    resolved: () => "तुमची तक्रार सोडवली गेली आहे असे चिन्हांकित केले आहे. कृपया तपशील पाहून समस्या खरोखर सुटली आहे का ते पुष्टी करा.",
    escalated: () => "वेळेत निराकरण न झाल्यामुळे तुमची तक्रार वरिष्ठ अधिकाऱ्याकडे पाठवली आहे.",
    manual: (proofLine) => `तुमच्या तक्रारीला मॅन्युअल रिव्ह्यूची गरज आहे. अधिकारी योग्य विभाग तपासेल.${proofLine}`,
    submitted: (proofLine) => `तुमची तक्रार यशस्वीपणे नोंदवली गेली आहे आणि सिस्टम तिचे विश्लेषण करत आहे.${proofLine}`,
    generic: (status, department, eta) => `तुमची तक्रार सध्या ${status || "प्रक्रियेत आहे"}. विभाग ${department || "अजून निश्चित नाही"}. अंदाजे निराकरण वेळ ${eta}.`,
    proof: (count) => ` तुम्ही ${count} पुरावा फाइल देखील अपलोड केली आहे.`,
    notification: (title, message) => `सूचना. ${title}. ${message}`,
  },
  ur: {
    rejected: (reason) => `آپ کی شکایت مسترد کر دی گئی ہے۔ وجہ: ${reason || "یہ سرکاری شکایت نہیں لگتی"}.`,
    resolved: () => "آپ کی شکایت کو حل شدہ نشان زد کیا گیا ہے۔ براہ کرم تفصیل دیکھ کر تصدیق کریں کہ مسئلہ واقعی حل ہوا ہے۔",
    escalated: () => "وقت پر حل نہ ہونے کی وجہ سے آپ کی شکایت اعلی افسر کو بھیج دی گئی ہے۔",
    manual: (proofLine) => `آپ کی شکایت کو دستی جائزے کی ضرورت ہے۔ افسر صحیح محکمہ کی تصدیق کرے گا۔${proofLine}`,
    submitted: (proofLine) => `آپ کی شکایت کامیابی سے درج ہو گئی ہے اور نظام اس کا تجزیہ کر رہا ہے۔${proofLine}`,
    generic: (status, department, eta) => `آپ کی شکایت اس وقت ${status || "زیر کارروائی ہے"}. محکمہ ${department || "ابھی مقرر نہیں"}. متوقع حل کا وقت ${eta}.`,
    proof: (count) => ` آپ نے ${count} ثبوت فائل بھی اپ لوڈ کی ہے۔`,
    notification: (title, message) => `اطلاع۔ ${title}. ${message}`,
  },
};

export function canSpeak() {
  return typeof window !== "undefined" && "speechSynthesis" in window && "SpeechSynthesisUtterance" in window;
}

export function getPreferredTtsLanguage() {
  if (typeof window === "undefined") return DEFAULT_TTS_LANGUAGE;
  return localStorage.getItem(TTS_LANGUAGE_KEY) || DEFAULT_TTS_LANGUAGE;
}

export function setPreferredTtsLanguage(lang) {
  if (typeof window === "undefined") return;
  localStorage.setItem(TTS_LANGUAGE_KEY, lang || DEFAULT_TTS_LANGUAGE);
}

export function getAvailableVoices() {
  if (!canSpeak()) return [];
  return window.speechSynthesis.getVoices() || [];
}

function languageKey(lang = getPreferredTtsLanguage()) {
  return String(lang || DEFAULT_TTS_LANGUAGE).split("-")[0].toLowerCase();
}

function getSpeechPack(lang = getPreferredTtsLanguage()) {
  return SPEECH_TEXT[languageKey(lang)] || SPEECH_TEXT.en;
}

function findVoice(lang) {
  const voices = getAvailableVoices();
  if (!voices.length) return null;
  const normalized = String(lang || DEFAULT_TTS_LANGUAGE).toLowerCase();
  const languageOnly = normalized.split("-")[0];
  const matched =
    voices.find((voice) => String(voice.lang).toLowerCase() === normalized) ||
    voices.find((voice) => String(voice.lang).toLowerCase().startsWith(`${languageOnly}-`));
  if (matched) return matched;
  if (languageOnly === "en") {
    return voices.find((voice) => String(voice.lang).toLowerCase().startsWith("en-")) || voices[0];
  }
  return null;
}

export function speakText(text, options = {}) {
  if (!canSpeak() || !text) {
    return false;
  }
  window.speechSynthesis.cancel();
  const lang = options.lang || getPreferredTtsLanguage();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = lang;
  utterance.rate = options.rate || 0.92;
  utterance.pitch = options.pitch || 1;
  const voice = findVoice(lang);
  if (voice) {
    utterance.voice = voice;
    utterance.lang = voice.lang || lang;
  }
  window.speechSynthesis.speak(utterance);
  return true;
}

export function stopSpeaking() {
  if (canSpeak()) {
    window.speechSynthesis.cancel();
  }
}

export function buildComplaintSpeech(complaint, lang = getPreferredTtsLanguage()) {
  if (!complaint) {
    return "";
  }
  const pack = getSpeechPack(lang);
  const status = String(complaint.status || complaint.rawStatus || "").toLowerCase();
  const reason = complaint.rejectionReason || complaint.ai_rejection_reason || "";
  const department = complaint.department || complaint.assigned_department?.name || "";
  const eta =
    complaint.eta ||
    (complaint.eta_approved && complaint.estimated_resolution_hours
      ? `${complaint.estimated_resolution_hours} hours`
      : "waiting for admin response");
  const proofCount = complaint.citizenProofCount || complaint.citizen_proof_count || 0;
  const proofLine = proofCount > 0 ? pack.proof(proofCount) : "";

  if (status.includes("reject")) return pack.rejected(reason);
  if (status.includes("resolved")) return pack.resolved();
  if (status.includes("escalated")) return pack.escalated();
  if (status.includes("manual")) return pack.manual(proofLine);
  if (status.includes("processing") || status.includes("submitted")) return pack.submitted(proofLine);
  return pack.generic(complaint.status || "being processed", department, eta);
}

export function buildNotificationSpeech(notification, lang = getPreferredTtsLanguage()) {
  if (!notification) {
    return "";
  }
  const pack = getSpeechPack(lang);
  const title = notification.title || "Notification";
  const message = notification.message || "";
  return pack.notification(title, message).replace(/\b[A-Z]{2,}-\d+\b/g, "").replace(/\s+/g, " ").trim();
}

export function speakComplaint(complaint, options = {}) {
  const lang = options.lang || getPreferredTtsLanguage();
  return speakText(buildComplaintSpeech(complaint, lang), { ...options, lang });
}

export function speakNotification(notification, options = {}) {
  const lang = options.lang || getPreferredTtsLanguage();
  return speakText(buildNotificationSpeech(notification, lang), { ...options, lang });
}
