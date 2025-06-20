// script.js
const SHEET_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vQ1zt6BrAmmN6xpqZrv7ZwUNNN7k5anZGt06gNenRxikznPdZFLp4fDK1RWMKzQag5DRSQCooaKkdMk/pub?output=csv";
const whatsappNumber = "917986297302";

fetch(SHEET_URL)
  .then(response => response.text())
  .then(text => {
    const data = Papa.parse(text, { header: true }).data;
    renderCatalogue(data);
  });

function renderCatalogue(data) {
  const grouped = {};
  data.forEach(row => {
    const key = row["Category"];
    if (!grouped[key]) grouped[key] = {};
    if (!grouped[key][row["Item Code"]]) {
      grouped[key][row["Item Code"]] = {
        itemName: row["Item Name"],
        specs: row["Specs"],
        variants: []
      };
    }
    grouped[key][row["Item Code"]].variants.push({
      variantCode: row["Variant Code"],
      description: row["Description"],
      price: row["Price/Unit"],
      unit: row["Unit"]
    });
  });

  const categorySelect = document.getElementById("categorySelect");
  const catalogue = document.getElementById("catalogue");

  const categories = Object.keys(grouped);
  categories.forEach(cat => {
    const opt = document.createElement("option");
    opt.value = cat;
    opt.textContent = cat;
    categorySelect.appendChild(opt);
  });

  categorySelect.addEventListener("change", () => {
    const selected = categorySelect.value;
    displayItems(grouped[selected]);
  });

  document.getElementById("searchInput").addEventListener("input", (e) => {
    const selected = categorySelect.value;
    const searchTerm = e.target.value.toLowerCase();
    const filtered = {};
    Object.entries(grouped[selected]).forEach(([code, item]) => {
      if (item.itemName.toLowerCase().includes(searchTerm)) {
        filtered[code] = item;
      }
    });
    displayItems(filtered);
  });

  if (categories.length) {
    categorySelect.value = categories[0];
    displayItems(grouped[categories[0]]);
  }

  function displayItems(items) {
    catalogue.innerHTML = "";
    Object.values(items).forEach(item => {
      const div = document.createElement("div");
      div.className = "item";
      div.innerHTML = `
        <h2>${item.itemName}</h2>
        <p>${item.specs}</p>
        <table>
          <thead><tr><th>Variant Code</th><th>Description</th><th>Price/Unit</th><th>Unit</th><th>Inquiry</th></tr></thead>
          <tbody>
            ${item.variants.map(v => `
              <tr>
                <td>${v.variantCode}</td>
                <td>${v.description}</td>
                <td>${v.price}</td>
                <td>${v.unit}</td>
                <td><a class="whatsapp-btn" target="_blank" href="https://wa.me/${whatsappNumber}?text=Hi, I’m interested in this tool: ${v.variantCode} - ${encodeURIComponent(v.description)}">WhatsApp</a></td>
              </tr>
            `).join("")}
          </tbody>
        </table>`;
      catalogue.appendChild(div);
    });
  }
}
