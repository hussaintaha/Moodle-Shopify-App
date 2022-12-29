import axios from "axios";

const UserCreate = async(HOST_MD, ACCESSTOKEN_MD, firstName, lastName, email, password) => {

    const data = await axios.get(`${HOST_MD}/${process.env.MD_WEBSERVICE}=${ACCESSTOKEN_MD}&wsfunction=${process.env.MD_METHOD_CREATE_USERS}&${process.env.MD_REST_FORMAT}=${process.env.MD_REST_VALUE}&${process.env.MD_USERNAME_KEY}=${req.body.customerEmail}&${process.env.MD_FIRSTNAME_KEY}=${firstName}&${process.env.MD_LASTNAME_KEY}=${lastName}&${process.env.MD_EMAIL_KEY}=${email}&${process.env.MD_PASSWORD_KEY}=${password}&${process.env.MD_AUTH_KEY}=manual`);

    return data;
};

export default UserCreate;