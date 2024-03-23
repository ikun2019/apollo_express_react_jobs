import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import cors from 'cors';
import express from 'express';
import { readFile } from 'node:fs/promises';
import { resolvers } from './resolvers.js';
import { authMiddleware, handleLogin } from './auth.js';
import { getUser } from './db/users.js';
import { createCompanyLoader } from './db/companies.js';

const PORT = 8080;

const app = express();
app.use(cors(), express.json(), authMiddleware);

app.post('/login', handleLogin);

// * GraphQLの設定
const typeDefs = await readFile('./schema.graphql', 'utf-8');

const apolloServer = new ApolloServer({ typeDefs, resolvers });
await apolloServer.start();
app.use('/graphql', expressMiddleware(apolloServer, { context: getContext }));

async function getContext({ req }) {
  const companyLoader = createCompanyLoader();
  const context = { companyLoader };
  if (req.auth) {
    context.user = await getUser(req.auth.sub);
  }
  return context;
};

app.listen({ port: PORT }, () => {
  console.log(`Server running on port ${PORT}`);
});
