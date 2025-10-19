const response = await fetch("https://api.nexar.com/graphql", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${NEXAR_API_KEY}`
  },
  body: JSON.stringify({ query })
});


async function searchPart() {
  const query = document.querySelector("input").value.trim();
  const resultsDiv = document.querySelector(".results") || createResultsDiv();
  resultsDiv.innerHTML = "🔎 מחפש נתונים ב-Octopart...";

  try {
    const response = await fetch("https://api.nexar.com/graphql", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Client-Id": CLIENT_ID,
      },
      body: JSON.stringify({
        query: `
        {
          supSearch(q: "${query}", limit: 1) {
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
        }`,
      }),
    });

    const data = await response.json();

    if (!data.data || data.data.supSearch.results.length === 0) {
      resultsDiv.innerHTML = "⚠️ לא נמצאו נתונים לרכיב זה.";
      return;
    }

    const part = data.data.supSearch.results[0].part;
    resultsDiv.innerHTML = `
      <div style="border:1px solid #ccc; border-radius:10px; padding:15px; max-width:400px; background:#fafafa;">
        <h3>${part.mpn}</h3>
        <p><b>יצרן:</b> ${part.manufacturer.name}</p>
        <p><b>תיאור:</b> ${part.description}</p>
        <p><b>סטטוס:</b> ${part.lifecycle}</p>
        ${part.bestImage?.url ? `<img src="${part.bestImage.url}" width="120" style="margin-top:10px;">` : ""}
        <p><a href="${part.octopartUrl}" target="_blank">פתח ב-Octopart 🔗</a></p>
      </div>
    `;
  } catch (err) {
    console.error(err);
    resultsDiv.innerHTML = "❌ שגיאה בעת הבאת הנתונים מהשרת.";
  }
}

function createResultsDiv() {
  const div = document.createElement("div");
  div.className = "results";
  document.body.appendChild(div);
  return div;
}
async function searchPart(partNumber) {
  const query = `
    query {
      supSearch(q: "${partNumber}", limit: 5) {
        results {
          part {
            mpn
            manufacturer {
              name
            }
            specs {
              attribute { name }
              displayValue
            }
          }
        }
      }
    }
  `;

  const response = await fetch("https://api.nexar.com/graphql", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "token": NEXAR_API_KEY
    },
    body: JSON.stringify({ query })
  });

  const data = await response.json();
  console.log("תוצאה מה־API:", data);
  return data;
}
// --- חיבור כפתור החיפוש לאירוע לחיצה ---
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

    resultsDiv.innerHTML = "🔎 מחפש רכיב...";

    try {
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
    } catch (error) {
      console.error(error);
      resultsDiv.innerHTML = "❌ שגיאה בעת החיפוש.";
    }
  });
});
