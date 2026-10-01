
from __future__ import annotations
import re
from pathlib import Path
from typing import Dict, Any

NEGATIVE = {
    "bad","poor","dirty","slow","terrible","awful","noisy","rude","late","cold",
    "hot","broken","failed","problem","issue","complaint","worst","disappointed",
    "disconnecting","disconnect","smell","smelly","delay","delayed","uncomfortable",
    "no water","no hot water","not working","weak"
}
POSITIVE = {
    "good","great","excellent","clean","friendly","nice","amazing","comfortable",
    "helpful","delicious","perfect","wonderful","fast","beautiful","professional",
    "lovely","satisfied","enjoyed","best"
}

DEPARTMENT_RULES = {
    "IT": ["wifi","wi-fi","internet","network","tv","television","decoder","computer"],
    "Housekeeping": ["clean","dirty","room","bed","towel","linen","bathroom","toilet","smell"],
    "Restaurant": ["food","meal","breakfast","lunch","dinner","restaurant","taste","menu"],
    "Bar": ["bar","drink","cocktail","beer","wine"],
    "Maintenance": ["water","hot water","air conditioner","ac","light","socket","broken","leak"],
    "Reception": ["reception","check-in","check in","checkout","check-out","front desk","booking"],
    "Events": ["conference","meeting","party","wedding","function","venue","garden","setup"],
    "Security": ["security","guard","parking","unsafe","safety"]
}

ISSUE_RULES = {
    "Wi-Fi / Internet": ["wifi","wi-fi","internet","network"],
    "Room Cleanliness": ["dirty","unclean","cleanliness","smell","linen","towel"],
    "Hot Water": ["hot water","no water","water"],
    "Food Quality": ["food","taste","meal","breakfast","lunch","dinner"],
    "Service Delay": ["late","delay","delayed","slow service","waited"],
    "Staff Conduct": ["rude","staff","receptionist","waiter","waitress"],
    "Room Comfort": ["bed","noise","noisy","comfort","uncomfortable","air conditioner","ac"],
    "Event / Venue": ["conference","meeting","party","wedding","function","venue","setup"]
}

URGENT_TERMS = [
    "fire","smoke","electric shock","injury","bleeding","unsafe","security",
    "no water","flood","leak","locked out","emergency"
]

def _norm(text: str) -> str:
    return re.sub(r"\s+", " ", (text or "").strip().lower())

def rule_based_analysis(text: str) -> Dict[str, Any]:
    t = _norm(text)
    pos = sum(1 for w in POSITIVE if w in t)
    neg = sum(1 for w in NEGATIVE if w in t)

    if pos > neg:
        sentiment = "Positive"
    elif neg > pos:
        sentiment = "Negative"
    else:
        sentiment = "Neutral"

    department = "General"
    dept_score = 0
    for dept, terms in DEPARTMENT_RULES.items():
        score = sum(1 for x in terms if x in t)
        if score > dept_score:
            department, dept_score = dept, score

    issue = "General Feedback"
    issue_score = 0
    for name, terms in ISSUE_RULES.items():
        score = sum(1 for x in terms if x in t)
        if score > issue_score:
            issue, issue_score = name, score

    if any(term in t for term in URGENT_TERMS):
        urgency = "High"
    elif sentiment == "Negative":
        urgency = "Medium"
    else:
        urgency = "Low"

    return {
        "sentiment": sentiment,
        "department": department,
        "issue_type": issue,
        "urgency": urgency,
        "engine": "rule-based fallback"
    }

def analyze_text(text: str) -> Dict[str, Any]:
    # Future priority:
    # 1. Load trained PyTorch/TensorFlow model if available.
    # 2. Otherwise use the safe rule-based fallback below.
    return rule_based_analysis(text)

if __name__ == "__main__":
    import sys, json
    sample = " ".join(sys.argv[1:]) or "The room was clean but the wifi was terrible."
    print(json.dumps(analyze_text(sample), indent=2))
