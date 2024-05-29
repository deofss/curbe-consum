import "./App.css";
import { Provider } from "react-redux";
import { store } from "@/store";

import { Helmet } from "react-helmet";

import ExcelDisplay from "./core/excel-display";
function App() {
  return (
    <Provider store={store}>
      <>
        <Helmet>
          <title>DEO</title>
        </Helmet>
        <div className="w-full  p-md flex justify-center">
          <ExcelDisplay />
        </div>
      </>
    </Provider>
  );
}

export default App;
