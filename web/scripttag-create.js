import { GraphqlQueryError } from "@shopify/shopify-api";
import shopify from "./shopify.js";

const CREATE_SCRIPTTAG_MUTATION = `
    mutation scriptTagCreate($input: ScriptTagInput!) {
        scriptTagCreate(input: $input) {
            scriptTag {
                id
            }
        }
    }
`;

export default async function scriptCreator(session, hostName) {
    const client = new shopify.api.clients.Graphql({ session });

    try {
        const response = await client.query({
            data: {
                query: CREATE_SCRIPTTAG_MUTATION,
                variables: {
                    input: {
                        src: hostName
                    },
                },
            },
        });
        return response.body.data;
    } catch (error) {
        if (error instanceof GraphqlQueryError) {
            throw new Error(
                `${error.message}\n${JSON.stringify(error.response, null, 2)}`
            );
        } else {
            throw error;
        }
    }



}
