# Requirements: Node >= 20, Docker Desktop

## Database
```sh
docker compose up -d
docker compose ps
```

## Server
```sh
cd server
```

PowerShell:
```powershell
Copy-Item .env.example .env
npm install
npm run seed
npm run start:dev
```

macOS/Linux:
```sh
cp .env.example .env
npm install
npm run seed
npm run start:dev
```

## Client (new terminal)
```sh
cd client
```

PowerShell:
```powershell
Copy-Item .env.example .env.local
npm install
npm run dev
```

macOS/Linux:
```sh
cp .env.example .env.local
npm install
npm run dev
```

## Open
```text
http://localhost:3000
```

## Tests
```sh
cd server
npm test
cd ../client
npm test
```

## Reset data
```sh
docker compose down -v
cd server
npm run seed
```

## Alternative without Docker
PowerShell:
```powershell
Add-Content server/.env 'MONGO_URI=your-MongoDB-or-Atlas-URI'
```

macOS/Linux:
```sh
printf '%s\n' 'MONGO_URI=your-MongoDB-or-Atlas-URI' >> server/.env
```

## Manual QA
- Enter `tidepool.zz`, then follow four linked pages — Expected: four page entries in the trail.
- Select Back three times, then Forward twice — Expected: each step shows the saved page snapshot.
- Select Back once, then navigate to another address — Expected: Forward is disabled.
- Search for a seeded topic, open a result, then select Back — Expected: the same search results and scroll position return.
- Publish a page, then visit its address — Expected: the published page renders.
- Publish the same address again — Expected: inline TAKEN error.
- Visit `lost-lighthouse.zz`, then open History — Expected: nowhere page and a `found=false` visit.
- Switch to Farah, then open History — Expected: empty history state.
- Switch to Chen, open History, and jump to a visit — Expected: long history and the selected address opens.
