import express from 'express';

const app = express();

app.get('/', (_req, res) => {
  const brandName = process.env.BRAND_NAME || 'That Credit Girl Suite';
  const color = process.env.BRAND_COLOR_PRIMARY || '#FF4DA6';
  const mode = process.env.BRAND_MODE || 'branded';
  res.setHeader('Content-Type', 'text/html');
  res.end(`<!doctype html>
  <html>
    <head>
      <meta charset="utf-8"/>
      <meta name="viewport" content="width=device-width, initial-scale=1"/>
      <title>${brandName}</title>
      <style>
        body { font-family: system-ui, sans-serif; margin: 0; }
        header { background: ${mode === 'branded' ? color : '#111'}22; padding: 16px; }
        .container { padding: 24px; }
        .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 12px; }
        .card { border: 1px solid #eee; border-radius: 8px; padding: 16px; }
        .badge { background: ${color}; color: #fff; padding: 2px 8px; border-radius: 999px; font-size: 12px; }
      </style>
    </head>
    <body>
      <header>
        <h1>${brandName}</h1>
        <span class="badge">${mode}</span>
      </header>
      <div class="container">
        <h2>Modules</h2>
        <div class="grid">
          <div class="card">Credit Repair</div>
          <div class="card">Sovereign Tools</div>
          <div class="card">CUSIP & Securitization</div>
          <div class="card">Tax Bot</div>
          <div class="card">Delivery Center</div>
          <div class="card">Marketing</div>
          <div class="card">Training</div>
          <div class="card">Admin Panel</div>
        </div>
      </div>
    </body>
  </html>`);
});

const port = process.env.PORT ? Number(process.env.PORT) : 3000;
app.listen(port, () => {
  console.log(`Web listening on :${port}`);
});