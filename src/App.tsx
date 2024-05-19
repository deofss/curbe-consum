import "./App.css";
import { useState } from "react";

import { Helmet } from "react-helmet";

import ExcelDisplay from "./core/excel-display";
function App() {
  return (
    <>
      <Helmet>
        <title>DEO</title>
      </Helmet>
      <div className="w-full  p-md flex justify-center">
        {/* <button disabled={isLoading} onClick={handleDownload}>
          {isLoading ? "Loading" : "Download"}
        </button> */}
        <ExcelDisplay />
      </div>
    </>
  );
}

export default App;
