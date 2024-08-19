import apiRequest from "./apiRequest";
import { defer } from "react-router-dom";

export const SinglePageLoader = async ({ request, params }) => {
  const res = await apiRequest("/posts/" + params.id);
  // console.log(res.data);
  return res.data;
};

export const listPageLoader = async ({ request, params }) => {
  const query = request.url.split("?")[1];
  const postPromise = apiRequest("/posts?" + query);

  return defer({
    postResponse: postPromise,
  });
};
export const ProfilePageLoader = async () => {
  const postPromise = apiRequest("/users/profilePosts");
  const chatPromise = apiRequest("/chats");
  return defer({
    postResponse: postPromise,
    chatResponse: chatPromise,
  });
};
