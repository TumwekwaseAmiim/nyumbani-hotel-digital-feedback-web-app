
const STORAGE_KEYS={feedback:"nyumbani_feedback_v2",staff:"nyumbani_staff_v2"};
function getFeedback(){return JSON.parse(localStorage.getItem(STORAGE_KEYS.feedback)||"[]")}
function saveFeedback(items){localStorage.setItem(STORAGE_KEYS.feedback,JSON.stringify(items))}
function getStaff(){return JSON.parse(localStorage.getItem(STORAGE_KEYS.staff)||"[]")}
function saveStaff(items){localStorage.setItem(STORAGE_KEYS.staff,JSON.stringify(items))}
function idNow(){return (crypto.randomUUID?crypto.randomUUID():"FB-"+Date.now())}
const SCORE_TO_LABEL={5:"Very Good",4:"Good",3:"Average",2:"Poor",1:"Very Poor"};
function scoreLabel(score){return SCORE_TO_LABEL[Number(score)]||""}


const ARCHIVE_KEY = "nyumbani_monthly_archives_v1";

function getMonthlyArchives(){
  return JSON.parse(localStorage.getItem(ARCHIVE_KEY) || "[]");
}

function saveMonthlyArchives(items){
  localStorage.setItem(ARCHIVE_KEY, JSON.stringify(items));
}

function archiveCurrentMonthSummary(){
  const items = getFeedback();
  const now = new Date();
  const monthLabel = now.toLocaleString(undefined, {month:"long", year:"numeric"});

  const complaints = items.filter(i => Number(i.average_rating) <= 2);
  const resolved = complaints.filter(i => i.status === "Resolved");

  const categoryCounts = {};
  items.forEach(item => {
    (item.ratings || []).forEach(r => {
      const category = r.category;
      const answer = r.answer || scoreLabel(r.rating);
      if (!categoryCounts[category]) {
        categoryCounts[category] = {"Very Good":0,"Good":0,"Average":0,"Poor":0,"Very Poor":0};
      }
      if (categoryCounts[category][answer] !== undefined) {
        categoryCounts[category][answer] += 1;
      }
    });
  });

  const departmentCounts = {};
  items.forEach(item => {
    const d = item.ai_analysis?.department || "General";
    departmentCounts[d] = (departmentCounts[d] || 0) + 1;
  });

  const archive = {
    id: idNow(),
    month: monthLabel,
    archived_at: new Date().toISOString(),
    total_feedback: items.length,
    residents: items.filter(i => i.guest_type === "Resident").length,
    non_residents: items.filter(i => i.guest_type === "Non-Resident").length,
    complaints: complaints.length,
    resolved_complaints: resolved.length,
    category_counts: categoryCounts,
    department_counts: departmentCounts
  };

  const archives = getMonthlyArchives();
  archives.unshift(archive);
  saveMonthlyArchives(archives);
  return archive;
}

function clearMonthlyGuestData(){
  localStorage.removeItem(STORAGE_KEYS.feedback);
}

function clearStaffDataExceptSystemAdmin(){
  const staff = getStaff().filter(s => s.role === "System Admin");
  saveStaff(staff);
}

function clearAllStaffData(){
  localStorage.removeItem(STORAGE_KEYS.staff);
}

function factoryResetDemoApp(){
  localStorage.removeItem(STORAGE_KEYS.feedback);
  localStorage.removeItem(STORAGE_KEYS.staff);
  localStorage.removeItem(ARCHIVE_KEY);
  sessionStorage.clear();
}
