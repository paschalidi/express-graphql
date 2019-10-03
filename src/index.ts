import "reflect-metadata";
import { ApolloServer } from "apollo-server-express";
import Express from "express";
import { buildSchema } from "type-graphql";
import { createConnection } from "typeorm";
import session from "express-session";
import connectRedis from "connect-redis";
import cors from "cors";
import Redis from "ioredis";
import { MeResolver } from "./modules/user/Me";
import { RegisterResolver } from "./modules/user/Register";
import { LoginResolver } from "./modules/user/Login";

const redis = new Redis();

const main = async () => {
  await createConnection();
  const schema = await buildSchema({
    resolvers: [RegisterResolver, LoginResolver, MeResolver]
  });
  const apolloServer = new ApolloServer({
    schema,
    // pass a function to the context key. Apollo server gives us access to the context key.
    // we can access this object req into our resolvers
    context: ({ req }: any) => ({ req })
  });
  const app = Express();

  const RedisStore = connectRedis(session);

  const sessionOption: session.SessionOptions = {
    store: new RedisStore({
      client: redis as any
    }),
    name: "qid",
    secret: "SESSION_SECRET",
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 1000 * 60 * 60 * 24 * 7 * 365 // 7 years
    }
  };

  app.use(cors({ credentials: true, origin: "http://localhost:3000" }));
  app.use(session(sessionOption));
  apolloServer.applyMiddleware({ app });
  app.listen(4000, () => console.log("at http://localhost:4000"));
};

main();
