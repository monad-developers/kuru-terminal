// Define a mapping of environment variable names to their values
const ENV_VARS = {
    "NEXT_PUBLIC_THEGRAPH_SUBGRAPH_URL": process.env.NEXT_PUBLIC_THEGRAPH_SUBGRAPH_URL,
    "NEXT_PUBLIC_GOLDSKY_SUBGRAPH_URL": process.env.NEXT_PUBLIC_GOLDSKY_SUBGRAPH_URL,
    "NEXT_PUBLIC_ALCHEMY_SUBGRAPH_URL": process.env.NEXT_PUBLIC_ALCHEMY_SUBGRAPH_URL,
    "NEXT_PUBLIC_ENVIO_HYPERINDEX_API_URL": process.env.NEXT_PUBLIC_ENVIO_HYPERINDEX_API_URL,
    "NEXT_PUBLIC_PONDER_GRAPHQL_API_URL": process.env.NEXT_PUBLIC_PONDER_GRAPHQL_API_URL,
};

type EnvVarName = keyof typeof ENV_VARS;

const getEnvOrThrow = (env: EnvVarName) => {
    const value = ENV_VARS[env];
    if (!value) {
        throw new Error(`${env} is not set`);
    }
    return value;
};

export const THEGRAPH_SUBGRAPH_URL = getEnvOrThrow("NEXT_PUBLIC_THEGRAPH_SUBGRAPH_URL");
export const GOLDSKY_SUBGRAPH_URL = getEnvOrThrow("NEXT_PUBLIC_GOLDSKY_SUBGRAPH_URL");
export const ALCHEMY_SUBGRAPH_URL = getEnvOrThrow("NEXT_PUBLIC_ALCHEMY_SUBGRAPH_URL");
export const ENVIO_HYPERINDEX_API_URL = getEnvOrThrow("NEXT_PUBLIC_ENVIO_HYPERINDEX_API_URL");
export const PONDER_GRAPHQL_API_URL = getEnvOrThrow("NEXT_PUBLIC_PONDER_GRAPHQL_API_URL");