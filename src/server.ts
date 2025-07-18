// src/server.ts
import app from './app';
import * as dotenv from 'dotenv'

dotenv.config({path: './.env'})

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});
