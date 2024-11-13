// src/App.js
import React from "react";
import "./App.css";
import GraphVisualization from "./GraphVisualization";

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>Intuition Knowledge Graph</h1>
      </header>
      <main className="App-main">
        <GraphVisualization />
      </main>
    </div>
  );
}

export default App;
