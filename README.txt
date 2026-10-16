TKN — POS SYSTEM

FILES
- index.html: page structure and screen elements. Edit this when changing the content/layout structure.
- styles.css: all colours, spacing, sizing, and responsive layout. Start with the :root colour variables.
- app.js: app behaviour, product data, cart, cash/card checkout, sales history, and backups.
- manifest.json: Home Screen / web-app settings.
- sw.js: offline cache settings.

QUICK TEST ON MAC
1. Open this folder in VS Code.
2. Open Terminal (inside VS Code: Terminal > New Terminal).
3. Run: python3 -m http.server 8000
4. In your browser, open http://localhost:8000
5. To stop the server, return to Terminal and press Control+C.

WHY USE A LOCAL SERVER?
The service worker used for offline support will not run when index.html is opened directly as a file. Use localhost for testing.

CUSTOMIZE
- Product names, prices, and emojis: in the app, go to Products.
- Default sample products: near the top of app.js, inside the defaults object.
- Main theme colours: at the top of styles.css in the :root section.
- Screen content and buttons: index.html.

IMPORTANT
This is a prototype. It records a card sale only after you confirm Ziina has approved payment; it does not process payments or connect to Ziina. Data is stored in browser localStorage. Export backups regularly. Offline use on an iPad requires hosting over HTTPS and opening the app once while online.
