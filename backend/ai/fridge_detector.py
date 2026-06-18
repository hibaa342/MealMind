from dotenv import load_dotenv
load_dotenv()

import os
import uuid
import json
import base64
import io
import urllib.request
import PIL.Image
from flask import Flask, request, jsonify
from ultralytics import YOLO

app = Flask(__name__)

UPLOAD_FOLDER = "temp_uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

print("🚀 Loading best_fridge.pt...")
model = YOLO("best_fridge.pt")
print(f"   Model classes: {len(model.names)}")
print("✅ Model loaded — starting server on port 5001")

GROQ_API_KEY = os.environ.get("GROQ_API_KEY", "")


def run_your_model(filepath):
    results = model(filepath, conf=0.10, iou=0.4)  # ← plus sensible
    detected = {}
    for r in results:
        for box in r.boxes:
            class_id   = int(box.cls[0])
            confidence = round(float(box.conf[0]) * 100, 1)
            name       = model.names[class_id]
            if name not in detected or confidence > detected[name]["confidence"]:
                detected[name] = {"name": name, "confidence": confidence, "source": "custom_model"}
    return list(detected.values())


def run_groq(filepath):
    if not GROQ_API_KEY:
        print("   ⚠️  GROQ_API_KEY missing")
        return []
    try:
        with open(filepath, "rb") as f:
            image_data = base64.b64encode(f.read()).decode("utf-8")

        payload = json.dumps({
            "model": "llama-3.2-11b-vision-preview",
            "messages": [{
                "role": "user",
                "content": [
                    {
                        "type": "image_url",
                        "image_url": {"url": f"data:image/jpeg;base64,{image_data}"}
                    },
                    {
                        "type": "text",
                        "text": (
                            "Look at this fridge or pantry photo carefully. "
                            "List EVERY food ingredient you can see, even partially. "
                            "Return ONLY a valid JSON array, no markdown, no explanation: "
                            "[{\"name\": \"apple\", \"confidence\": 95}, {\"name\": \"milk\", \"confidence\": 88}]"
                        )
                    }
                ]
            }],
            "max_tokens": 500
        }).encode("utf-8")

        req = urllib.request.Request(
            "https://api.groq.com/openai/v1/chat/completions",
            data=payload,
            headers={
                "Content-Type"  : "application/json",
                "Authorization" : f"Bearer {GROQ_API_KEY}"
            }
        )

        with urllib.request.urlopen(req) as response:
            result  = json.loads(response.read())
            content = result["choices"][0]["message"]["content"]
            raw     = content.strip()
            if "```" in raw:
                raw = raw.split("```")[1]
                if raw.startswith("json"):
                    raw = raw[4:]
            items = json.loads(raw.strip())
            return [
                {
                    "name"      : item["name"],
                    "confidence": item.get("confidence", 80),
                    "source"    : "groq"
                }
                for item in items
            ]

    except Exception as e:
        print(f"   Groq failed: {e}")
        return []


def merge_results(model_results, groq_results):
    final     = {item["name"].lower(): item for item in model_results}
    model_avg = (
        sum(i["confidence"] for i in model_results) / len(model_results)
        if model_results else 0
    )

    print(f"   Your model found : {len(model_results)} ingredients (avg confidence: {model_avg:.1f}%)")
    print(f"   Groq found       : {len(groq_results)} ingredients")

    for item in groq_results:
        name = item["name"].lower()
        if name not in final:
            final[name] = item
            print(f"   Groq added       : {item['name']}")

    return list(final.values())


@app.route("/detect", methods=["POST"])
def detect():
    if "image" not in request.files:
        return jsonify({"error": "No image provided"}), 400

    file     = request.files["image"]
    filename = f"{uuid.uuid4()}.jpg"
    filepath = os.path.join(UPLOAD_FOLDER, filename)
    file.save(filepath)

    try:
        print("\n🔍 Running YOUR model (best_fridge.pt)...")
        final = run_your_model(filepath)
        print(f"   Detected: {[i['name'] for i in final]}")
        print(f"✅ Final result: {len(final)} ingredients")

        return jsonify({
            "success"    : True,
            "ingredients": final,
            "stats"      : {"total": len(final)}
        })

    except Exception as e:
        print(f"❌ Error: {e}")
        return jsonify({"error": str(e)}), 500

    finally:
        if os.path.exists(filepath):
            os.remove(filepath)


@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "ok", "model": "best_fridge.pt + groq"})


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5001, debug=False)