import { GraphQLClient } from "graphql-request";
import * as Base from "./api/Base";
import * as BaseSepolia from "./api/BaseSepolia";

// Hardcoded Endpoints with display names
export const ENDPOINTS = {
  railsMockApi: {
    url: "https://api-i7n.thp-lab.org/api/v1/graph",
    displayName: "[OffChain] Playground API",
  },
  baseSepolia: {
    url: "https://api.i7n.dev/v1/graphql",
    displayName: "Base Testnet",
    module: BaseSepolia,
  },
  base: {
    url: "https://i7n.app/gql",
    displayName: "Base Mainnet",
    module: Base,
  },
};

// Create GraphQL client based on endpoint
export const createClient = (endpoint) => {
  if (!ENDPOINTS[endpoint]) {
    throw new Error(`Endpoint '${endpoint}' is not defined.`);
  }
  return new GraphQLClient(ENDPOINTS[endpoint].url);
};

// Wrapper to dynamically select the appropriate module
const getModuleForEndpoint = (endpoint) => {
  if (!ENDPOINTS[endpoint] || !ENDPOINTS[endpoint].module) {
    throw new Error(`No module defined for endpoint '${endpoint}'.`);
  }
  return ENDPOINTS[endpoint].module;
};

// Unified fetchTriples function
export const fetchTriples = async (endpoint = "base") => {
  const module = getModuleForEndpoint(endpoint);
  return module.fetchTriples(endpoint);
};

// Unified fetchTriplesForNode function
export const fetchTriplesForNode = async (nodeId, endpoint = "base") => {
  const module = getModuleForEndpoint(endpoint);
  debugger
  return module.fetchTriplesForNode(nodeId, endpoint);
};

// Unified fetchAtomDetails function
export const fetchAtomDetails = async (atomId, endpoint = "base") => {
  const module = getModuleForEndpoint(endpoint);
  return module.fetchAtomDetails(atomId, endpoint);
};
