import type { NextApiRequest, NextApiResponse } from "next";
import getDriver from "../../util/neo4j";
import { cypherEdge, cypherNode } from "../../util/cypher";

import edition_list from "../../config/editions.json";
import role_list from "../../config/roles.json";
import hatred_list from "../../config/hatred.json";

const driver = getDriver();
const session = driver.session();

const clearAll = () => {
  return session.writeTransaction((transaction) => {
    transaction.run(`
      MATCH (n)
      WHERE n:Edition OR n:Role
      DETACH DELETE (n)
    `);
  });
};

const importEditions = () => {
  return session.writeTransaction((transaction) => {
    const cypher = edition_list
      .map((edition) => cypherNode("edition", edition, edition.slug))
      .join("\n");
    transaction.run(cypher);
  });
};

const importAll = () => {
  const cypher: string[] = [];
  cypher.push(...edition_list.map((e) => cypherNode("Edition", e, e.slug)));
  cypher.push(...role_list.map((r) => cypherNode(["Role", r.team], r, r.slug)));
  cypher.push("CREATE");
  cypher.push(
    ...role_list.map((r) => cypherEdge("belogns_to", r.slug, r.edition)),
  );
  hatred_list.forEach((hatred) =>
    cypher.push(
      ...hatred.hatred.map((h) =>
        cypherEdge("hates", hatred.slug, h.slug, { reason: h.reason }),
      ),
    ),
  );
  cypher[cypher.length - 1] = cypher[cypher.length - 1].slice(0, -1);
  return session.writeTransaction((transaction) => {
    transaction.run(cypher.join("\n"));
  });
};

export default async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    await clearAll();
    // res.status(200).json(importAll());
    await importAll();
    res.status(200).json({});
  } catch (error) {
    res.status(400).json(error);
  }
};
