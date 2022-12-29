import { DeliveryMethod } from "@shopify/shopify-api";
import mongoose from "mongoose";
import SyncCourses from "./models/SyncCourses.js";
import axios from "axios";

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

      // console.log("ORDERSSSSPAIDDDDD", payload.customer.email);

      const checkCourse = await SyncCourses.findOne({
        "course.displayname": payload.line_items[0].name
      });

      const mdl_course_id = checkCourse.course.id;

      const mdl_users = await axios.get(`${process.env.MD_HOST}/${process.env.MD_WEBSERVICE}=${process.env.MD_TOKEN}&wsfunction=${process.env.MD_METHOD_GET_USERS}&field=email&values[0]=${payload.customer.email}&${process.env.MD_REST_FORMAT}=${process.env.MD_REST_VALUE}`);

      const mdl_user_id = mdl_users.data[0].id;

      const enroll_user = await axios.get(`${process.env.MD_HOST}/${process.env.MD_WEBSERVICE}=${process.env.MD_TOKEN}&wsfunction=${process.env.MD_METHOD_ENROLL_USERS}&enrolments[0][roleid]=5&enrolments[0][userid]=${mdl_user_id}&enrolments[0][courseid]=${mdl_course_id}&${process.env.MD_REST_FORMAT}=${process.env.MD_REST_VALUE}`);

      console.log("enroll_user", enroll_user.data);



    },
  },
};
