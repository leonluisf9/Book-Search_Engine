import express from 'express';
import cors from 'cors';
import path from 'node:path';
import { fileURLToPath } from 'url';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import db from './config/connection.js';
import typeDefs from './schemas/typeDefs.js';
import resolvers from './schemas/resolvers.js';
import { getUserFromToken } from './services/auth.js';
import dotenv from 'dotenv';

dotenv.config();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const PORT = Number(process.env.PORT) || 3001;
console.log("Initializing Apollo Server...");
const server = new ApolloServer({
  typeDefs,
  resolvers,
  introspection: true, 
});

async function startServer() {
  await server.start();
  console.log("Apollo Server Started!");

  app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "https://book-search-engine-7c4s.onrender.com");
    res.header("Access-Control-Allow-Credentials", "true");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
    res.header("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
    next();
  });
  
  app.use(cors({
    origin: 'https://book-search-engine-7c4s.onrender.com',
    credentials: true
  }));
  app.use(express.urlencoded({ extended: true }));
  app.use(express.json());

  app.use(
    '/graphql',
    expressMiddleware(server, {
      context: async ({ req }) => {
        console.log("🔍 Checking Authorization Header:", req.headers.authorization);
        const token = req.headers.authorization?.split(' ')[1];
        const user = getUserFromToken(token);
        console.log("Decoded User:", user);
        return { user };
      },
    })
  );

  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, '../../client/dist')));
  }

  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}/graphql`);
  });

  db.once('open', () => {
    console.log("Database Connected!");
  });

  db.on('error', (err) => {
    console.error("Database Connection Error:", err);
  });
}

startServer();