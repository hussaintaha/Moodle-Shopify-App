// @ts-check
import { join } from "path";
import { readFileSync } from "fs";
import express from "express";
import serveStatic from "serve-static";

import shopify from "./shopify.js";
import productCreator from "./product-creator.js";
import productUpdater from "./product-updater.js";
import GDPRWebhookHandlers from "./gdpr.js";
import axios from "axios";
import mongoose from "mongoose";
import SyncCourses from "./models/SyncCourses.js";
import MoodleSettings from "./models/MoodleSettings.js";
import CustomerData from "./models/CustomerData.js";
import scriptCreator from "./scripttag-create.js";

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

applyNonAuthPublicEndpoints(app);

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

app.get("/api/data/get", async (req, res) => {

  const fetchSettings = await MoodleSettings.find();

  res.status(200).send( {'success': 'true', 'data': fetchSettings })

});

app.post("/api/products/create", async (req, res) => {
  let status = 200;
  let error = null;

  let courseID = req.body.courseID;

  let courseDetails = await SyncCourses.findOne({
    'course.id': courseID
  });

  let courseName = courseDetails.course.displayname;
  let courseSummary = courseDetails.course.summary;

  try {

    const createProduct = await productCreator(res.locals.shopify.session, courseName, courseSummary);

    let oldvalues = { 'course.id': courseID }
    let newvalues = { $set: { 'product': createProduct.productCreate.product } };

    await SyncCourses.findOneAndUpdate(oldvalues, newvalues);

  } catch (e) {
    console.log(`Failed to process products/create: ${e.message}`);
    status = 500;
    error = e.message;
  }
  res.status(status).send({ success: status === 200, error });
});

app.put("/api/products/update", async (req, res) => {
  let status = 200;
  let error = null;

  let courseID = req.body.courseID;

  let courseDetails = await SyncCourses.findOne({
    'course.id': courseID
  });

  let courseName = courseDetails.course.displayname;
  let courseSummary = courseDetails.course.summary;
  let productID = courseDetails.product.id;

  try {

    const updateProduct = await productUpdater(res.locals.shopify.session, courseName, courseSummary, productID);

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

      res.status(200).send(fetchCourses);
    } catch (error) {
      console.log("ERROR", error);
      res.status(500).send({ 'error': error })
    }

  });

  app.get("/api/script/create", async (req, res) => {

    const session = res.locals.shopify.session;

    const getAllScripts = await shopify.api.rest.ScriptTag.all({ session });

    let hostName = `https://${req.headers.host}/api/test/storefront/?shop=${session.shop}`;

    // https://test-store-2022-22.myshopify.com/admin/api/2022-10/script_tags.json
    // const response = await shopify.api.rest.ScriptTag.delete({ session, id: 192807862480 });

    // console.log("RESPOSEEE", response);

    // const response = await scriptCreator(session);


    if (getAllScripts.length === 0) {

      const response = await scriptCreator(session, hostName);
      // console.log("response", response);
      
    } else if (getAllScripts.length > 0) {

      const checkScript = getAllScripts.find(scrpt => scrpt.src.includes("api/test/storefront"));

      if (checkScript === undefined) {

        // console.log("UNDEFINEDDDD");
        const response = await scriptCreator(session, hostName);
        console.log("response", response);
      }
    }

    // console.log("DONE");

  });

  app.get("/api/sync/route", async (req, res) => {
    try {

      const session = res.locals.shopify.session;

      const fetchSettings = await MoodleSettings.find();

      const HOST_MD = fetchSettings[0].moodle_url;
      const ACCESSTOKEN_MD = fetchSettings[0].moodle_accessToken;

      const mdl_courses = await axios.get(`${HOST_MD}/${process.env.MD_WEBSERVICE}=${ACCESSTOKEN_MD}&wsfunction=${process.env.MD_METHOD_COURSE}&${process.env.MD_REST_FORMAT}=${process.env.MD_REST_VALUE}`);

      const mdl_categories = await axios.get(`${HOST_MD}/${process.env.MD_WEBSERVICE}=${ACCESSTOKEN_MD}&wsfunction=${process.env.MD_METHOD_CATEGORY}&${process.env.MD_REST_FORMAT}=${process.env.MD_REST_VALUE}`);

      const mdl_courses_w_categories = mdl_courses.data.map(mdl_course => ({
        ...mdl_course,
        category: mdl_categories.data.find(mdl_category => (mdl_category.id === mdl_course.categoryid)) ?? null
      }));

      for (let i = 0; i < mdl_courses_w_categories.length; i++) {
        await SyncCoursesFunction(mdl_courses_w_categories, session, i);
      };

      res.status(200).send({ 'success': mdl_courses_w_categories });
    } catch (error) {
      console.log("ERROR", error);
      res.status(500).send({ 'error': error })
    }

  });

  app.post("/api/settings/save", async (req, res) => {

    const session = res.locals.shopify.session;
  
    const checkSettings = await MoodleSettings.findOne({
      "shop": session.shop
    });
  
    if (checkSettings) {
  
      let oldvalues = { "shop": session.shop };
      let newvalues = { $set: { 'moodle_url': req.body.mdURL, 'moodle_accessToken': req.body.mdAccessToken, 'updated_at': new Date() }};
  
      await MoodleSettings.findOneAndUpdate(oldvalues, newvalues);
  
      console.log("Settings Updated!");
  
    } else {
  
      const md_settings = new MoodleSettings({
        _id: new mongoose.Types.ObjectId(),
        shop: session.shop,
        moodle_url: req.body.mdURL,
        moodle_accessToken: req.body.mdAccessToken,
        isValid: false,
        created_at: new Date(),
        updated_at: new Date()
      });
    
      await md_settings.save();
  
      console.log("Settings Saved!");
  
    }

    const fetchSettings = await MoodleSettings.find();

    const HOST_MD = fetchSettings[0].moodle_url;
    const ACCESSTOKEN_MD = fetchSettings[0].moodle_accessToken;

    try {

      const mdl_courses = await axios.get(`${HOST_MD}/${process.env.MD_WEBSERVICE}=${ACCESSTOKEN_MD}&wsfunction=${process.env.MD_METHOD_COURSE}&${process.env.MD_REST_FORMAT}=${process.env.MD_REST_VALUE}`);

      if (!mdl_courses.data?.errorcode) {

        let oldvalues = { "shop": session.shop };
        let newvalues = { $set: { isValid: true, 'updated_at': new Date() }};
    
        await MoodleSettings.findOneAndUpdate(oldvalues, newvalues);
    
        console.log("Settings Updated!");

        res.status(200).send({'status': 'success'});
      }

    } catch (error) {

      console.log("ERROR");

    } finally {

      if (res._headerSent === false) {
        let oldvalues = { "shop": session.shop };
        let newvalues = { $set: { isValid: false, 'updated_at': new Date() }};
    
        await MoodleSettings.findOneAndUpdate(oldvalues, newvalues);
  
        console.log("Settings Updated!");
        
        res.status(200).send({'status': 'failed'})
      }

    }
  
  });
};

function applyNonAuthPublicEndpoints(app) {

  app.get("/api/test/storefront", async (req, res) => {

    try {
      const htmlFile = join(
        `${process.cwd()}/`,
        "storefront.js"
      );

      return res
        .status(200)
        .set("Content-Type", "text/javascript")
        .send(readFileSync(htmlFile));
    } catch (error) {
      console.log("ERROR", error);
    }
  });

  app.use(express.json());

  app.post("/api/route/testing", async (req, res ) => {

    const customer_details = new CustomerData({
      _id: new mongoose.Types.ObjectId(),
      firstName: req.body.customerFirstName,
      lastName: req.body.customerLastName,
      email: req.body.customerEmail,
      password: req.body.customerPassword,
      created_at: new Date(),
      updated_at: new Date()
    });
  
    await customer_details.save();

    console.log("Information Saved!");

    res.status(200).send({ 'success': true });
  });

}

const SyncCoursesFunction = async (mdl_courses_w_categories, session, i) => {

  const checkShop = await SyncCourses.findOne({
    "course.id": mdl_courses_w_categories[i].id
  }).exec();

  if (checkShop) {

    let oldvalues = { "course.id": mdl_courses_w_categories[i].id };
    let newvalues = { $set: { 'course': mdl_courses_w_categories[i] } };

    await SyncCourses.findOneAndUpdate(oldvalues, newvalues);

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