
const AI_API_URL = "http://127.0.0.1:8000";

async function analyzeFeedbackText(text) {
  if (!text || !text.trim()) {
    return {
      sentiment: "Neutral",
      department: "General",
      issue_type: "General Feedback",
      urgency: "Low",
      engine: "empty text"
    };
  }

  try {
    const response = await fetch(`${AI_API_URL}/analyze`, {
      method: "POST",
      headers: {"Content-Type":"application/json"},
      body: JSON.stringify({text})
    });
    if (!response.ok) throw new Error("AI API unavailable");
    return await response.json();
  } catch (err) {
    // Browser-side fallback so the web app still works when Python is not running.
    const t = text.toLowerCase();
    const neg = ["bad","poor","dirty","slow","terrible","rude","late","broken","no hot water","not working"];
    const pos = ["good","great","excellent","clean","friendly","nice","amazing","comfortable","helpful","delicious"];
    const negCount = neg.filter(w => t.includes(w)).length;
    const posCount = pos.filter(w => t.includes(w)).length;
    let sentiment = posCount > negCount ? "Positive" : negCount > posCount ? "Negative" : "Neutral";

    let department = "General";
    if (/(wifi|wi-fi|internet|network|tv|decoder)/.test(t)) department = "IT";
    else if (/(dirty|clean|room|bed|towel|bathroom)/.test(t)) department = "Housekeeping";
    else if (/(food|meal|breakfast|restaurant|taste)/.test(t)) department = "Restaurant";
    else if (/(water|ac|air conditioner|light|socket|broken)/.test(t)) department = "Maintenance";
    else if (/(reception|check-in|check in|booking)/.test(t)) department = "Reception";
    else if (/(conference|meeting|party|wedding|venue|function)/.test(t)) department = "Events";

    let urgency = /(fire|smoke|injury|unsafe|security|no water|flood|electric shock)/.test(t)
      ? "High"
      : sentiment === "Negative" ? "Medium" : "Low";

    return {
      sentiment,
      department,
      issue_type: "General Feedback",
      urgency,
      engine: "browser fallback"
    };
  }
}

window.analyzeFeedbackText = analyzeFeedbackText;
