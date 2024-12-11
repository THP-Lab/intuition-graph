import { gql, GraphQLClient } from "graphql-request";

export const ENDPOINTS = {
  base: {
    url: "https://i7n.app/gql",
    displayName: "Base Mainnet",
  },
};

export const createClient = (endpoint) => {
  return new GraphQLClient(ENDPOINTS[endpoint].url);
};

export const fetchAtomDetails = async (atomId, endpoint = "base") => {
  const client = createClient(endpoint);
  let query;
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


  const variables = { atomId };

  try {
    const data = await client.request(query, variables);
    return data.atom;
  } catch (error) {
    console.error("Error fetching atom details:", error);
    throw error;
  }
};

export const fetchTriples = async (endpoint = "base") => {
  const client = createClient(endpoint);
  let query, data;

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
};

export const fetchTriplesForNode = async (nodeId, endpoint) => {
  const client = createClient(endpoint);
  let query, data, variables;
  query = gql`
        query Triples($where: TripleFilter) {
          triples(where: $where) {
            items {
                id
                label
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
  variables = {
    where: {
      OR: [
        {
          subjectId: parseInt(nodeId),
        },
        {
          predicateId: parseInt(nodeId)
        },
        {
          objectId: parseInt(nodeId)
        },
      ],
    },
  };
  data = await client.request(query, variables);
  return data.triples.items;
};