// src/api.js
import { gql, GraphQLClient } from "graphql-request";

const endpoint = "https://i7n.app/gql";
const client = new GraphQLClient(endpoint);

export const fetchTriples = async () => {
  const query = gql`
    query {
      triples(limit: 1000) {
        items {
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
    }
  `;
  const data = await client.request(query);
  return data.triples.items;
};
