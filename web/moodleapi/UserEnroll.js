import axios from "axios";

const UserEnroll = async(HOST_MD, ACCESSTOKEN_MD, enroll_mdl_user_id, enroll_mdl_course_id) => {

    const data = await axios.get(`${HOST_MD}/${process.env.MD_WEBSERVICE}=${ACCESSTOKEN_MD}&wsfunction=${process.env.MD_METHOD_ENROLL_USERS}&${process.env.MD_ENROLL_ROLE_ID}=5&${process.env.MD_ENROLL_USER_ID}=${enroll_mdl_user_id}&${process.env.MD_ENROLL_COURSE_ID}=${enroll_mdl_course_id}&${process.env.MD_REST_FORMAT}=${process.env.MD_REST_VALUE}`);

    return data;
};

export default UserEnroll;