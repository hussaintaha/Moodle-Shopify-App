import shopify from "../shopify.js";
import productCreator from "../product-creator.js";
import productUpdater from "../product-updater.js";
import SyncCourses from "../models/SyncCourses.js";
import MoodleSettings from "../models/MoodleSettings.js";

const applyAuthenticatedEndpoints = async (app) => {

    const fetchSettingsFunction = async () => {
        return await MoodleSettings.find();
    };

    app.get("/api/products/count", async (_req, res) => {
        const countData = await shopify.api.rest.Product.count({
            session: res.locals.shopify.session,
        });
        res.status(200).send(countData);
    });

    app.get("/api/data/get", async (req, res) => {

        const fetchSettings = await fetchSettingsFunction();

        res.status(200).send({ 'success': 'true', 'data': fetchSettings });
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

};

export default applyAuthenticatedEndpoints;