// src/api.js
import { gql, GraphQLClient } from "graphql-request";

// Base SubGraph
// const endpoint = "https://i7n.app/gql";

// Base Sepolia (Test) SubGraph
// const endpoint = "https://api.i7n.dev/v1/graphql";

// Rails Mock API
const endpoint = "http://localhost:3042/api/v1/graph";

const client = new GraphQLClient(endpoint);

export const fetchTriples = async () => {
  const query = gql`
    query {
      triples(limit: 500) {
        id
        subject {
          label
          id
        }
        predicate {
          label
          id
        }
        object {
          label
          id
        }
      }
    }
  `;
  const data = await client.request(query);
  return data.triples;
};
