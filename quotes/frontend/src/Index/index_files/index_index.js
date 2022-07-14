import React from "react";
import App from "../Index";
import ReactDOM from "react-dom/client";


const wrapper =  ReactDOM.createRoot(document.getElementById("app_script"));

wrapper ? wrapper.render(<App />) : null;