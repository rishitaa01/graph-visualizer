
import React, { useEffect, useRef, useState } from "react";
import cytoscape from "cytoscape";
import "./App.css";

export default function App() {
  const cyRef = useRef(null);
  const containerRef = useRef(null);
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [nextNodeId, setNextNodeId] = useState(0);
  const [logText, setLogText] = useState("");
  const [startNode, setStartNode] = useState(0);
  const [edgeInputs, setEdgeInputs] = useState({ u: "", v: "", w: "1" });

  useEffect(() => {
    if (!containerRef.current) return;
    const cy = cytoscape({
      container: containerRef.current,
      elements: [],
      style: [
        { selector: "node", style: { label: "data(label)", "text-valign": "center", "text-halign": "center", "background-color": "#3b82f6", width: 40, height: 40, color: "white" } },
        { selector: "edge[undirected = true]", style: { "target-arrow-shape": "none", "source-arrow-shape": "none", "curve-style": "bezier", "line-color": "#9ca3af" } },
        { selector: ".visited", style: { "background-color": "#f97316" } },
        { selector: ".frontier", style: { "background-color": "#fde68a" } }
      ],
      layout: { name: "grid" },
    });
    cyRef.current = cy;
    return () => cy.destroy();
  }, []);

  useEffect(() => {
    const cy = cyRef.current;
    if (!cy) return;
    cy.elements().remove();
    nodes.forEach((n) => cy.add({ group: "nodes", data: { id: n.id, label: n.label } }));
    edges.forEach((e) => cy.add({ group: "edges", data: { id: e.id, source: e.source, target: e.target, weight: e.weight } }));
    cy.layout({ name: "cose" }).run();
  }, [nodes, edges]);

  function addNode() {
    const id = String(nextNodeId);
    setNodes((s) => [...s, { id, label: id }]);
    setNextNodeId((x) => x + 1);
  }

  function addEdge() {
    const u = edgeInputs.u, v = edgeInputs.v, w = edgeInputs.w;
    if (!nodes.some((n) => n.id === u) || !nodes.some((n) => n.id === v)) { alert("Both nodes must exist"); return; }
    setEdges((s) => [...s,{ id: `e${s.length}`,source: u, target: v, weight: w,undirected: true}]);
    setEdgeInputs({ u: "", v: "", w: "1" });
  }

  function animateOrder(order) {
    const cy = cyRef.current; if (!cy) return;
    cy.elements().removeClass("visited frontier");
    let i = 0;
    function step() {
      if (i >= order.length) return;
      if (i > 0) cy.getElementById(order[i-1]).removeClass("frontier").addClass("visited");
      cy.getElementById(order[i]).addClass("frontier");
      i++; setTimeout(step, 450);
    }
    step();
  }

  function runDFS(start) {
    const adj = {}; nodes.forEach(n=>adj[n.id]=[]); edges.forEach(e=>{ adj[e.source].push(e.target); adj[e.target].push(e.source); });
    const visited = {}, order = [];
    (function dfs(u){ visited[u]=true; order.push(u); (adj[u]||[]).forEach(v=>{ if(!visited[v]) dfs(v); }); })(String(start));
    animateOrder(order); setLogText("DFS: "+order.join(" -> "));
  }

  function runBFS(start) {
    const adj = {}; nodes.forEach(n=>adj[n.id]=[]); edges.forEach(e=>{ adj[e.source].push(e.target); adj[e.target].push(e.source); });
    const q=[String(start)], visited={ [String(start)]: true}, order=[];
    while(q.length){ const u=q.shift(); order.push(u); (adj[u]||[]).forEach(v=>{ if(!visited[v]){ visited[v]=true; q.push(v); } }); }
    animateOrder(order); setLogText("BFS: "+order.join(" -> "));
  }

  return (
    <div className="app">
      <h1>Graph Algorithms Visualization</h1>
      <div className="container">
        <div className="left">
          <div ref={containerRef} className="cy"></div>
          <div style={{ marginTop: 8 }}>
            <button onClick={addNode} className="btn">Add Node</button>
          </div>
          <div className="edge-box" style={{ marginTop: 10 }}>
            <input placeholder="u" value={edgeInputs.u} onChange={(e) => setEdgeInputs((s) => ({ ...s, u: e.target.value }))} />
            <input placeholder="v" value={edgeInputs.v} onChange={(e) => setEdgeInputs((s) => ({ ...s, v: e.target.value }))} />
            <input placeholder="weight" value={edgeInputs.w} onChange={(e) => setEdgeInputs((s) => ({ ...s, w: e.target.value }))} />
            <button onClick={addEdge} className="btn small">Add Edge</button>
          </div>
          <div className="algo-row" style={{ marginTop: 8 }}>
            <input type="number" value={startNode} onChange={(e) => setStartNode(e.target.value)} />
            <button onClick={() => runDFS(startNode)} className="btn small">DFS</button>
            <button onClick={() => runBFS(startNode)} className="btn small">BFS</button>
          </div>
        </div>
        <div className="right">
          <h3>Output</h3>
          <pre className="log">{logText || "No output yet"}</pre>
        </div>
      </div>
    </div>
  );
}

