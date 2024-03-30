import React from "react";
import "./App.css";
import { ToDoList } from "./components/ToDoList";

function App() {
  return (
    <div className="app">
      <h1 className="heading">
        Welcome to <span className="app-name">Tasklear</span>
      </h1>
      <p className="sub-heading">Manage your tasks on the go!</p>
      <ToDoList />
    </div>
  );
}

export default App;
