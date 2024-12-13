import { gql, GraphQLClient } from "graphql-request";

// Hardcoded Endpoints with display names
export const ENDPOINTS = {
    baseSepolia: {
        url: "https://api.i7n.dev/v1/graphql",
        displayName: "Base Testnet",
    },
};

// Create GraphQL client based on endpoint
export const createClient = (endpoint) => {
    return new GraphQLClient(ENDPOINTS[endpoint].url);
};

// Fetch Atom Details
export const fetchAtomDetails = async (atomId, endpoint = "baseSepolia") => {
    const client = createClient(endpoint);
    let query;
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

    const variables = { atomId };

    try {
        const data = await client.request(query, variables);
        return data.atom;
    } catch (error) {
        console.error("Error fetching atom details:", error);
        throw error;
    }
};

// Fetch Triples Details
export const fetchTriples = async (endpoint = "baseSepolia") => {
    const client = createClient(endpoint);
    let query, data;
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
    // Match the structure returned by Base.js
    return {
        items: data.triples
    }.items;
};

// Fetch Embedded triples Details
export const fetchTriplesForNode = async (nodeId, endpoint = "baseSepolia") => {
    const client = createClient(endpoint);
    let query, data, variables;
    query = gql`
            query Triples($where: triples_bool_exp) {
              triples(where: $where) {
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
        `;
    variables = {
        where: {
            _or: [
                {
                    predicateId: {
                        _eq: nodeId,
                    },
                },
                {
                    subjectId: {
                        _eq: nodeId,
                    },
                },
                {
                    objectId: {
                        _eq: nodeId,
                    },
                },
            ],
        },
    };
    data = await client.request(query, variables);
    return data.triples;
};

// Search Triples
export const searchTriples = async (filters, endpoint = "baseSepolia") => {
    const client = createClient(endpoint);
    const query = gql`
        query SearchTriples($where: triples_bool_exp) {
          triples(where: $where) {
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

    const where = {
        _and: []
    };

    if (filters.subject) {
        where._and.push({
            subject: {
                label: {
                    _ilike: `%${filters.subject}%`
                }
            }
        });
    }

    if (filters.predicate) {
        where._and.push({
            predicate: {
                label: {
                    _ilike: `%${filters.predicate}%`
                }
            }
        });
    }

    if (filters.object) {
        where._and.push({
            object: {
                label: {
                    _ilike: `%${filters.object}%`
                }
            }
        });
    }

    const variables = {
        where: where._and.length > 0 ? where : {}
    };

    console.log("Executing search query with variables:", variables);

    try {
        const data = await client.request(query, variables);
        console.log("Search query response:", data);
        return data.triples;
    } catch (error) {
        console.error("Error executing search query:", error);
        throw error;
    }
};
