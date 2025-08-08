import axios from "axios";
import { Backend_Root_Url } from "../../../config/AdminUrl.json";

export async function verifyJWTToken() {
  try {
    const response = await axios.get(`${Backend_Root_Url}/api/verify/jwt`, {
      withCredentials: true,
    });

    if (response.data.access === true) {
      console.log("Valid Token - Access Granted");
      return true;
    } else {
      console.log("401 unauthorized");
      return false;
    }
  } catch (err) {
    if (err.response?.status === 401) {
      console.log("401 unauthorized");
      return false;
    } else {
      console.log("err - network or server error");
      return false;
    }
  }
}
export function logout() {}
