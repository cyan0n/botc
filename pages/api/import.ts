import type { NextApiRequest, NextApiResponse } from "next";
import edition_list from "../../config/editions.json";
import getDriver from "../../util/neo4j";

const driver = getDriver();
const session = driver.session();

export default async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const moviesPromise = session.readTransaction(async (transaction) => {
      const cypher = `
        MATCH (movie:Movie)
        RETURN movie {.*,
          actors: [ (movie)<-[:ACTED_IN]-(actor) | actor.name ],
          dircted: [ (movie)<-[:DIRECTED]-(director) | director.name ]
        } as movie
        ORDER BY movie.title ASC
        `;
      const response = await transaction.run(cypher);
      const movies = response.records.map((record) => record.get("movie"));
      return movies;
    });
    const movies = await moviesPromise;
    res.status(200).json(movies);
  } catch (error) {
    res.status(400);
  }
};
