import { GraphqlQueryError } from "@shopify/shopify-api";
import shopify from "./shopify.js";

const UPDATE_PRODUCTS_MUTATION = `
  mutation populateProduct($input: ProductInput!) {
    productUpdate(input: $input) {
      product {
        id
        title
      }
    }
  }
`;

export default async function productUpdater(
    session,
    courseName,
    courseSummary,
    productID
) {
    const client = new shopify.api.clients.Graphql({ session });

    try {
        const response = await client.query({
            data: {
                query: UPDATE_PRODUCTS_MUTATION,
                variables: {
                    input: {
                        id: productID,
                        title: courseName,
                        descriptionHtml: `${courseSummary}`
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