import { gql, GraphQLClient } from "graphql-request";

// Hardcoded Endpoints
const ENDPOINTS = {
  railsMockApi: "http://localhost:3042/api/v1/graph",
  baseSepolia: "https://api.i7n.dev/v1/graphql",
  base: "https://i7n.app/gql",
};

// Select which endpoint to use
const data_endpoint = "baseSepolia";

// Create GraphQL client with selected endpoint
const client = new GraphQLClient(ENDPOINTS[data_endpoint]);

// Fetch Triples
export const fetchTriples = async () => {
  let query, data;
  switch (data_endpoint) {
    case "base":
      query = gql`
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
      data = await client.request(query);
      return data.triples;
  }
};

export const fetchAtomDetails = async (atomId) => {
  debugger
  const query = gql`
    query ($id: numeric!) {
      atom(id: $id) {
        id
        vault {
          totalShares
        }
        data
      }
    }
  `;
  const variables = { id: atomId };

  try {
    const data = await client.request(query, variables);
    return data.atom; // Retourne directement les détails de l'atome
  } catch (error) {
    console.error("Error fetching atom details:", error);
    throw error;
  }
};



// Export current endpoint for potential use in other components
export const getCurrentEndpoint = () => ENDPOINTS[data_endpoint];
