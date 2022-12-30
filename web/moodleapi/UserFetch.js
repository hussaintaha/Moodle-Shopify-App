import axios from "axios";

const UserFetch = async(HOST_MD, ACCESSTOKEN_MD, email) => {

    const data = await axios.get(`${HOST_MD}/${process.env.MD_WEBSERVICE}=${ACCESSTOKEN_MD}&wsfunction=${process.env.MD_METHOD_GET_USERS}&field=email&values[0]=${email}&${process.env.MD_REST_FORMAT}=${process.env.MD_REST_VALUE}`);

    return data;
};

export default UserFetch;