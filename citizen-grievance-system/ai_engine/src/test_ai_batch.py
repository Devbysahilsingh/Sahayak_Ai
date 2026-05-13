import json
import sys
import urllib.request


API_URL = "http://127.0.0.1:8001/predict-batch"

TEST_COMPLAINTS = [
    "Streetlight near the girls hostel has not worked for three nights and the area feels unsafe.",
    "The public drain is blocked and sewage water is entering nearby houses.",
    "A transformer near the market is making sparks after rain.",
    "Garbage has not been collected from the school gate for a week.",
    "My washing machine is leaking water, please send a government plumber.",
    "सड़क पर बड़ा गड्ढा है और बारिश में बाइक सवार गिर रहे हैं।",
    "नल से बदबूदार पानी आ रहा है और बच्चों को पेट दर्द हो रहा है।",
    "बाजार में कुछ संदिग्ध लोग महिलाओं का पीछा कर रहे हैं।",
    "मेरे घर का इन्वर्टर चार्ज नहीं हो रहा, बिजली विभाग को भेजो।",
    "गलियों में कचरा फैला है और मच्छर बहुत बढ़ गए हैं।",
    "ਪਾਣੀ ਦੀ ਪਾਈਪ ਟੁੱਟ ਗਈ ਹੈ ਅਤੇ ਗੰਦਾ ਪਾਣੀ ਘਰਾਂ ਵਿੱਚ ਆ ਰਿਹਾ ਹੈ।",
    "ਗਲੀ ਦੀ ਸਟ੍ਰੀਟ ਲਾਈਟ ਕਈ ਦਿਨਾਂ ਤੋਂ ਬੰਦ ਹੈ ਅਤੇ ਰਾਤ ਨੂੰ ਔਰਤਾਂ ਨੂੰ ਡਰ ਲੱਗਦਾ ਹੈ।",
    "ਮੇਰੇ ਘਰ ਦਾ ਪੱਖਾ ਨਹੀਂ ਚੱਲ ਰਿਹਾ, ਸਰਕਾਰੀ ਇਲੈਕਟ੍ਰੀਸ਼ਨ ਭੇਜੋ।",
    "ਸੜਕ ਉੱਤੇ ਵੱਡਾ ਖੱਡਾ ਹੈ ਅਤੇ ਟ੍ਰੈਫਿਕ ਜਾਮ ਹੋ ਰਿਹਾ ਹੈ।",
    "ਕੂੜਾ ਸਕੂਲ ਦੇ ਬਾਹਰ ਪਿਆ ਹੈ ਅਤੇ ਬੱਚੇ ਬੀਮਾਰ ਹੋ ਰਹੇ ਹਨ।",
    "રસ્તા પર મોટો ખાડો છે અને અકસ્માતનો ખતરો છે.",
    "નળમાં ગંદુ પાણી આવી રહ્યું છે અને દુર્ગંધ આવે છે.",
    "મારા ઘરની એસી ઠંડી નથી કરતી, સરકારી ફરિયાદમાં નાખો.",
    "કચરો ઘણા દિવસથી ઉઠાવ્યો નથી અને મચ્છર વધી ગયા છે.",
    "વીજળીનો થાંભલો વરસાદ પછી જોખમી રીતે વળી ગયો છે.",
    "రోడ్డు మీద పెద్ద గుంత ఉంది మరియు వాహనాలు ఇరుక్కుపోతున్నాయి.",
    "కాలువ మూసుకుపోయి మురుగు నీరు వీధిలోకి వస్తోంది.",
    "నా ఇంటి ఫ్రిజ్ పనిచేయడం లేదు, ప్రభుత్వ సిబ్బందిని పంపండి.",
    "వీధి దీపం పని చేయడం లేదు, రాత్రి మహిళలకు భద్రత లేదు.",
    "చెత్తను పాఠశాల దగ్గర చాలా రోజులుగా తీసుకెళ్లలేదు.",
    "ರಸ್ತೆಯಲ್ಲಿ ದೊಡ್ಡ ಗುಂಡಿ ಇದೆ ಮತ್ತು ಅಪಘಾತಗಳು ಆಗುತ್ತಿವೆ.",
    "ಕುಡಿಯುವ ನೀರಿನಲ್ಲಿ ಒಳಚರಂಡಿ ವಾಸನೆ ಬರುತ್ತಿದೆ.",
    "ನನ್ನ ಮನೆಯ ಫ್ಯಾನ್ ಕೆಲಸ ಮಾಡುತ್ತಿಲ್ಲ, ಸರ್ಕಾರಿ ದೂರು ಮಾಡಿ.",
    "ಕಸದ ವಾಹನ ಹಲವು ದಿನಗಳಿಂದ ಬಂದಿಲ್ಲ.",
    "ಮಳೆ ನಂತರ ವಿದ್ಯುತ್ ಕಂಬದಿಂದ ಕಿಡಿಗಳು ಬರುತ್ತಿವೆ.",
    "റോഡിൽ വലിയ കുഴിയുണ്ട്, ബൈക്ക് യാത്രക്കാർ വീഴുന്നു.",
    "കുടിവെള്ളത്തിൽ മലിനജലത്തിന്റെ ദുർഗന്ധം വരുന്നു.",
    "എന്റെ വീട്ടിലെ ഫ്രിഡ്ജ് തണുപ്പിക്കുന്നില്ല, സർക്കാർ പരാതി നൽകണം.",
    "തെരുവ് ലൈറ്റ് പ്രവർത്തിക്കുന്നില്ല, രാത്രിയിൽ സ്ത്രീകൾക്ക് സുരക്ഷയില്ല.",
    "സ്കൂളിന് സമീപം മാലിന്യം കെട്ടിക്കിടക്കുന്നു.",
    "রাস্তার পাশে ড্রেন বন্ধ হয়ে গেছে এবং নোংরা জল ঘরে ঢুকছে।",
    "বাজারে কিছু সন্দেহজনক লোক মহিলাদের অনুসরণ করছে।",
    "আমার বাড়ির এসি কাজ করছে না, সরকারি লোক পাঠান।",
    "পাবলিক পার্কে মৃত পশু পড়ে আছে এবং দুর্গন্ধ ছড়াচ্ছে।",
    "ট্রাফিক সিগন্যাল বন্ধ থাকায় দীর্ঘ যানজট হচ্ছে।",
    "தெரு விளக்கு வேலை செய்யவில்லை, இரவில் பெண்களுக்கு பாதுகாப்பில்லை.",
    "குடிநீரில் கழிவுநீர் வாசனை வருகிறது.",
    "என் வீட்டின் விசிறி வேலை செய்யவில்லை, அரசு ஊழியரை அனுப்புங்கள்.",
    "சாலையில் பெரிய குழி உள்ளது, விபத்து ஏற்படும் அபாயம் உள்ளது.",
    "பள்ளி அருகே குப்பை குவிந்து துர்நாற்றம் வருகிறது.",
]




def post_json(url, payload):
    request = urllib.request.Request(
        url,
        data=json.dumps(payload).encode("utf-8"),
        headers={"Content-Type": "application/json"},
        method="POST",
    )
    with urllib.request.urlopen(request, timeout=120) as response:
        return json.loads(response.read().decode("utf-8"))


def trim(value, size):
    text = str(value or "")
    return text if len(text) <= size else f"{text[: size - 3]}..."


def main():
    complaints = sys.argv[1:] or TEST_COMPLAINTS
    try:
        data = post_json(API_URL, {"texts": complaints})
    except Exception as exc:
        print("Could not reach AI engine.")
        print("Start it first:")
        print(r'  cd "E:\bgi hackathon\Sahayak_Ai\citizen-grievance-system\ai_engine"')
        print(r'  & "E:\bgi hackathon\venv_ai\Scripts\python.exe" -m uvicorn main:app --reload --port 8001')
        print(f"\nError: {exc}")
        raise SystemExit(1)

    header = f"{'#':<3} {'Complaint':<58} {'Valid':<7} {'Department(s)':<48} {'Priority':<9} {'Conf':<6}"
    print(header)
    print("-" * len(header))
    for index, item in enumerate(data["results"], start=1):
        prediction = item["prediction"]
        departments = " + ".join(prediction.get("departments") or [prediction.get("department", "-")])
        confidence = (
            prediction.get("validity_confidence", 0)
            if prediction.get("is_valid_grievance") is False
            else prediction.get("department_confidence", prediction.get("confidence", 0))
        )
        print(
            f"{index:<3} "
            f"{trim(item['complaint'], 58):<58} "
            f"{str(prediction.get('is_valid_grievance', True)):<7} "
            f"{trim(departments, 48):<48} "
            f"{prediction.get('priority', '-'):<9} "
            f"{confidence:<6}"
        )
        if prediction.get("message"):
            print(f"    reason: {prediction['message']}")
        if prediction.get("translation_source") and prediction.get("translation_source") != "original_or_multilingual_model":
            print(f"    language: {prediction.get('language')} | source: {prediction.get('translation_source')}")


if __name__ == "__main__":
    main()
