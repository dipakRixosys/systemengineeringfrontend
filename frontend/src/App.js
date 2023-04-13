import { useHistory } from "react-router-dom";
import Loader from "./components/ui/loader/lds-roller";

function App() {
  document.title = `Loading...`;

  // Goto Login Page
  const history = useHistory();
  history.push("/login");

  return (
    <div className="App">
      <Loader />
      App is loading...
    </div>
  );
}

export default App;

// Developed at Ethereal Corporate Network.