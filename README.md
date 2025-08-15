# Accounting
# Accounting Paste Tools (Static Web)

Static website to convert pasted spreadsheet data (Excel/Sheets) into JSON or CSV. Designed for hosting on GitHub Pages.

## Use it

1) Open the site (e.g., GitHub Pages at `https://<owner>.github.io/accounting/`).
2) Copy cells in Excel/Sheets and paste into the input box.
3) Choose output format (JSON arrays, JSON objects with header row, or CSV).
4) Click Convert, then Copy or Download the result.

## Local dev (optional)

```bash
npm run serve
```
Open http://localhost:3000

## Deploy to GitHub Pages

Option A: gh-pages branch

```bash
git checkout -B gh-pages
git rm -rf .
cp -R ../accounting/* .  # or copy the built static files into this branch
git add .
git commit -m "Publish static site"
git push -f origin gh-pages
```
Then enable Pages in repo settings: Source → Deploy from a branch, Branch `gh-pages`, folder `/ (root)`.

Option B: main branch /docs folder

Place `index.html`, `styles.css`, `app.js` under `/docs`, then set Pages to serve from `main` and folder `/docs`.

## Notes

- Pasted data is parsed as tab-delimited (TSV) with support for quoted fields and newlines.
- JSON objects mode uses the first row as headers; missing headers are auto-filled as `col_#`.
