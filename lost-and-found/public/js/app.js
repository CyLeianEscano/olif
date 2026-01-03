const API_BASE = "";

function setActiveNav(linkId) {
  const links = document.querySelectorAll(".nav-link");
  links.forEach((link) => {
    if (link.dataset.linkId === linkId) {
      link.classList.add("active");
    } else {
      link.classList.remove("active");
    }
  });
}

function showToast(message, type = "success") {
  let toast = document.querySelector(".toast");
  if (!toast) {
    toast = document.createElement("div");
    toast.className = "toast";
    document.body.appendChild(toast);
  }
  toast.className = "toast " + type + " visible";
  toast.textContent = message;
  setTimeout(() => {
    toast.classList.remove("visible");
  }, 2600);
}

async function submitForm(endpoint, data) {
  try {
    const res = await fetch(API_BASE + endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(data)
    });
    const body = await res.json();
    if (!res.ok) {
      throw new Error(body.error || "Request failed");
    }
    showToast("Saved successfully.", "success");
    return body;
  } catch (err) {
    console.error(err);
    showToast(err.message || "Error occurred", "error");
    throw err;
  }
}

window.addEventListener("DOMContentLoaded", () => {
  const page = document.body.dataset.page;
  if (page) {
    setActiveNav(page);
  }

  const lostForm = document.getElementById("lost-form");
  if (lostForm) {
    lostForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const form = e.target;
      const data = {
        userId: Number(form.userId.value) || 1,
        dateReported: form.dateReported.value,
        itemType: form.itemType.value,
        itemColor: form.itemColor.value,
        locationLost: form.locationLost.value,
        approxLostAt: form.approxLostAt.value || null,
        additionalDescription: form.additionalDescription.value
      };
      await submitForm("/lost-items", data);
      form.reset();
    });
  }

  const foundForm = document.getElementById("found-form");
  if (foundForm) {
    foundForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const form = e.target;
      const data = {
        itemType: form.itemType.value,
        itemColor: form.itemColor.value,
        locationFound: form.locationFound.value,
        dateTurnedIn: form.dateTurnedIn.value,
        foundByName: form.foundByName.value,
        stationKept: form.stationKept.value,
        additionalNotes: form.additionalNotes.value,
        createdByAdminId: Number(form.adminId.value) || 1
      };
      await submitForm("/found-items", data);
      form.reset();
    });
  }

  const adminSummaryContainer = document.getElementById("admin-summary");
  if (adminSummaryContainer) {
    fetchDashboardSummary(adminSummaryContainer);
  }
});

async function fetchDashboardSummary(container) {
  try {
    const resFound = await fetch(API_BASE + "/found-items");
    const resLost = await fetch(API_BASE + "/lost-items");
    if (!resFound.ok || !resLost.ok) {
      throw new Error("Error loading data");
    }
    const foundItems = await resFound.json();
    const lostItems = await resLost.json();
    const totalFound = foundItems.length || 0;
    const totalLost = lostItems.length || 0;

    container.innerHTML = `
      <div class="summary-card">
        <div class="summary-title">Today overview</div>
        <div class="summary-stat-row">
          <div class="summary-stat-label">Found items</div>
          <div class="summary-stat-value">${totalFound}</div>
        </div>
        <div class="summary-stat-row">
          <div class="summary-stat-label">Lost reports</div>
          <div class="summary-stat-value">${totalLost}</div>
        </div>
        <div class="summary-item-list">
          <div class="summary-item">
            <span class="label">Latest found</span>
            <span class="value">${foundItems[0] ? foundItems[0].itemType : "None"}</span>
          </div>
          <div class="summary-item">
            <span class="label">Latest lost</span>
            <span class="value">${lostItems[0] ? lostItems[0].itemType : "None"}</span>
          </div>
        </div>
      </div>
    `;
  } catch (err) {
    console.error(err);
    container.innerHTML = `<div class="summary-card">Unable to load summary.</div>`;
  }
}
