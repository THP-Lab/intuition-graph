import { gql, GraphQLClient } from "graphql-request";

// Hardcoded Endpoints with display names
export const ENDPOINTS = {
  railsMockApi: {
    url: "https://api-i7n.thp-lab.org/api/v1/graph",
    displayName: "[OffChain] Playground API",
  },
  baseSepolia: {
    url: "https://api.i7n.dev/v1/graphql",
    displayName: "Base Testnet",
  },
  base: {
    url: "https://i7n.app/gql",
    displayName: "Base Mainnet",
  },
};

// Create GraphQL client based on endpoint
export const createClient = (endpoint) => {
  return new GraphQLClient(ENDPOINTS[endpoint].url);
};

export const fetchTriples = async (endpoint = "base") => {
  const client = createClient(endpoint);
  let query, data;

  switch (endpoint) {
    case "base":
      query = gql`
        query {
          triples(limit: 1000) {
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
export const fetchAtomDetails = async (atomId, endpoint = "base") => {
  const client = createClient(endpoint);
  let query;
  switch (endpoint) {
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
