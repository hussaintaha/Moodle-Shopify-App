import mongoose from "mongoose";
import shopify from "../shopify.js";
import scriptCreator from "../scripttag-create.js";
import SyncCourses from "../models/SyncCourses.js";
import MoodleSettings from "../models/MoodleSettings.js";
import CourseFetch from "../moodleapi/CourseFetch.js";
import CategoryFetch from "../moodleapi/CategoryFetch.js";

const applyPublicEndpoints = async (app) => {

    const fetchSettingsFunction = async () => {
        return await MoodleSettings.find();
    };

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

    app.get("/api/testing/route", async (req, res) => {

        try {

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


        if (getAllScripts.length === 0) {

            const response = await scriptCreator(session, hostName);

            console.log("Script Added!");

        } else if (getAllScripts.length > 0) {

            const checkScript = getAllScripts.find(scrpt => scrpt.src.includes("api/test/storefront"));

            if (checkScript === undefined) {

                const response = await scriptCreator(session, hostName);

                console.log("Script Added!");
            }
        }

    });

    app.get("/api/sync/route", async (req, res) => {
        try {

            const session = res.locals.shopify.session;

            const fetchSettings = await fetchSettingsFunction();
            const HOST_MD = fetchSettings[0]?.moodle_url;
            const ACCESSTOKEN_MD = fetchSettings[0]?.moodle_accessToken;

            const mdl_courses = await CourseFetch(HOST_MD, ACCESSTOKEN_MD);
            const mdl_categories = await CategoryFetch(HOST_MD, ACCESSTOKEN_MD);

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
        const fetchSettings = await fetchSettingsFunction();
        const HOST_MD = fetchSettings[0]?.moodle_url;
        const ACCESSTOKEN_MD = fetchSettings[0]?.moodle_accessToken;

        const checkSettings = await MoodleSettings.findOne({
            "shop": session.shop
        });

        if (checkSettings) {

            let oldvalues = { "shop": session.shop };
            let newvalues = { $set: { 'moodle_url': req.body.mdURL, 'moodle_accessToken': req.body.mdAccessToken, 'moodle_secretKey': req.body.mdSecretKey, 'updated_at': new Date() } };

            await MoodleSettings.findOneAndUpdate(oldvalues, newvalues);

            console.log("Settings Updated!");

        } else {

            const md_settings = new MoodleSettings({
                _id: new mongoose.Types.ObjectId(),
                shop: session.shop,
                moodle_url: req.body.mdURL ?? null,
                moodle_accessToken: req.body.mdAccessToken ?? null,
                moodle_secretKey: req.body.mdSecretKey ?? null,
                isValid: false,
                created_at: new Date(),
                updated_at: new Date()
            });

            await md_settings.save();

            console.log("Settings Saved!");

        }

        try {

            const mdl_courses = await CourseFetch(req.body.mdURL, req.body.mdAccessToken);



            if (!mdl_courses.data?.errorcode) {

                let oldvalues = { "shop": session.shop };
                let newvalues = { $set: { isValid: true, 'updated_at': new Date() } };

                await MoodleSettings.findOneAndUpdate(oldvalues, newvalues);

                console.log("Valid Credentials!");

                res.status(200).send({ 'status': 'success' });
            }

        } catch (error) {

            console.log("ERROR");

        } finally {

            if (res._headerSent === false) {
                let oldvalues = { "shop": session.shop };
                let newvalues = { $set: { isValid: false, 'updated_at': new Date() } };

                await MoodleSettings.findOneAndUpdate(oldvalues, newvalues);

                console.log("Invalid Credentials!");

                res.status(200).send({ 'status': 'failed' })
            }

        }

    });
};

export default applyPublicEndpoints;