const CLIENT_ID = "2a892b0b-5292-44b0-bbcd-3f96d8427690";
const CLIENT_SECRET = "uVMlNG4Lld9AiaPBe-ZVC7v59-HZ_UCuW1Ab";

async function getAccessToken() {
  const response = await fetch("https://identity.nexar.com/connect/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: `grant_type=client_credentials&client_id=${CLIENT_ID}&client_secret=${CLIENT_SECRET}&scope=supply.domain`,
  });

  const data = await response.json();
  return data.access_token;
}

document.getElementById("searchBtn").addEventListener("click", async () => {
  const partNumber = document.getElementById("pnInput").value.trim();
  const resultsDiv = document.getElementById("results");

  if (!partNumber) {
    resultsDiv.innerHTML = "❗ אנא הקלידי מק״ט לחיפוש.";
    return;
  }

  resultsDiv.innerHTML = "⏳ מתחבר ל-Nexar ומחפש נתונים...";

  try {
    const token = await getAccessToken();

    const query = {
      query: `
        query {
          supSearch(q: "${partNumber}", limit: 1) {
            results {
              part {
                mpn
                manufacturer { name }
                description
                lifecycle
                octopartUrl
                bestImage { url }
              }
            }
          }
        }
      `,
    };

    const response = await fetch("https://api.nexar.com/graphql", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
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
