import axios from "axios";

const UserEnroll = async(HOST_MD, ACCESSTOKEN_MD, enroll_mdl_user_id, enroll_mdl_course_id) => {

    const currentDate = new Date();
    const oneYearFromNow = new Date(currentDate.getTime() + 365 * 24 * 60 * 60 * 1000);

    // console.log("currentDate", Math.round(currentDate / 1000), Math.round(oneYearFromNow / 1000));

    const data = await axios.get(`${HOST_MD}/${process.env.MD_WEBSERVICE}=${ACCESSTOKEN_MD}&wsfunction=${process.env.MD_METHOD_ENROLL_USERS}&${process.env.MD_ENROLL_ROLE_ID}=5&${process.env.MD_ENROLL_USER_ID}=${enroll_mdl_user_id}&${process.env.MD_ENROLL_COURSE_ID}=${enroll_mdl_course_id}&enrolments[0][timestart]=${Math.round(currentDate / 1000)}&enrolments[0][timeend]=${Math.round(oneYearFromNow / 1000)}&${process.env.MD_REST_FORMAT}=${process.env.MD_REST_VALUE}`);

    return data;
};

export default UserEnroll;

// import axios from "axios";

// const UserEnroll = async(HOST_MD, ACCESSTOKEN_MD, enroll_mdl_user_id, enroll_mdl_course_id) => {
//     const now = new Date();
//     const oneYearFromNow = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000);

//     const data = await axios.get(`${HOST_MD}/${process.env.MD_WEBSERVICE}=${ACCESSTOKEN_MD}&wsfunction=${process.env.MD_METHOD_ENROLL_USERS}&${process.env.MD_ENROLL_ROLE_ID}=5&${process.env.MD_ENROLL_USER_ID}=${enroll_mdl_user_id}&${process.env.MD_ENROLL_COURSE_ID}=${enroll_mdl_course_id}&${process.env.MD_ENROLL_START_DATE}=${now.toISOString()}&${process.env.MD_ENROLL_END_DATE}=${oneYearFromNow.toISOString()}&${process.env.MD_REST_FORMAT}=${process.env.MD_REST_VALUE}`);

//     return data;
// };

// export default UserEnroll;

// import axios from "axios";

// const UserEnroll = async (HOST_MD, ACCESSTOKEN_MD, enroll_mdl_user_id, enroll_mdl_course_id) => {
//     const now = new Date();
//     const oneYearFromNow = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000);

//     const data = await axios.post(`${HOST_MD}/webservice/rest/server.php`, {
//         wsfunction: process.env.MD_METHOD_ENROLL_USERS,
//         moodlewsrestformat: process.env.MD_REST_VALUE,
//         enrolments: [
//             {
//                 roleid: 5,
//                 userid: enroll_mdl_user_id,
//                 courseid: enroll_mdl_course_id,
//                 timestart: now.getTime() / 1000,
//                 timeend: oneYearFromNow.getTime() / 1000
//             }
//         ]
//     }, {
//         params: {
//             wstoken: ACCESSTOKEN_MD,
//             moodlewsrestformat: process.env.MD_REST_VALUE
//         }
//     });

//     return data;
// };

// export default UserEnroll;