export default async function handler(req, res) {
  const { query } = req.query;
  if (!query) {
    res.status(400).json({ error: "Missing query parameter" });
    return;
  }

  try {
    const response = await fetch(`/api/search?query=${encodeURIComponent(query)}`);
    if (!response.ok) {
      throw new Error(`TrustedParts API error: ${response.status}`);
    }
    const data = await response.json();
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
