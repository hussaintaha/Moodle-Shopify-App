import { join } from "path";
import { readFileSync } from "fs";
import express from "express";
import mongoose from "mongoose";
import ejs from 'ejs';
import CustomerData from "../models/CustomerData.js";
import UserFetch from "../moodleapi/UserFetch.js";
import UserCoursesFetch from "../moodleapi/UserCoursesFetch.js";
import MoodleSettings from "../models/MoodleSettings.js";
import ShopifySessions from "../models/ShopifySessions.js";
import shopify from "../shopify.js";
import md5 from "md5";
import axios from "axios";
import runner from "child_process";
import queryString from 'query-string';

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

            const randomNumber = Math.floor(Math.random() * 990) + 10
            const hash = md5(randomNumber);

            const redirection = 'https://moodle.newenergyacademy.com/my/courses.php';

            let details = new URLSearchParams({
                'moodle_user_id': mdl_user_id,
                'login_redirect': redirection,
                'wp_one_time_hash': hash
            });

            details = details.toString();
            const sso_secret_key = fetchSettings[0]?.moodle_secretKey;

            const phpString =
            `
                $token = '${details}';
                $enc_method    = 'AES-128-CTR';
                $enc_key       = openssl_digest(${sso_secret_key}, 'SHA256', true);
                $enc_iv        = openssl_random_pseudo_bytes(openssl_cipher_iv_length($enc_method));
                $crypted_token = openssl_encrypt($token, $enc_method, $enc_key, 0, $enc_iv) . "::" . bin2hex($enc_iv);
                $data = base64_encode($crypted_token);
                $data = str_replace(array('+', '/', '='), array('-', '_', ''), $data);
                $newdata = trim($data);

                echo $newdata;
            `
            runner.execFile('php', ['-r', phpString], function (err, phpResponse, stderr) {
                if (err) console.log('err', err);

                const wdm_data = phpResponse;

                axios.post('https://moodle.newenergyacademy.com/local/moodleshopify/login.php',
                    queryString.stringify({
                        wdm_data: wdm_data,
                        timeout: 100
                    }), {
                    headers: {
                        "Content-Type": "application/x-www-form-urlencoded"
                    }
                }).then(function (response) {

                    const final_url = `https://moodle.newenergyacademy.com/local/moodleshopify/login.php?login_id=${mdl_user_id}&veridy_code=${hash}&course_id=${mdl_course_id}`;
                    console.log("final_url", final_url);
                    res.redirect(final_url);
                });
            });
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

        const customer_details = new CustomerData({
            _id: new mongoose.Types.ObjectId(),
            firstName: firstName,
            lastName: lastName,
            email: email,
            created_at: new Date(),
            updated_at: new Date()
        });

        await customer_details.save();

        console.log("Information Saved!");

        res.status(200).send({ 'success': true });
    });

};

export default applyNonAuthPublicEndpoints;