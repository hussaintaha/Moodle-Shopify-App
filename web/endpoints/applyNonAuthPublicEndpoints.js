import { join } from "path";
import { readFileSync } from "fs";
import express from "express";
import mongoose from "mongoose";
import ejs from 'ejs';
import CustomerData from "../models/CustomerData.js";
import UserFetch from "../moodleapi/UserFetch.js";
import UserCreate from "../moodleapi/UserCreate.js";
import UserCoursesFetch from "../moodleapi/UserCoursesFetch.js";
import MoodleSettings from "../models/MoodleSettings.js";
import ShopifySessions from "../models/ShopifySessions.js";
import shopify from "../shopify.js";
import md5 from "md5";

const applyNonAuthPublicEndpoints = async (app) => {

    const fetchSettingsFunction = async () => {
        return await MoodleSettings.find();
    };

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

    app.get("/pages/my-courses-old", async (req, res) => {

        try {
            const liquidFile = join(
                `${process.cwd()}/storefront/pages/`,
                "mycourses.liquid"
            )

            const liquidFileContents = readFileSync(liquidFile)

            return res
                .status(200)
                .set("Content-Type", "application/liquid")
                .send(liquidFileContents)
        } catch (error) {
            console.log("ERROR", error);
        }
    });

    app.get("/pages/my-courses", async (req, res) => {

        try {
            const ejsFile = join(
                `${process.cwd()}/storefront/pages/`,
                "mycourses.ejs"
            )

            // console.log('ejsFile', ejsFile);

            ejs.renderFile(ejsFile, {}, {}, function (err, str) {

                // console.log('str', str);
                // console.log('err', err);


                return res
                    .status(200)
                    .set("Content-Type", "application/liquid")
                    .send(str)

            })
        } catch (error) {
            console.log("my-courses ERROR", error);
        }
    });

    app.get("/api/storefront/mdl_course_id", async (req, res) => {
      try {

        const fetchSettings = await fetchSettingsFunction();
        const HOST_MD = fetchSettings[0]?.moodle_url;
        const ACCESSTOKEN_MD = fetchSettings[0]?.moodle_accessToken;

        const { logged_in_customer_id, shop, mdl_course_id } = req.query

        if (!logged_in_customer_id) {
          // redirect to login
          const login_url = `https://${shop}/account/login?return_url=/apps/moodle-app/pages/my-courses`
          res.redirect(login_url);
        }

        const session = await ShopifySessions.findOne({
          shop: shop
        });

        const loggedInUser = await shopify.api.rest.Customer.find({ session, id: logged_in_customer_id });

        const mdl_users = await UserFetch(HOST_MD, ACCESSTOKEN_MD, loggedInUser.email);
        const mdl_user_id = mdl_users.data[0].id;

        const randomNumber = Math.floor(Math.random()*990) + 10
        const hash = md5(randomNumber);

        const redirection = 'https://moodle.newenergyacademy.com/my/courses.php';

        let details =  new URLSearchParams({
          'moodle_user_id'    : mdl_user_id,
          'login_redirect'    : redirection,
          'wp_one_time_hash'  : hash
        });

        details = details.toString();

        console.log("DETAILS", details);

        // https://moodle.newenergyacademy.com/local/moodleshopify/login.php?login_id=7&mdl_course_id=2
        res.redirect(`https://moodle.newenergyacademy.com/local/moodleshopify/login.php?login_id=${mdl_user_id}&mdl_course_id=${mdl_course_id}`)


        // $query = array(
        //     'moodle_user_id'   => $moodle_user_id,
        //     'login_redirect'   => $redirection->getLoginRedirectUrl( $user, $default_redirect, $ignore_setting_redirect_url ),
        //     'wp_one_time_hash' => $hash
        // );
        //
        // // Send post data.
        // $details        = http_build_query($query);
        // $eb_moodle_url  = eb_get_mdl_url();
        // $sso_secret_key = eb_get_mdl_token();
        // $wdm_data       = encryptString( $details, $sso_secret_key );

        // let final_url = $eb_moodle_url . '/auth/wdmwpmoodle/login.php?login_id=' . $moodle_user_id . '&veridy_code=' . $hash;
        // let final_url = `https://moodle.newenergyacademy.com/local/moodleshopify/login.php`;

        // res.redirect(final_url);


      } catch (error) {
        console.log('error', error);
      }
    })

    app.use(express.json());

    app.post("/api/fetch/courses", async (req, res) => {

        const fetchSettings = await fetchSettingsFunction();
        const HOST_MD = fetchSettings[0]?.moodle_url;
        const ACCESSTOKEN_MD = fetchSettings[0]?.moodle_accessToken;

        try {

            const ejsFile = join(
                `${process.cwd()}/storefront/pages/parts/`,
                "grid_items.ejs"
            )


            const email = req.body.customerEmail;

            const mdl_users = await UserFetch(HOST_MD, ACCESSTOKEN_MD, email);

            const moodle_user_id = mdl_users.data[0].id;

            const mdl_fetch_user_courses = await UserCoursesFetch(HOST_MD, ACCESSTOKEN_MD, moodle_user_id);

            const courses = mdl_fetch_user_courses.data;

            const data = {
                courses: courses
            }



            ejs.renderFile(ejsFile, data, {}, function (err, str) {

                // console.log('str', str);

                return res
                    .status(200)
                    .set("Content-Type", "text/html")
                    .send(str)

            })


        } catch (error) {
            res.status(500).send({ status: 'failed' });
        }

    });

    app.post("/api/route/testing", async (req, res) => {

        const fetchSettings = await fetchSettingsFunction();
        const HOST_MD = fetchSettings[0]?.moodle_url;
        const ACCESSTOKEN_MD = fetchSettings[0]?.moodle_accessToken;

        let firstName = req.body.customerFirstName;
        let lastName = req.body.customerLastName;
        let email = req.body.customerEmail;
        let password = req.body.customerPassword;

        const customer_details = new CustomerData({
            _id: new mongoose.Types.ObjectId(),
            firstName: firstName,
            lastName: lastName,
            email: email,
            password: password,
            created_at: new Date(),
            updated_at: new Date()
        });

        await customer_details.save();

        console.log("Information Saved!");

        const mdl_users = await UserFetch(HOST_MD, ACCESSTOKEN_MD, email);


        if (mdl_users.data.length === 0) {

            const mdl_create_user = await UserCreate(HOST_MD, ACCESSTOKEN_MD, firstName, lastName, email, password);

        }

        res.status(200).send({ 'success': true });
    });



};

export default applyNonAuthPublicEndpoints;