import { Navbar } from "./components/Navbar";
import { Todolist } from "./components/Todolist";

function App() {

  return (
    <div className="h-svh flex flex-col">
      <Navbar />
      <Todolist />
    </div>
  );
}

export default App;
