// src/App.js
import React, { useState } from "react";
import "./App.css";
import GraphVisualization from "./GraphVisualization";
import EndpointSelector from "./EndpointSelector";

function App() {
  const [endpoint, setEndpoint] = useState("baseSepolia");

  return (
    <div className="App">
      <header className="App-header">
        <h1>0xIntuition Graph</h1>
      </header>
      <main className="App-main">
        <EndpointSelector
          currentEndpoint={endpoint}
          onEndpointChange={setEndpoint}
        />
        <GraphVisualization endpoint={endpoint} />
      </main>
    </div>
  );
}

export default App;
