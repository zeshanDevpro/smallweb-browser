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
