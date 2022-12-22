// @ts-check
import { join } from "path";
import { readFileSync } from "fs";
import express from "express";
import serveStatic from "serve-static";

import shopify from "./shopify.js";
import productCreator from "./product-creator.js";
import GDPRWebhookHandlers from "./gdpr.js";
import axios from "axios";
import mongoose from "mongoose";
import SyncCourses from "./models/SyncCourses.js";

const connectDB = async () => {
  try {
    mongoose.set("strictQuery", false);

    await mongoose.connect('mongodb://localhost:27017/', {
      dbName: "MoodleShopifyApp",
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log("DB CONNECTED")
  } catch (error) {
    console.log('mongodb connection failed');
  }
};

connectDB();

const PORT = parseInt(process.env.BACKEND_PORT || process.env.PORT, 10);

const STATIC_PATH =
  process.env.NODE_ENV === "production"
    ? `${process.cwd()}/frontend/dist`
    : `${process.cwd()}/frontend/`;


const app = express();

// Set up Shopify authentication and webhook handling
app.get(shopify.config.auth.path, shopify.auth.begin());
app.get(
  shopify.config.auth.callbackPath,
  shopify.auth.callback(),
  shopify.redirectToShopifyOrAppRoot()
);
app.post(
  shopify.config.webhooks.path,
  shopify.processWebhooks({ webhookHandlers: GDPRWebhookHandlers })
);

// All endpoints after this point will require an active session
app.use("/api/*", shopify.validateAuthenticatedSession());

app.use(express.json());

applyPublicEndpoints(app);

app.get("/api/products/count", async (_req, res) => {
  const countData = await shopify.api.rest.Product.count({
    session: res.locals.shopify.session,
  });
  res.status(200).send(countData);
});

app.post("/api/products/create", async (req, res) => {
  let status = 200;
  let error = null;

  let courseID = req.body.courseID;
  
  let courseName = await SyncCourses.findOne({
    'course.id': courseID
  });
  
  courseName = courseName.course.displayname;

  try {
    
    const createProduct = await productCreator(res.locals.shopify.session, courseName);

    let oldvalues = { 'course.id': courseID }
    let newvalues = { $set: { 'product': createProduct.productCreate.product } };

    await SyncCourses.findOneAndUpdate( oldvalues, newvalues );

  } catch (e) {
    console.log(`Failed to process products/create: ${e.message}`);
    status = 500;
    error = e.message;
  }
  res.status(status).send({ success: status === 200, error });
});

app.use(serveStatic(STATIC_PATH, { index: false }));

app.use("/*", shopify.ensureInstalledOnShop(), async (_req, res, _next) => {
  return res
    .status(200)
    .set("Content-Type", "text/html")
    .send(readFileSync(join(STATIC_PATH, "index.html")));
});

app.listen(PORT);

function applyPublicEndpoints(app) {
  app.get("/api/testing/route", async (req, res) => {

    try {
      
      const session = res.locals.shopify.session;

      const fetchCourses = await SyncCourses.find();
  
      // const mdl_courses = await axios.get(`${process.env.MD_HOST}/${process.env.MD_PLUGIN}/${process.env.MD_WEBSERVICE}=${process.env.MD_TOKEN}=${process.env.MD_METHOD_COURSE}&${process.env.MD_REST_FORMAT}=${process.env.MD_REST_VALUE}`);
  
      // const mdl_categories = await axios.get(`${process.env.MD_HOST}/${process.env.MD_PLUGIN}/${process.env.MD_WEBSERVICE}=${process.env.MD_TOKEN}=${process.env.MD_METHOD_CATEGORY}&${process.env.MD_REST_FORMAT}=${process.env.MD_REST_VALUE}`);
  
      // const mdl_courses_w_categories = mdl_courses.data.map(mdl_course => ({
      //   ...mdl_course,
      //   category: mdl_categories.data.find(mdl_category => (mdl_category.id === mdl_course.categoryid)) ?? null
      // }));
  
      // const client = new shopify.api.clients.Graphql({ session });
  
      // let productExists;
  
      // try {
      //   productExists = await client.query({
      //     data: `{
      //       products(query:"title:*LATEST_COURSE*" first:250 ) {
      //         edges {
      //           node {
      //             id
      //             title
      //           }
      //         }
      //       }
      //     }`,
      //   });
      // } catch (error) {
      //   console.log("ERROR", error);
      // }


      // for (let i = 0; i < mdl_courses_w_categories.length; i++) {

      //   await SyncCoursesFunction(mdl_courses_w_categories, session, i);
      // };


      // console.log("FETCHCOURSES", fetchCourses);

      // res.status(200).send(mdl_courses_w_categories);
      res.status(200).send(fetchCourses);
    } catch (error) {
      console.log("ERROR", error);
      res.status(500).send({'error': error})
    }

  });

  app.get("/api/sync/route", async (req, res) => {
    try {
      
      const session = res.locals.shopify.session;
  
      const mdl_courses = await axios.get(`${process.env.MD_HOST}/${process.env.MD_PLUGIN}/${process.env.MD_WEBSERVICE}=${process.env.MD_TOKEN}=${process.env.MD_METHOD_COURSE}&${process.env.MD_REST_FORMAT}=${process.env.MD_REST_VALUE}`);
  
      const mdl_categories = await axios.get(`${process.env.MD_HOST}/${process.env.MD_PLUGIN}/${process.env.MD_WEBSERVICE}=${process.env.MD_TOKEN}=${process.env.MD_METHOD_CATEGORY}&${process.env.MD_REST_FORMAT}=${process.env.MD_REST_VALUE}`);
  
      const mdl_courses_w_categories = mdl_courses.data.map(mdl_course => ({
        ...mdl_course,
        category: mdl_categories.data.find(mdl_category => (mdl_category.id === mdl_course.categoryid)) ?? null
      }));

      for (let i = 0; i < mdl_courses_w_categories.length; i++) {
        await SyncCoursesFunction(mdl_courses_w_categories, session, i);
      };

      res.status(200).send('success');
    } catch (error) {
      console.log("ERROR", error);
      res.status(500).send({'error': error})
    }

  });

};

const SyncCoursesFunction = async(mdl_courses_w_categories, session, i) => {

  const checkShop = await SyncCourses.findOne({
    "course": mdl_courses_w_categories[i]
  }).exec();

  if (checkShop) {

    await SyncCourses.findOneAndUpdate(
      {
        course: mdl_courses_w_categories[i]
      },
      {
        course: mdl_courses_w_categories[i],
        updated_at: new Date()
      },
      {
        upsert: true,
      }
    ).exec();

    console.log("Courses Updated Successfully");

  } else {
  
    const syncCourses = new SyncCourses({
      _id: new mongoose.Types.ObjectId(),
      course: mdl_courses_w_categories[i],
      product: "Not Created",
      created_at: new Date(),
      updated_at: new Date()
    });
    
    await syncCourses.save();

    console.log("Courses have been Synced");
  }
};