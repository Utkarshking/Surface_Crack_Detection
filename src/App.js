import './App.css';
import Header from "./Components/Header"
import Background from "./Components/Background"
import DragandDrop from './Components/DragandDrop';
function App() {
  return (
    <div className="App">
      <Background />
      <Header />
      <DragandDrop />
    </div>
  );
}

export default App;
