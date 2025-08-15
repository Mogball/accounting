# Accounting
# Accounting Excel Add-in (Boilerplate)

Quick-start Excel Task Pane add-in using TypeScript and Webpack.

## Run (macOS)

1) Install dependencies:

```bash
npm install
```

2) Install trusted HTTPS certs for `https://localhost:3000`:

```bash
npm run dev-certs
```

3) Start the dev server:

```bash
npm start
```

4) Sideload the add-in into Excel (Mac):

- Create the sideload folder if it doesn't exist:
  `mkdir -p ~/Library/Containers/com.microsoft.Excel/Data/Documents/wef`
- Copy the `manifest.xml` into that folder:
  `cp -f manifest.xml ~/Library/Containers/com.microsoft.Excel/Data/Documents/wef/`
- Open Excel → Insert → Add-ins → My Add-ins → Shared Folder → Accounting Excel Add-in.

5) Click "Open Pane" on the Home tab ribbon. In the pane, click "Write to Selection".

## Validate manifest

```bash
npm run validate
```

## Build production

```bash
npm run build
```
