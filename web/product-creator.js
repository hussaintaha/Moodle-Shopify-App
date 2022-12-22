import { GraphqlQueryError } from "@shopify/shopify-api";
import shopify from "./shopify.js";

export const DEFAULT_PRODUCTS_COUNT = 5;
const CREATE_PRODUCTS_MUTATION = `
  mutation populateProduct($input: ProductInput!) {
    productCreate(input: $input) {
      product {
        id
        title
      }
    }
  }
`;

export default async function productCreator(
  session,
  courseName,
  courseSummary,
  count = DEFAULT_PRODUCTS_COUNT,
) {
  const client = new shopify.api.clients.Graphql({ session });

  try {
    const response = await client.query({
      data: {
        query: CREATE_PRODUCTS_MUTATION,
        variables: {
          input: {
            title: courseName,
            variants: [{ price: randomPrice() }],
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

function randomPrice() {
  return Math.round((Math.random() * 10 + Number.EPSILON) * 100) / 100;
}
