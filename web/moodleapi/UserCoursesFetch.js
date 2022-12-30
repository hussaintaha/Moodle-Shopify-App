import axios from "axios";

const UserCoursesFetch = async(HOST_MD, ACCESSTOKEN_MD, moodle_user_id) => {

    const data = await axios.get(`${HOST_MD}/${process.env.MD_WEBSERVICE}=${ACCESSTOKEN_MD}&wsfunction=${process.env.MD_METHOD_GET_USER_COURSES}&${process.env.MD_USERID_KEY}=${moodle_user_id}&${process.env.MD_REST_FORMAT}=${process.env.MD_REST_VALUE}`);


    // # https://moodle.newenergyacademy.com/webservice/rest/server.php?wstoken=5a95911138dd26d0df270d04ccb0be51&wsfunction=core_enrol_get_users_courses&userid=8&moodlewsrestformat=json

    return data;
};

export default UserCoursesFetch;