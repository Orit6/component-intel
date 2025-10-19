const NEXAR_API_KEY = "2a892b0b-5292-44b0-bbcd-3f96d8427690";

document.getElementById("searchBtn").addEventListener("click", async () => {
  const partNumber = document.getElementById("pnInput").value.trim();
  const resultsDiv = document.getElementById("results");

  if (!partNumber) {
    resultsDiv.innerHTML = "❗ אנא הקלידי מק״ט לחיפוש.";
    return;
  }

  resultsDiv.innerHTML = "⏳ מחפש נתונים...";

  const query = {
    query: `
      query {
        supSearch(q: "${partNumber}", limit: 1) {
          results {
            part {
              mpn
              manufacturer { name }
              description
              octopartUrl
              bestImage { url }
              lifecycle
            }
          }
        }
      }
    `,
  };

  try {
    const response = await fetch("https://api.nexar.com/graphql", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${NEXAR_API_KEY}`,
      },
      body: JSON.stringify(query),
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
        <p><b>מצב חיי מוצר:</b> ${part.lifecycle ?? "-"}</p>
        ${part.bestImage?.url ? `<img src="${part.bestImage.url}" width="120">` : ""}
        <p><a href="${part.octopartUrl}" target="_blank">🔗 פתיחת Octopart</a></p>
      </div>
    `;
  } catch (error) {
    console.error(error);
    resultsDiv.innerHTML = "⚠️ שגיאה בעת קבלת הנתונים מהשרת.";
  }
});
