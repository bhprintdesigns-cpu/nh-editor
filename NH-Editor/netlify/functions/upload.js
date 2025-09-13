// netlify/functions/upload.js
// Nimmt Daten vom Browser an, hängt das Secret serverseitig an
// und postet an dein Google Apps Script. Secrets bleiben unsichtbar.

exports.handler = async (event) => {
  const CORS = {
    'Access-Control-Allow-Origin': '*',               // später kannst du das enger machen
    'Access-Control-Allow-Methods': 'POST,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: CORS };
  }
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers: CORS, body: 'Method Not Allowed' };
  }

  try {
    // Parameter, die der Browser schicken darf
    const params = new URLSearchParams(event.body || '');
    const id        = params.get('id')        || '';
    const product   = params.get('product')   || '';
    const pdfBase64 = params.get('pdfBase64') || '';
    const svgBase64 = params.get('svgBase64') || '';

    // Geheimnisse: NUR hier auf dem Server (per Netlify-Env-Variablen)
    const APPS_SCRIPT_URL = process.env.APPS_SCRIPT_URL; // <- gleich in Netlify setzen
    const SECRET          = process.env.UPLOAD_SECRET;   // <- gleich in Netlify setzen

    const forward = new URLSearchParams({ id, product, pdfBase64, svgBase64, secret: SECRET });

    const res  = await fetch(APPS_SCRIPT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8' },
      body: forward
    });

    const text = await res.text(); // Apps Script gibt i. d. R. JSON-Text zurück
    return {
      statusCode: res.status,
      headers: { ...CORS, 'Content-Type': 'application/json' },
      body: text
    };
  } catch (e) {
    return {
      statusCode: 500,
      headers: CORS,
      body: JSON.stringify({ ok: false, error: String(e) })
    };
  }
};
