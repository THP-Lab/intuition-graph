import { gql, GraphQLClient } from "graphql-request";

// Hardcoded Endpoints
const ENDPOINTS = {
  railsMockApi: "http://localhost:3042/api/v1/graph",
  baseSepolia: "https://api.i7n.dev/v1/graphql",
  base: "https://i7n.app/gql",
};

// Select which endpoint to use
// Change this to switch endpoints:
//'railsMockApi' | 'baseSepolia' | 'base'
const data_endpoint = "base";

// Create GraphQL client with selected endpoint
const client = new GraphQLClient(ENDPOINTS[data_endpoint]);

export const fetchTriples = async () => {
  let query, data;
  switch (data_endpoint) {
    case "base":
      query = gql`
        query {
          triples(limit: 100) {
            items {
              id
              subject {
                label
                id
                creatorId
                type
              }
              predicate {
                label
                id
                creatorId
                type
              }
              object {
                label
                id
                creatorId
                type
              }
            }
          }
        }
      `;
      data = await client.request(query);
      return data.triples.items;
    default:
      query = gql`
        query {
          triples(limit: 1000) {
            id
            subject {
              label
              id
              creatorId
              type
            }
            predicate {
              label
              id
              creatorId
              type
            }
            object {
              label
              id
              creatorId
              type
            }
          }
        }
      `;
      data = await client.request(query);
      return data.triples;
  }
};

// Fetch Atom Details
export const fetchAtomDetails = async (atomId) => {
  let query;
  switch (data_endpoint) {
    case "base":
      query = gql`
    query GetAtom($atomId: BigInt!) {
      atom(id: $atomId) {
        id
        image
        label
        emoji
        type
        creatorId
        vault {
          totalShares
        }
      }
    }
  `;
  break;
  default:
    query = gql`
    query GetAtom($atomId: numeric!) {
      atom(id: $atomId) {
        id
        image
        label
        emoji
        type
        creatorId
        vault {
          totalShares
        }
      }
    }
  `;
  }

  const variables = { atomId };

  try {
    const data = await client.request(query, variables);
    return data.atom;
  } catch (error) {
    console.error("Error fetching atom details:", error);
    throw error;
  }
};
