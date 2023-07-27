import axios from "axios";

const axiosV1 = axios.create({
  baseURL: "https://cerulean-marlin-wig.cyclic.app",
});

export const getActivities = async () => {
    try {
        const response = await axiosV1("/activities")
        console.log("test axios", response.data)
        return response.data
    } catch(err) {

    }
}

console.log(getActivities());