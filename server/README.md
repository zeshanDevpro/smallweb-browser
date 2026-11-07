cd server
npm install
Copy-Item .env.example .env
npm run seed
npm run start:dev
npm run build
npm run lint
npm test
