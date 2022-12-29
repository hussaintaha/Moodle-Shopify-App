import axios from "axios";

const CategoryFetch = async(HOST_MD, ACCESSTOKEN_MD) => {

    const data = await axios.get(`${HOST_MD}/${process.env.MD_WEBSERVICE}=${ACCESSTOKEN_MD}&wsfunction=${process.env.MD_METHOD_CATEGORY}&${process.env.MD_REST_FORMAT}=${process.env.MD_REST_VALUE}`);

    return data;

};

export default CategoryFetch;