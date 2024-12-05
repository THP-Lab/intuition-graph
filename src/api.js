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
  const query = gql`
    query {
      triples(limit: 1000) {
        id
        subject {
          label
          id
          type
        }
        predicate {
          label
          id
          type
        }
        object {
          label
          id
          type
        }
      }
    }
  `;
  try {
    const data = await client.request(query);
    return data.triples;
  } catch (error) {
    console.error("Error fetching triples:", error);
    throw error;
  }
};

// Fetch Atom Details
export const fetchAtomDetails = async (atomId) => {
  const query = gql`
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
        creator {
          id
          label
          image
        }
      }
    }
  `;
  const variables = { atomId };

  try {
    const data = await client.request(query, variables);
    return data.atom;
  } catch (error) {
    console.error("Error fetching atom details:", error);
    throw error;
  }
};
