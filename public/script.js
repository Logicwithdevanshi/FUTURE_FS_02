// =====================
// Dashboard Charts
// =====================
const ctx1 = document.getElementById('statusChart').getContext('2d');
new Chart(ctx1, {
  type: 'pie',
  data: {
    labels: ['New','In Progress','Closed'],
    datasets: [{
      data: [6,7,5], // 👉 later we can fetch live counts from backend
      backgroundColor: ['#f39c12','#3498db','#2ecc71']
    }]
  }
});

const ctx2 = document.getElementById('dealsChart').getContext('2d');
new Chart(ctx2, {
  type: 'line',
  data: {
    labels: ['May 1','May 8','May 15','May 22','May 29'],
    datasets: [{
      label: 'Deal Value',
      data: [0,10,20,35,50],
      borderColor: '#9b59b6',
      fill:false
    }]
  }
});

// =====================
// Load Entries from Backend
// =====================
async function loadEntries() {
  try {
    const response = await fetch("http://localhost:3000/api/entries");
    const entries = await response.json();

    const tableBody = document.querySelector("#leads table tbody");
    tableBody.innerHTML = ""; // clear old rows

    entries.forEach(entry => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${entry.name}</td>
        <td>${entry.phone}</td>
        <td>${entry.email}</td>
        <td>${entry.company}</td>
        <td>
          <select class="statusSelect" data-id="${entry.id}">
            <option value="New" ${entry.status === "New" ? "selected" : ""}>New</option>
            <option value="In Progress" ${entry.status === "In Progress" ? "selected" : ""}>In Progress</option>
            <option value="Closed" ${entry.status === "Closed" ? "selected" : ""}>Closed</option>
          </select>
        </td>
        <td>${entry.notes || ""}</td>
        <td>${entry.follow_up || ""}</td>
        <td><button class="deleteBtn" data-id="${entry.id}">Delete</button></td>
      `;
      tableBody.appendChild(row);

      // Status dropdown styling + backend update
      const select = row.querySelector(".statusSelect");
      select.addEventListener("change", function () {
        let statusClass = this.value === "New" ? "new" :
                          this.value === "Closed" ? "closed" : "progress";
        this.className = "statusSelect " + statusClass;

        // ✅ Update backend when status changes
        fetch(`http://localhost:3000/api/entries/${entry.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: this.value, notes: entry.notes, followUp: entry.follow_up })
        });
      });
      select.dispatchEvent(new Event("change"));
    });
  } catch (err) {
    console.error("Error loading entries:", err);
  }
}

// ✅ Call on page load
document.addEventListener("DOMContentLoaded", loadEntries);

// =====================
// Add Lead Form → Backend
// =====================
document.getElementById("leadForm").addEventListener("submit", async function (e) {
  e.preventDefault();

  const newEntry = {
    name: document.getElementById("name").value,
    email: document.getElementById("email").value,
    phone: document.getElementById("phone").value,
    company: document.getElementById("company").value,
    status: document.getElementById("status").value,
    notes: document.getElementById("notes").value,
    followUp: document.getElementById("followUp").value
  };

  await fetch("http://localhost:3000/api/entries", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(newEntry)
  });

  alert("Lead added successfully!");
  loadEntries(); // refresh table
  document.getElementById("leadForm").reset();

  // ✅ Scroll to Leads table after saving
  document.getElementById("leads").scrollIntoView({ behavior: "smooth" });
});

// =====================
// Delete Lead → Backend
// =====================
document.querySelector("#leads table tbody").addEventListener("click", async function (e) {
  if (e.target.classList.contains("deleteBtn")) {
    const id = e.target.dataset.id;
    await fetch(`http://localhost:3000/api/entries/${id}`, { method: "DELETE" });
    loadEntries(); // refresh table
  }
});
