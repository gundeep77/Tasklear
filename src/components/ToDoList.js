import React, { useEffect, useState } from "react";
import moment from "moment";
import { nanoid } from "nanoid";

export const ToDoList = () => {
  const [taskValue, setTaskValue] = useState("");
  const [count, setCount] = useState(0);
  const [addOrEdit, setAddOrEdit] = useState("Add New Task");
  const [tempId, setTempId] = useState("");
  const [allTasks, setAllTasks] = useState(
    localStorage.getItem("allTodos") !== null
      ? JSON.parse(localStorage.getItem("allTodos")).sort(
          (a, b) =>
            new moment(b.date).format("YYYYMMDD") -
            new moment(a.date).format("YYYYMMDD")
        )
      : []
  );
  useEffect(() => {
    setAllTasks(
      localStorage.getItem("allTodos") !== null
        ? JSON.parse(localStorage.getItem("allTodos")).sort(
            (a, b) =>
              new moment(b.date).format("YYYYMMDD") -
              new moment(a.date).format("YYYYMMDD")
          )
        : []
    );
  }, [count]);
  const handleTaskValueChange = (event) => {
    if (event.target.value.trim().length) {
      setTaskValue(event.target.value.trim());
    } else {
      setTaskValue("");
    }
  };

  const handleAddNewTask = (event) => {
    event.preventDefault();
    if (!taskValue) {
      setTaskValue("");
      document.getElementById("new-task").value = "";
      document.getElementById("new-task").focus();
      return;
    }
    if (addOrEdit === "Add New Task") {
      if (allTasks.length) {
        setAllTasks((prevTasks) => {
          localStorage.setItem(
            "allTodos",
            JSON.stringify([
              {
                id: nanoid(),
                task: taskValue,
                displayedDate: moment().format("MMM Do"),
                date: moment().format("YYYY-MM-DD"),
                completed: false,
              },
              ...prevTasks,
            ])
          );
          return [
            {
              id: nanoid(),
              task: taskValue,
              displayedDate: moment().format("MMM Do"),
              date: moment().format("YYYY-MM-DD"),
              completed: false,
            },
            ...prevTasks,
          ];
        });
      } else {
        setAllTasks(() => {
          localStorage.setItem(
            "allTodos",
            JSON.stringify([
              {
                id: nanoid(),
                task: taskValue,
                displayedDate: moment().format("MMM Do"),
                date: moment().format("YYYY-MM-DD"),
                completed: false,
              },
            ])
          );
          return [
            {
              id: nanoid(),
              task: taskValue,
              displayedDate: moment().format("MMM Do"),
              date: moment().format("YYYY-MM-DD"),
              completed: false,
            },
          ];
        });
      }
    } else {
      allTasks.some((task, index) => {
        if (task.id === tempId) {
          document.getElementById("new-task").value = task.task;
          task.task = taskValue;
          const updatedTask = task;
          setAllTasks((prevTasks) => {
            prevTasks.splice(index, 1, updatedTask);
            localStorage.setItem("allTodos", JSON.stringify(prevTasks));
            return prevTasks;
          });
          setCount((prevCount) => prevCount + 1);
          return true;
        }
        return false;
      });
    }
    setAddOrEdit("Add New Task");
    setTaskValue("");
    document.getElementById("new-task").value = "";
  };

  const handleStatusChange = (taskId) => {
    allTasks.some((task, index) => {
      if (taskId === task.id) {
        task.completed = !task.completed;
        const updatedTask = task;
        setAllTasks((prevTasks) => {
          prevTasks.splice(index, 1, updatedTask);
          localStorage.setItem("allTodos", JSON.stringify(prevTasks));
          return prevTasks;
        });
        setCount((prevCount) => prevCount + 1);
        return true;
      }
      return false;
    });
  };

  const handleClearList = () => {
    setAllTasks(() => {
      localStorage.removeItem("allTodos");
      return [];
    });
    setAddOrEdit("Add New Task");
    setTaskValue("");
    document.getElementById("new-task").value = "";
  };

  const handleEditTask = (taskId) => {
    allTasks.some((task) => {
      if (taskId === task.id) {
        document.getElementById("new-task").value = task.task;
        setTaskValue(task.task);
        setAddOrEdit("Edit Task");
        setTempId(taskId);
        return true;
      }
      return false;
    });
    document.getElementById("new-task").focus();
  };

  const handleDeleteTask = (taskId) => {
    setAllTasks((prevTasks) => {
      const updatedAllTasks = prevTasks.filter((task) => task.id !== taskId);
      localStorage.setItem("allTodos", JSON.stringify(updatedAllTasks));
      return updatedAllTasks;
    });
    setCount((prevCount) => prevCount + 1);
    setAddOrEdit("Add New Task");
    document.getElementById("new-task").focus();
  };

  const handleCanceEdit = () => {
    setAddOrEdit("Add New Task");
    setTaskValue("");
    document.getElementById("new-task").value = "";
    document.getElementById("new-task").focus();
  };

  return !allTasks.length ? (
    <form onSubmit={handleAddNewTask}>
      <input
        autoComplete="off"
        autoFocus={true}
        onChange={handleTaskValueChange}
        id="new-task"
        placeholder={
          addOrEdit === "Add New Task"
            ? "Enter new task..."
            : "Edit Your Task..."
        }
        type="text"
      />

      <button id="add-task" type="submit">
        {addOrEdit}
      </button>
      {addOrEdit === "Edit Task" && (
        <button style={{ marginLeft: 0 }} onClick={handleCanceEdit}>
          Cancel Edit
        </button>
      )}
      <h5>No pending tasks!</h5>
    </form>
  ) : (
    <div>
      <form onSubmit={handleAddNewTask}>
        <input
          autoComplete="off"
          autoFocus={true}
          onChange={handleTaskValueChange}
          id="new-task"
          placeholder={
            addOrEdit === "Add New Task"
              ? "Enter new task..."
              : "Edit Your Task..."
          }
          type="text"
        />
        <button id="add-task" type="submit">
          {addOrEdit}
        </button>
        {addOrEdit === "Edit Task" && (
          <button style={{ marginLeft: 0 }} onClick={handleCanceEdit}>
            Cancel Edit
          </button>
        )}
      </form>
      {allTasks.length && <button onClick={handleClearList}>Clear List</button>}
      <div className="tasks-display">
        {allTasks.map((obj) => (
          <div className="task" key={obj.id}>
            <div className="task-status">
              <input
                onChange={() => handleStatusChange(obj.id)}
                checked={obj.completed}
                type="checkbox"
              />
            </div>
            {obj.completed ? (
              <s>
                <div className="task-content">{obj.task}</div>
              </s>
            ) : (
              <div className="task-content">{obj.task}</div>
            )}
            <div className="task-date">{obj.displayedDate}</div>
            <button
              onClick={() => handleEditTask(obj.id)}
              className="edit-delete-task"
            >
              Edit Task
            </button>
            <button
              onClick={() => handleDeleteTask(obj.id)}
              className="edit-delete-task"
            >
              Delete Task
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
