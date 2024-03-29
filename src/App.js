import React from "react";
import "./App.css";
import { ToDoList } from "./components/ToDoList";

function App() {
  return (
    <div style={{ marginTop: "50px" }}>
      <h1 style={{fontFamily: "fantasy"}}>
        Welcome to <span style={{ color: "#4f5ce3" }}>Tasklear</span>
      </h1>
      <p style={{ paddingBottom: "20px", fontWeight: "bold" }}>Manage your tasks on the go!</p>
      <ToDoList />
    </div>
  );
}

export default App;
