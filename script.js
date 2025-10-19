const CLIENT_ID = "2a892b0b-5292-44b0-bbcd-3f96d8427690";
const CLIENT_SECRET = "eyJhbGciOiJSUzI1NiIsImtpZCI6IjA5NzI5QTkyRDU0RDlERjIyRDQzMENBMjNDNkI4QjJFIiwidHlwIjoiYXQrand0In0.eyJuYmYiOjE3NjA4NjQ1NTAsImV4cCI6MTc2MDk1MDk1MCwiaXNzIjoiaHR0cHM6Ly9pZGVudGl0eS5uZXhhci5jb20iLCJjbGllbnRfaWQiOiIyYTg5MmIwYi01MjkyLTQ0YjAtYmJjZC0zZjk2ZDg0Mjc2OTAiLCJjbGllbnRfYXBwbGljYXRpb25faWQiOiI2NDczOTFiOC04NjBhLTQ1OWMtYjQ0YS0yM2ViMDE0YzcyNmEiLCJjbGllbnRfb3JnYW5pemF0aW9uX2lkIjoiMWY2OWUzNGMtN2ZjNS00OGQwLWI2NjctMmM4MjBjZjMwNTY1IiwianRpIjoiREQ0QkQ5QUEzNkVEQUIxMkEwMzk0NUMwMTVDNzk3ODMiLCJpYXQiOjE3NjA4NjQ1NTAsInNjb3BlIjpbInN1cHBseS5kb21haW4iXX0.X8cLoDD0q_c9TylqTlvYDJBHZYXUuux4M9JOHMFl3n0fjTcIx9PREXKI8FBJj0nbz70_v__7BJzlocni_wA4Eiv21xzvZ3sxaOeYNDP0KwykCsGs-IB1Gb4k-5ukbgfailr4LDBCCgEGqxS3VfTZ8taqdVKTDoyVaPyf3rgwjsG-lg_xOSXTGZ_EMNeVkMh_ebiuoyhJ60rcnprpAD5dVMJ6yNQRGtH9-BF6_ik-d4FqPhlnKQshJGPiu2ynGlJ_vpAX3PHrzB-26TafXZDFe5bAlsisRej0hpNCToajhIoURXgWZGa4WPey3M_rc7OS-JiC4uTVP0-743Tn8JwgrA"

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
        "Authorization": \`Bearer \${token}\`,
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
    resultsDiv.innerHTML = \`
      <div class="card">
        <h3>\${part.mpn}</h3>
        <p><b>יצרן:</b> \${part.manufacturer?.name ?? "-"}</p>
        <p><b>תיאור:</b> \${part.description ?? "-"}</p>
        <p><b>מצב חיי מוצר:</b> \${part.lifecycle ?? "-"}</p>
        \${part.bestImage?.url ? \`<img src="\${part.bestImage.url}" width="120">\` : ""}
        <p><a href="\${part.octopartUrl}" target="_blank">🔗 פתיחת Octopart</a></p>
      </div>
    \`;
  } catch (error) {
    console.error(error);
    resultsDiv.innerHTML = "⚠️ שגיאה בעת קבלת הנתונים מהשרת.";
  }
});
