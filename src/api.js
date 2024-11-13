// src/api.js
import { gql, GraphQLClient } from "graphql-request";

const endpoint = "https://i7n.app/gql";
const client = new GraphQLClient(endpoint);

export const fetchTriples = async () => {
  const query = gql`
    query {
      triples {
        items {
          subject {
            label
          }
          predicate {
            label
          }
          object {
            label
          }
        }
      }
    }
  `;
  const data = await client.request(query);
  return data.triples.items;
};
