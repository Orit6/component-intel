// 🔹 Nexar API key שלך
const NEXAR_API_KEY = "2a892b0b-5292-44b0-bbcd-3f96d8427690";

// 🔹 פונקציה שמבצעת את החיפוש בפועל
async function fetchAndDisplayPart(pn) {
  const resultsDiv = document.getElementById("results");
  resultsDiv.innerHTML = "🔎 מחפש נתונים...";

  const query = `
    query {
      supSearch(q: "${pn}", limit: 1) {
        results {
          part {
            mpn
            manufacturer { name }
            description
            lifecycle
            bestImage { url }
            octopartUrl
          }
        }
      }
    }
  `;

  try {
    const response = await fetch("https://api.nexar.com/graphql", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": \`Bearer \${NEXAR_API_KEY}\`
      },
      body: JSON.stringify({ query })
    });

    const data = await response.json();
    const items = data?.data?.supSearch?.results || [];

    if (!items.length) {
      resultsDiv.innerHTML = "❌ לא נמצאו תוצאות למק״ט זה.";
      return;
    }

    const part = items[0].part;

    resultsDiv.innerHTML = `
      <div class="card">
        <h3>${part.mpn}</h3>
        <p><b>יצרן:</b> ${part.manufacturer?.name ?? "-"}</p>
        <p><b>תיאור:</b> ${part.description ?? "-"}</p>
        <p><b>סטטוס:</b> ${part.lifecycle ?? "-"}</p>
        ${part.bestImage?.url ? `<img src="${part.bestImage.url}" width="120">` : ""}
        ${part.octopartUrl ? `<p><a href="${part.octopartUrl}" target="_blank">פתח ב-Octopart 🔗</a></p>` : ""}
      </div>
    `;
  } catch (err) {
    console.error(err);
    resultsDiv.innerHTML = "❌ שגיאה בעת שליפת הנתונים מה-API.";
  }
}

// 🔹 חיבור כפתור “חיפוש” לאירוע הלחיצה
document.addEventListener("DOMContentLoaded", () => {
  const btn = document.getElementById("searchBtn");
  const input = document.getElementById("pnInput");
  const resultsDiv = document.getElementById("results");

  btn.addEventListener("click", async () => {
    const pn = input.value.trim();
    if (!pn) {
      resultsDiv.innerHTML = "⚠️ אנא הקלידי מק״ט לחיפוש.";
      return;
    }

    await fetchAndDisplayPart(pn);
  });
});
