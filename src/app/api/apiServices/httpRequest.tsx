import axios from "axios"

// Using to call fetch API in client side code

// Custom fetch GET method using axios
export const get = async (apiPath: string, option = {}) => {
  const res = await axios.get(apiPath, option)
  return res.data
}

// Cusom fetch POST method using axios
export const post = async (apiPath: string, option = {}) => { }
