import React, { useEffect } from "react";
import { useDispatch } from "react-redux";
import Fetcher from "../utilities/fetcher";
import port from "../port";

export default function Index() {
  const dispatch = useDispatch();

  async function initializedState() {
    let initialState = {};

    let opts = await Fetcher(`${port}/api/v1/system-options/public`);
    if (!opts || typeof opts !== "object") {
      console.error("Expected JSON for system options, got:", opts);
      opts = {};
    }
    initialState.options = opts;

    const userResp = await Fetcher(`${port}/api/v1/users/own`);
    initialState.user = Array.isArray(userResp) ? userResp[0] : null;
    const notesResp = await Fetcher(`${port}/api/v1/notifications/own`);
    initialState.notifications = Array.isArray(notesResp) ? notesResp : [];

    dispatch({ type: "INITIALIZE", initialState });
  }

  useEffect(() => {
    initializedState();
  }, []);

  return <div>Welcome to the app</div>;
}
