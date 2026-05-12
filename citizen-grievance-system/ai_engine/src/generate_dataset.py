import pandas as pd
import random
import os
import string

DEPT_DISTRIBUTION = {
    "Electricity": 700,
    "Roads & Traffic": 600,
    "Water Supply": 450,
    "Sanitation & Waste": 400,
    "Public Parks & Infrastructure": 350
}

PRIORITIES = ["Low", "Medium", "High", "Critical"]
SENTIMENTS = ["Angry", "Panic", "Pleading", "Neutral", "Frustrated"]
LOCATIONS_LIST = [f"Ward_{str(i).zfill(2)}" for i in range(1, 30)]
LANGUAGES = ["English", "Hinglish", "Hindi", "Marathi", "Bengali", "Tamil"]
LANGUAGE_WEIGHTS = [0.35, 0.35, 0.15, 0.05, 0.05, 0.05]

PREFIXES = {
    "English": ["URGENT", "Sir pls help", "Kids are in danger", "Please check immediately", "Attention", "Terrible situation", "Why is nobody listening", "Emergency", "Look at this", "Completely unacceptable"],
    "Hinglish": ["Bhai", "Sir pls", "Koi sun lo", "Jaldi dekho", "Emergency hai", "Bachao", "Arre yaar", "Koi action kyu nahi le raha", "Pls help jaldi", "Danger hai bhai"],
    "Hindi": ["मदद करें", "तुरंत ध्यान दें", "आपातकाल", "कोई सुन क्यों नहीं रहा", "खतरा है", "कृपया जल्दी देखें", "सर मदद करें", "स्थिति बहुत खराब है"],
    "Marathi": ["मदत करा", "त्वरित लक्ष द्या", "धोका आहे", "कोणीही ऐकत नाही", "लवकर बघा", "साहेब लक्ष द्या"],
    "Bengali": ["দয়া করে সাহায্য করুন", "জরুরী", "বিপদ", "কেউ শুনছে না", "তাড়াতাড়ি আসুন", "স্যার একটু দেখুন"],
    "Tamil": ["உதவி", "அவசரம்", "ஆபத்து", "யாரும் கேட்கவில்லை", "சீக்கிரம் வாருங்கள்", "ஐயா தயவுசெய்து உதவுங்கள்"]
}

DYNAMIC_LOCATIONS = {
    "English": ["near govt school", "beside hospital", "near vegetable market", "outside temple", "near railway crossing", "near bus stand", "beside ATM", "near petrol pump", "outside coaching center", "beside apartment tower", "near dairy booth", "in slum area", "on market road", "at colony gate", "near metro station", "in public garden", "at traffic square"],
    "Hinglish": ["govt school ke pass", "hospital ke bagal me", "sabzi mandi ke paas", "mandir ke bahar", "railway crossing pe", "bus stand ke waha", "ATM ke saamne", "petrol pump ke pass", "coaching center ke bahar", "apartment ke bagal me", "dairy booth ke pass", "slum area me", "market road pe", "colony gate par", "metro station ke pass", "garden me", "traffic chauraha pe"],
    "Hindi": ["सरकारी स्कूल के पास", "अस्पताल के सामने", "सब्जी मंडी के पास", "मंदिर के बाहर", "रेलवे क्रॉसिंग के पास", "बस स्टैंड के पास", "एटीएम के सामने", "पेट्रोल पंप के पास", "कोचिंग सेंटर के बाहर", "अपार्टमेंट के पास", "डेयरी बूथ के पास", "बस्ती में", "बाजार की सड़क पर", "कॉलोनी गेट पर", "मेट्रो स्टेशन के पास", "पब्लिक गार्डन में", "ट्रैफिक चौराहे पर"],
    "Marathi": ["शाळेजवळ", "रुग्णालयासमोर", "मंडईजवळ", "मंदिराबाहेर", "रेल्वे क्रॉसिंगजवळ", "बस स्टँडजवळ", "ATM जवळ", "पेट्रोल पंपाजवळ", "मेट्रो स्टेशनजवळ", "मुख्य चौकात"],
    "Bengali": ["সরকারি স্কুলের কাছে", "হাসপাতালের সামনে", "সবজি বাজারের কাছে", "মন্দিরের বাইরে", "রেলওয়ে ক্রসিংয়ের কাছে", "বাস স্ট্যান্ডের কাছে", "এটিএম এর সামনে", "মেট্রো স্টেশনের কাছে"],
    "Tamil": ["அரசு பள்ளி அருகில்", "மருத்துவமனை முன்", "காய்கறி சந்தை அருகில்", "கோவில் வெளியே", "ரயில்வே கிராசிங் அருகில்", "பஸ் ஸ்டாண்ட் அருகில்", "ஏடிஎம் அருகில்", "மெட்ரோ நிலையம் அருகில்"]
}

DYNAMIC_CONTEXTS = {
    "English": ["after heavy rain", "during the storm", "after waterlogging", "during power cut", "after construction work", "during festival crowd", "at night time", "after pipeline digging", "suddenly today", "since yesterday evening"],
    "Hinglish": ["baarish ke baad", "toofan ke time", "waterlogging ke baad", "power cut ke time", "construction ke baad", "festival bheed me", "raat ke time", "pipeline khudai ke baad", "aaj achanak", "kal shaam se"],
    "Hindi": ["भारी बारिश के बाद", "तूफान के दौरान", "जलभराव के बाद", "बिजली कटौती के दौरान", "निर्माण कार्य के बाद", "त्योहार की भीड़ में", "रात के समय", "पाइपलाइन खुदाई के बाद", "आज अचानक", "कल शाम से"],
    "Marathi": ["मुसळधार पावसानंतर", "वादळादरम्यान", "पाणी साचल्यानंतर", "वीज कपातीदरम्यान", "बांधकामानंतर", "रात्रीच्या वेळी", "काल संध्याकाळपासून"],
    "Bengali": ["ভারী বৃষ্টির পর", "ঝড়ের সময়", "জল জমার পর", "বিদ্যুৎ বিভ্রাটের সময়", "নির্মাণ কাজের পর", "রাতের বেলায়", "গতকাল সন্ধ্যা থেকে"],
    "Tamil": ["கனமழைக்கு பின்", "புயலின் போது", "நீர் தேங்கிய பின்", "மின்வெட்டின் போது", "கட்டுமான பணிக்கு பின்", "இரவு நேரத்தில்", "நேற்று மாலை முதல்"]
}

CORES = {
    "Electricity": {
        "English": ["transformer blasted", "transformer exploded", "live wire hanging", "heavy spark from transformer", "meter box caught fire", "current spreading on road", "short circuit happened", "high tension line broke", "entire area is dark", "pole fell down"],
        "Hinglish": ["transformer blast ho gaya", "transformer udd gaya", "nangi taar latak rahi hai", "transformer se chingari aa rahi", "meter me aag lag gayi", "road pe current aa raha hai", "short circuit ho gaya", "taar toot ke gir gaya", "puri colony me andhera hai", "khamba gir gaya"],
        "Hindi": ["ट्रांसफार्मर फट गया", "ट्रांसफार्मर में आग लग गई", "जीवित तार लटक रहा है", "ट्रांसफार्मर से स्पार्किंग हो रही है", "मीटर बॉक्स जल गया", "सड़क पर करंट फैल रहा है", "शॉर्ट सर्किट हो गया", "हाई टेंशन तार टूट गया", "पूरे इलाके में अंधेरा है", "खंभा गिर गया"],
        "Marathi": ["ट्रान्सफॉर्मरचा स्फोट झाला", "तार तुटून पडली आहे", "मीटर बॉक्सला आग लागली", "रस्त्यावर करंट पसरत आहे", "शॉर्ट सर्किट झाले", "खांब पडला"],
        "Bengali": ["ট্রান্সফরমার বাস্ট করেছে", "তার ছিঁড়ে ঝুলছে", "মিটার বক্সে আগুন লেগেছে", "রাস্তায় কারেন্ট ছড়াচ্ছে", "শর্ট সার্কিট হয়েছে", "পোল পড়ে গেছে"],
        "Tamil": ["மின்மாற்றி வெடித்தது", "மின் கம்பி அறுந்து தொங்குகிறது", "மீட்டர் பெட்டியில் தீ", "சாலையில் மின்சாரம் பரவுகிறது", "ஷார்ட் சர்க்யூட்", "மின் கம்பம் சாய்ந்தது"]
    },
    "Roads & Traffic": {
        "English": ["main market road collapsed", "huge pothole caused accident", "traffic signal is dead", "divider completely broken", "open manhole", "road sinking", "slippery mud everywhere", "waterlogging on street", "digging left unfinished"],
        "Hinglish": ["road pura dhans gaya", "bohot bada gaddha ban gaya", "signal kharab pada hai", "divider toot gaya hai", "manhole khula hai", "road andar ja raha hai", "kichad hi kichad hai", "paani bhar gaya pura", "khod ke chhod diya"],
        "Hindi": ["सड़क पूरी तरह धंस गई है", "बहुत बड़ा गड्ढा हो गया है", "ट्रैफिक सिग्नल बंद है", "डिवाइडर टूट गया है", "मैनहोल खुला है", "सड़क नीचे जा रही है", "सड़क पर कीचड़ है", "सड़क पर पानी भरा है", "सड़क खोदकर छोड़ दी"],
        "Marathi": ["रस्ता पूर्णपणे खचला आहे", "मोठा खड्डा पडला आहे", "सिग्नल बंद आहे", "मॅनहोल उघडे आहे", "रस्त्यावर पाणी साचले आहे", "रस्त्याचे काम अपूर्ण आहे"],
        "Bengali": ["রাস্তা ধসে গেছে", "বিশাল গর্ত", "সিগন্যাল খারাপ", "ম্যানহোল খোলা", "রাস্তায় জল জমেছে", "রাস্তা খোঁড়াখুঁড়ি পড়ে আছে"],
        "Tamil": ["சாலை முற்றிலும் இடிந்தது", "பெரிய பள்ளம்", "சிக்னல் வேலை செய்யவில்லை", "மேன்ஹோல் திறந்துள்ளது", "சாலையில் நீர் தேங்கியுள்ளது", "பணிகள் முடிக்கப்படவில்லை"]
    },
    "Water Supply": {
        "English": ["pipeline burst suddenly", "getting muddy water", "no supply at all", "sewage mixed with drinking water", "extremely low pressure", "foul smelling water", "tanker did not come", "tap is dry"],
        "Hinglish": ["pipeline fatt gayi", "kichad wala paani aa raha", "paani aa hi nahi raha", "gutter ka paani mix ho gaya", "pressure bohot kam hai", "paani se badboo aa rahi", "tanker nahi aaya", "nal sookh gaye"],
        "Hindi": ["पाइपलाइन फट गई", "गंदा पानी आ रहा है", "पानी बिल्कुल नहीं आ रहा", "पीने के पानी में सीवर का पानी", "प्रेशर बहुत कम है", "पानी से बदबू आ रही है", "टैंकर नहीं आया", "नल सूखे हैं"],
        "Marathi": ["पाईपलाईन फुटली", "घाण पाणी येत आहे", "पाणी येत नाहीये", "गटाराचे पाणी मिसळले", "पाण्याचा दाब कमी आहे", "पाण्याला दुर्गंधी"],
        "Bengali": ["জলের পাইপ ফেটে গেছে", "ঘোলা জল আসছে", "জল একেবারেই আসছে না", "পানীয় জলে ড্রেনের জল", "জলের প্রেসার কম", "জলে দুর্গন্ধ"],
        "Tamil": ["குடிநீர் குழாய் உடைந்தது", "சேற்று நீர் வருகிறது", "தண்ணீர் வரவில்லை", "குடிநீரில் கழிவுநீர்", "குறைந்த அழுத்தம்", "தண்ணீரில் துர்நாற்றம்"]
    },
    "Sanitation & Waste": {
        "English": ["garbage overflowing on road", "dead animal smelling bad", "sewer line blocked", "gutter overflowing into houses", "toxic smoke from garbage", "mosquitoes breeding in stagnant water", "no sweeping done"],
        "Hinglish": ["kachra road par fail raha", "mara janwar pada hai", "sewer line block ho gayi", "gutter ka paani ghar me aa raha", "kachre se dhuaan aa raha", "macchar bohot ho gaye", "safai nahi hui"],
        "Hindi": ["कचरा सड़क पर फैल रहा है", "मरा हुआ जानवर पड़ा है", "सीवर लाइन जाम है", "गटर का पानी घर में आ रहा है", "कचरे से जहरीला धुआं", "मच्छर बहुत हो गए हैं", "सफाई नहीं हुई"],
        "Marathi": ["रस्त्यावर कचरा साचला आहे", "मेलेले जनावर पडले आहे", "गटार तुंबले आहे", "गटाराचे पाणी घरात", "कचरा जाळला", "मच्छर वाढले"],
        "Bengali": ["রাস্তায় আবর্জনা", "মৃত প্রাণী পড়ে আছে", "ড্রেন ব্লক", "নোংরা জল ঘরে ঢুকছে", "ময়লা পোড়ানো ধোঁয়া", "মশা বাড়ছে"],
        "Tamil": ["சாலையில் குப்பை", "இறந்த விலங்கு", "சாக்கடை அடைப்பு", "கழிவுநீர் வீட்டிற்குள்", "குப்பை எரியும் புகை", "கொசுக்கள் அதிகம்"]
    },
    "Public Parks & Infrastructure": {
        "English": ["park lights are completely broken", "stray dogs chasing kids", "swings are dangerously broken", "open gym equipment damaged", "public toilet has no water", "park has become a jungle", "missing tiles on pathway"],
        "Hinglish": ["park ki light kharab hai", "awariya kutte peeche pad rahe", "jhoole toot gaye hain", "gym ka saaman toot gaya", "public toilet me paani nahi", "park jangal ban gaya hai", "tiles gayab hain path se"],
        "Hindi": ["पार्क की लाइट खराब है", "आवारा कुत्ते बच्चों के पीछे भाग रहे हैं", "झूले टूट गए हैं", "जिम का सामान टूट गया है", "पब्लिक टॉयलेट में पानी नहीं है", "पार्क जंगल बन गया है", "रास्ते की टाइलें गायब हैं"],
        "Marathi": ["पार्कमधील लाईट बंद आहेत", "भटके कुत्रे", "खेळणी तुटलेली आहेत", "जिमचे साहित्य खराब", "टॉयलेटमध्ये पाणी नाही", "पार्कमध्ये गवत वाढले"],
        "Bengali": ["পার্কের আলো খারাপ", "রাস্তার কুকুর", "দোলনা ভাঙা", "জিমের জিনিস ভাঙা", "টয়লেটে জল নেই", "পার্ক জঙ্গল হয়ে গেছে"],
        "Tamil": ["பூங்கா விளக்குகள் எரியவில்லை", "தெரு நாய்கள்", "ஊஞ்சல்கள் உடைந்துள்ளன", "ஜிம் பொருட்கள் சேதம்", "கழிப்பறையில் தண்ணீர் இல்லை", "பூங்கா காடாக உள்ளது"]
    }
}

SHORT_FRAGMENTS = {
    "Electricity": ["Aag lag gyi", "Sparking!!", "Bijli gayi", "Current leak", "Taar gir gaya", "Blast hua", "Transformer dead"],
    "Roads & Traffic": ["Road toot gaya", "Gaddha", "Signal dead", "Manhole open", "Accident road", "Traffic jam", "Divider broken"],
    "Water Supply": ["Paani nahi aa raha", "Ganda paani", "Pipe leak", "Smelly water", "No pressure", "Tanker needed", "Dry taps"],
    "Sanitation & Waste": ["Kachra", "Smell", "Dead dog", "Naali block", "Gutter overflow", "Toxic smoke"],
    "Public Parks & Infrastructure": ["Park dark", "Dogs in park", "Jhoole broken", "Gym broken", "Toilet dirty"]
}

def get_list_item(lang, mapping_dict):
    lst = mapping_dict.get(lang, mapping_dict["English"])
    return random.choice(lst) if lst else ""

def simulate_typos(text):
    if len(text) < 5 or random.random() > 0.35:
        return text
    text_list = list(text)
    idx = random.randint(0, len(text_list) - 2)
    if text_list[idx] != ' ' and text_list[idx+1] != ' ':
        text_list[idx], text_list[idx+1] = text_list[idx+1], text_list[idx]
    return "".join(text_list)

def simulate_sms_language(text):
    if random.random() > 0.3:
        return text
    vowels = 'aeiouAEIOU'
    return "".join([c for c in text if c not in vowels or random.random() < 0.25])

def inject_noise(text, lang, sentiment, priority):
    if lang in ["English", "Hinglish"]:
        text = simulate_typos(text)
        text = simulate_sms_language(text)
        if random.random() < 0.3:
            text = text.translate(str.maketrans('', '', string.punctuation))
        if random.random() < 0.3:
            text = text.lower()
            
    if sentiment in ["Angry", "Panic"] and random.random() < 0.4:
        text = text.upper()
        
    if priority == "Critical" and random.random() < 0.5:
        text += random.choice(["!!!", "!!", " ????"])
        
    return text.strip()

def mutate_sentence(dept, lang):
    if random.random() < 0.1:
        return random.choice(SHORT_FRAGMENTS[dept])
        
    core = get_list_item(lang, CORES[dept])
    loc = get_list_item(lang, DYNAMIC_LOCATIONS) if random.random() < 0.8 else ""
    ctx = get_list_item(lang, DYNAMIC_CONTEXTS) if random.random() < 0.6 else ""
    prefix = get_list_item(lang, PREFIXES) if random.random() < 0.5 else ""

    parts = [p for p in [prefix, core, loc, ctx] if p]

    struct_choice = random.randint(1, 6)

    if struct_choice == 1 and prefix and loc:
        sentence = f"{prefix} {core} {loc} {ctx}"
    elif struct_choice == 2 and ctx and loc:
        sentence = f"{ctx} {core} {loc}"
    elif struct_choice == 3 and loc:
        sentence = f"{core} {loc}"
    elif struct_choice == 4 and prefix and ctx:
        sentence = f"{prefix} {ctx} {core} {loc}"
    elif struct_choice == 5:
        sentence = f"{core} {ctx} {loc}"
    else:
        random.shuffle(parts)
        sentence = " ".join(parts)
        
    sentence = " ".join(sentence.split())
    return sentence

def generate_dataset():
    dataset = []
    id_counter = 100000
    for dept, target_count in DEPT_DISTRIBUTION.items():
        for _ in range(target_count):
            lang = random.choices(LANGUAGES, weights=LANGUAGE_WEIGHTS, k=1)[0]
            
            pri = random.choice(PRIORITIES) if random.random() < 0.4 else random.choice(["High", "Critical"])
            sent = random.choice(SENTIMENTS) if random.random() < 0.4 else random.choice(["Angry", "Panic", "Frustrated"])
            
            raw_text = mutate_sentence(dept, lang)
            final_text = inject_noise(raw_text, lang, sent, pri)
            
            dataset.append({
                "complaint_id": f"GRV-2024-{id_counter}",
                "complaint_text": final_text,
                "language": lang,
                "department_label": dept,
                "priority_level": pri,
                "sentiment": sent,
                "ward_location": random.choice(LOCATIONS_LIST)
            })
            id_counter += 1
            
    return pd.DataFrame(dataset)

if __name__ == "__main__":
    os.makedirs("data/raw", exist_ok=True)
    df = generate_dataset()
    df = df.sample(frac=1, random_state=42).reset_index(drop=True)
    df.to_csv("data/raw/citizen_grievances_dataset.csv", index=False, encoding='utf-8')