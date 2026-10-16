export function renderErrorPage(): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>500 - Server Error | Glory Way Limited</title>
  <style>
    body { font-family: system-ui, sans-serif; background: #0c1a14; color: #f5f5f0; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; padding: 20px; box-sizing: border-box; }
    .box { text-align: center; max-width: 480px; }
    h1 { font-size: 2.5rem; margin-bottom: 0.5rem; color: #d4a34b; }
    p { margin-bottom: 1.5rem; color: #a3b8aa; }
    a { display: inline-block; background: #d4a34b; color: #0c1a14; padding: 10px 20px; border-radius: 6px; text-decoration: none; font-weight: 600; }
  </style>
</head>
<body>
  <div class="box">
    <h1>Something went wrong</h1>
    <p>We are experiencing a temporary error. Please refresh the page or return home.</p>
    <a href="/">Return Home</a>
  </div>
</body>
</html>`;
}
