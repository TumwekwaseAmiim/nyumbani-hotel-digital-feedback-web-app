
function renderResetStats(){
  const items = getFeedback();
  document.getElementById("resetFeedbackCount").textContent = items.length;
  document.getElementById("resetComplaintCount").textContent = items.filter(i => Number(i.average_rating) <= 2).length;
  document.getElementById("resetResidentCount").textContent = items.filter(i => i.guest_type === "Resident").length;
  document.getElementById("resetNonResidentCount").textContent = items.filter(i => i.guest_type === "Non-Resident").length;
}

function renderArchives(){
  const target = document.getElementById("archiveList");
  const archives = getMonthlyArchives();

  if (!archives.length){
    target.innerHTML = "<p>No monthly summaries archived yet.</p>";
    return;
  }

  target.innerHTML = archives.map(a => `
    <article class="archive-item">
      <div>
        <h3>${a.month}</h3>
        <p>Archived: ${new Date(a.archived_at).toLocaleString()}</p>
      </div>
      <div class="archive-metrics">
        <span><strong>${a.total_feedback}</strong> Feedback</span>
        <span><strong>${a.residents}</strong> Residents</span>
        <span><strong>${a.non_residents}</strong> Non-Residents</span>
        <span><strong>${a.complaints}</strong> Complaints</span>
        <span><strong>${a.resolved_complaints}</strong> Resolved</span>
      </div>
    </article>
  `).join("");
}

document.addEventListener("DOMContentLoaded", () => {
  const role = sessionStorage.getItem("nyumbani_role");
  if (role !== "System Admin") {
    location.href = "dashboard.html";
    return;
  }

  renderResetStats();
  renderArchives();

  document.getElementById("monthlyResetBtn").addEventListener("click", () => {
    const check = document.getElementById("reportSavedCheck").checked;
    const confirmText = document.getElementById("monthlyConfirm").value.trim();
    const msg = document.getElementById("monthlyResetMessage");

    if (!check) {
      msg.textContent = "Please confirm that the monthly report has been printed or saved.";
      msg.className = "form-message error";
      return;
    }

    if (confirmText !== "RESET MONTH") {
      msg.textContent = 'Type "RESET MONTH" exactly to continue.';
      msg.className = "form-message error";
      return;
    }

    const count = getFeedback().length;
    if (count > 0) archiveCurrentMonthSummary();
    clearMonthlyGuestData();

    msg.textContent = "Monthly guest data has been reset. Aggregate summary was archived.";
    msg.className = "form-message success";
    document.getElementById("monthlyConfirm").value = "";
    document.getElementById("reportSavedCheck").checked = false;
    renderResetStats();
    renderArchives();
  });

  document.getElementById("keepAdminResetStaffBtn").addEventListener("click", () => {
    clearStaffDataExceptSystemAdmin();
    const msg = document.getElementById("staffResetMessage");
    msg.textContent = "Manager and Receptionist demo staff records removed. System Admin records kept.";
    msg.className = "form-message success";
  });

  document.getElementById("allStaffResetBtn").addEventListener("click", () => {
    if (!confirm("Remove all locally stored staff accounts?")) return;
    clearAllStaffData();
    const msg = document.getElementById("staffResetMessage");
    msg.textContent = "All locally stored staff accounts were removed.";
    msg.className = "form-message success";
  });

  document.getElementById("factoryResetBtn").addEventListener("click", () => {
    const confirmText = document.getElementById("factoryConfirm").value.trim();
    const msg = document.getElementById("factoryResetMessage");

    if (confirmText !== "FACTORY RESET") {
      msg.textContent = 'Type "FACTORY RESET" exactly to continue.';
      msg.className = "form-message error";
      return;
    }

    if (!confirm("This will erase all local demo data and archives. Continue?")) return;

    factoryResetDemoApp();
    alert("Factory reset completed.");
    location.href = "../index.html";
  });
});
