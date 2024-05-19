import "./App.css";

import { Helmet } from "react-helmet";

import ExcelDisplay from "./core/excel-display";
function App() {
  return (
    <>
      <Helmet>
        <title>DEO</title>
      </Helmet>
      <div className="w-full  p-md flex justify-center">
        <ExcelDisplay />
      </div>
    </>
  );
}

export default App;
