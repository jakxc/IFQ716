import logo from "./logo.svg";
import "./App.css";
import { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/preflight" element={<Preflight />} />
      </Routes>
    </Router>
  );
}

function Preflight() {
  const [cats, setCats] = useState("");
  useEffect(() => {
    (async () => {
      const res = await fetch("http://localhost:3000/delete", {
        method: "DELETE",
      });
      const data = await res.text();

      setCats(data);
    })();
  });
  return <div className="App">{cats}</div>;
}

function Home() {
  const [cats, setCats] = useState([]);
  useEffect(() => {
    (async () => {
      const res = await fetch("http://localhost:3000/data");
      const data = await res.json();

      setCats(data);
    })();
  });
  return (
    <div className="App">
      {cats.map((cat) => (
        <div>{cat}</div>
      ))}
    </div>
  );
}

export default App;
