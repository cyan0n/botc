import { gql, ApolloServer } from "apollo-server-micro";
import neo4j from "neo4j-driver";
import { Neo4jGraphQL } from "@neo4j/graphql";

const typeDefs = gql`
  type Person {
    id: ID
    name: String
    born: Int
    acted_in: [Movie] @relationship(type: "ACTED_IN", direction: OUT)
    follows: [Person] @relationship(type: "FOLLOWS", direction: OUT)
    followers: [Person] @relationship(type: "FOLLOWS", direction: IN)
  }

  type Movie {
    id: ID
    released: Int
    tagline: String
    title: String
    actors: [Person] @relationship(type: "ACTED_IN", direction: IN)
  }
`;

const driver = neo4j.driver(
  process.env.NEO4J_HOST as string,
  neo4j.auth.basic(
    process.env.NEO4J_USER as string,
    process.env.NEO4J_PASS as string,
  ),
);

const neoSchema = new Neo4jGraphQL({ typeDefs, driver });

const apolloServer = new ApolloServer({ schema: neoSchema.schema });

const startServer = apolloServer.start();

export default async function handler(req: any, res: any) {
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader(
    "Access-Control-Allow-Origin",
    "https://studio.apollographql.com",
  );
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept",
  );
  if (req.method === "OPTIONS") {
    res.end();
    return false;
  }

  await startServer;
  await apolloServer.createHandler({
    path: "/api/graphql",
  })(req, res);
}

export const config = {
  api: {
    bodyParser: false,
  },
};
