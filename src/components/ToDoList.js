import React, { useEffect, useState } from "react";
import moment from "moment";
import { nanoid } from "nanoid";
// import { Checkbox } from "@material-tailwind/react";

export const ToDoList = () => {
  const [taskValue, setTaskValue] = useState("");
  const [count, setCount] = useState(0);
  const [addOrEdit, setAddOrEdit] = useState("Add New Task");
  const [tempId, setTempId] = useState("");
  const [category, setCategory] = useState("");
  const [filter, setFilter] = useState("all");
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
      const task = {
        id: nanoid(),
        task: taskValue,
        category: !category ? "uncategorized" : category,
        displayedDate: moment().format("MMM Do"),
        date: moment().format("YYYY-MM-DD"),
        completed: false,
      };
      if (allTasks.length) {
        setAllTasks((prevTasks) => {
          localStorage.setItem(
            "allTodos",
            JSON.stringify([task, ...prevTasks])
          );
          return [task, ...prevTasks];
        });
      } else {
        setAllTasks(() => {
          localStorage.setItem("allTodos", JSON.stringify([task]));
          return [task];
        });
      }
    } else {
      allTasks.some((task, index) => {
        if (task.id === tempId) {
          document.getElementById("new-task").value = task.task;
          task.task = taskValue;
          if (category) {
            task.category = category;
          }
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
    setCategory("");
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
    if (window.confirm("Are you sure?")) {
      setAllTasks(() => {
        localStorage.removeItem("allTodos");
        return [];
      });
      setAddOrEdit("Add New Task");
      setCategory("");
      setFilter("all");
      setTaskValue("");
      document.getElementById("new-task").value = "";
    }
  };

  const handleEditTask = (taskId) => {
    allTasks.some((task) => {
      if (taskId === task.id) {
        document.getElementById("new-task").value = task.task;
        setTaskValue(task.task);
        setAddOrEdit("Done");
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

  const handleCategoryChange = (event) => {
    setCategory(event.target.value);
  };

  const handleFilterChange = (event) => {
    setFilter(event.target.value);
    setAddOrEdit("Add New Task");
    setCategory("");
    setTaskValue("");
    document.getElementById("new-task").value = "";
    document.getElementById("new-task").focus();
  };

  const buildTasks = () => {
    if (filter === "all") {
      return allTasks.map((obj) => (
        <div className="task" key={obj.id}>
          <div className="task-status">
            <input
              onChange={() => handleStatusChange(obj.id)}
              checked={obj.completed}
              type="checkbox"
            />
            {/* <Checkbox
                onChange={() => handleStatusChange(obj.id)}
                checked={obj.completed}
                ripple={true}
                className="h-8 w-8 rounded-full border-gray-900/20 bg-gray-900/10 transition-all hover:scale-105 hover:before:opacity-0"
              /> */}
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
            id="edit-task"
            onClick={() => handleEditTask(obj.id)}
            className="edit-delete-task"
          >
            Edit
          </button>
          <button
            onClick={() => handleDeleteTask(obj.id)}
            className="edit-delete-task"
          >
            Delete
          </button>
        </div>
      ));
    } else {
      const filteredTasks = allTasks.filter((obj) => obj.category === filter);
      return filteredTasks.length ? (
        filteredTasks.map((obj) => (
          <div className="task" key={obj.id}>
            <div className="task-status">
              <input
                onChange={() => handleStatusChange(obj.id)}
                checked={obj.completed}
                type="checkbox"
              />
              {/* <Checkbox
            onChange={() => handleStatusChange(obj.id)}
            checked={obj.completed}
            ripple={true}
            className="h-8 w-8 rounded-full border-gray-900/20 bg-gray-900/10 transition-all hover:scale-105 hover:before:opacity-0"
          /> */}
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
              id="edit-task"
              onClick={() => handleEditTask(obj.id)}
              className="edit-delete-task"
            >
              Edit
            </button>
            <button
              onClick={() => handleDeleteTask(obj.id)}
              className="edit-delete-task"
            >
              Delete
            </button>
          </div>
        ))
      ) : (
        <h5>No {filter} tasks!</h5>
      );
    }
  };

  return !allTasks.length ? (
    <div className="container">
      <form onSubmit={handleAddNewTask}>
        <div className="form-container">
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
          <div className="task-category">
            <select
              value={category}
              onChange={handleCategoryChange}
              name="choose-category"
              id="choose-category"
            >
              <option value="">--Choose Category--</option>
              <option value="home">Home</option>
              <option value="work">Work</option>
              <option value="casual">Casual</option>
            </select>
          </div>
        </div>
      </form>
      <h5>No pending tasks!</h5>
    </div>
  ) : (
    <div className="container">
      <form onSubmit={handleAddNewTask}>
        <div className="form-container">
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
          {addOrEdit === "Done" && (
            <button style={{ marginLeft: 0 }} onClick={handleCanceEdit}>
              Cancel
            </button>
          )}
          <div>
            <select
              value={category}
              onChange={handleCategoryChange}
              name="choose-category"
              id="choose-category"
            >
              <option value="">--Choose Category--</option>
              <option value="home">Home</option>
              <option value="work">Work</option>
              <option value="casual">Casual</option>
            </select>
          </div>
        </div>
      </form>
      <div className="tasks-display">
        <div className="clear-and-filter">
          <div className="task-category">
            <select
              value={filter}
              onChange={handleFilterChange}
              name="filter-category"
              id="filter-category"
            >
              <option value="all">All</option>
              <option value="home">Home</option>
              <option value="work">Work</option>
              <option value="casual">Casual</option>
              <option value="uncategorized">Uncategorized</option>
            </select>
          </div>
          {allTasks.length && (
            <button id="clear-list" onClick={handleClearList}>
              Clear List
            </button>
          )}
        </div>
        {buildTasks()}
      </div>
    </div>
  );
};
