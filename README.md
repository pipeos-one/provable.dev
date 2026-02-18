# provable.dev

## Build
```bash
npm install
npm run build
```

Build output goes to `dist/`.

## React app (Vite)
```bash
npm run dev
```

The React workspace lives at `/app/` and is built into `dist/app/`.

## Existing proof UI workflow
```bash
cd ./provable-sdk/provable-sdk-ui
npm run build:browser

cd ./dist/browser
python3 -m http.server 8080

# open in browser
# file:///path_to/provable.dev/proof.html?ui=local
```
