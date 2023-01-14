import { DeliveryMethod } from "@shopify/shopify-api";
import SyncCourses from "./models/SyncCourses.js";
import MoodleSettings from "./models/MoodleSettings.js";
import UserFetch from "./moodleapi/UserFetch.js";
import UserCreate from "./moodleapi/UserCreate.js";
import UserEnroll from "./moodleapi/UserEnroll.js";

export default {
  /**
   * Customers can request their data from a store owner. When this happens,
   * Shopify invokes this webhook.
   *
   * https://shopify.dev/apps/webhooks/configuration/mandatory-webhooks#customers-data_request
   */
  CUSTOMERS_DATA_REQUEST: {
    deliveryMethod: DeliveryMethod.Http,
    callbackUrl: "/api/webhooks",
    callback: async (topic, shop, body, webhookId) => {
      const payload = JSON.parse(body);
      // Payload has the following shape:
      // {
      //   "shop_id": 954889,
      //   "shop_domain": "{shop}.myshopify.com",
      //   "orders_requested": [
      //     299938,
      //     280263,
      //     220458
      //   ],
      //   "customer": {
      //     "id": 191167,
      //     "email": "john@example.com",
      //     "phone": "555-625-1199"
      //   },
      //   "data_request": {
      //     "id": 9999
      //   }
      // }
    },
  },

  /**
   * Store owners can request that data is deleted on behalf of a customer. When
   * this happens, Shopify invokes this webhook.
   *
   * https://shopify.dev/apps/webhooks/configuration/mandatory-webhooks#customers-redact
   */
  CUSTOMERS_REDACT: {
    deliveryMethod: DeliveryMethod.Http,
    callbackUrl: "/api/webhooks",
    callback: async (topic, shop, body, webhookId) => {
      const payload = JSON.parse(body);
      // Payload has the following shape:
      // {
      //   "shop_id": 954889,
      //   "shop_domain": "{shop}.myshopify.com",
      //   "customer": {
      //     "id": 191167,
      //     "email": "john@example.com",
      //     "phone": "555-625-1199"
      //   },
      //   "orders_to_redact": [
      //     299938,
      //     280263,
      //     220458
      //   ]
      // }
    },
  },

  /**
   * 48 hours after a store owner uninstalls your app, Shopify invokes this
   * webhook.
   *
   * https://shopify.dev/apps/webhooks/configuration/mandatory-webhooks#shop-redact
   */
  SHOP_REDACT: {
    deliveryMethod: DeliveryMethod.Http,
    callbackUrl: "/api/webhooks",
    callback: async (topic, shop, body, webhookId) => {
      const payload = JSON.parse(body);
      // Payload has the following shape:
      // {
      //   "shop_id": 954889,
      //   "shop_domain": "{shop}.myshopify.com"
      // }
    },
  },

  ORDERS_PAID: {
    deliveryMethod: DeliveryMethod.Http,
    callbackUrl: "/api/webhooks",
    callback: async (topic, shop, body, webhookId) => {
      const payload = JSON.parse(body);

      // console.log("ORDERSSSSPAIDDDDD", payload.customer);

      const checkCourse = await SyncCourses.findOne({
        "course.displayname": payload.line_items[0].name
      });

      if (checkCourse) {

        const firstName = payload.customer.first_name;
        const lastName = payload.customer.last_name;
        const email = payload.customer.email;

        const fetchSettingsFunction = async () => {
          return await MoodleSettings.find();
        };

        const fetchSettings = await fetchSettingsFunction();
        const HOST_MD = fetchSettings[0]?.moodle_url;
        const ACCESSTOKEN_MD = fetchSettings[0]?.moodle_accessToken;
        const checkUserExists = await UserFetch(HOST_MD, ACCESSTOKEN_MD, payload.customer.email);

        if (checkUserExists.data.length === 0) {

          const mdl_create_user = await UserCreate(HOST_MD, ACCESSTOKEN_MD, firstName, lastName, email, `${firstName}A@123`);
          const fetchUser = await UserFetch(HOST_MD, ACCESSTOKEN_MD, payload.customer.email);

          const enroll_mdl_user_id = fetchUser.data[0].id;
          const enroll_mdl_course_id = checkCourse.course.id

          const enrollUser = await UserEnroll(HOST_MD, ACCESSTOKEN_MD, enroll_mdl_user_id, enroll_mdl_course_id);
        }
      }
    },
  },

};
