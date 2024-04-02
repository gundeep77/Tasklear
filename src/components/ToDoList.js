import React, { useEffect, useRef, useState } from "react";
import moment from "moment";
import { nanoid } from "nanoid";

export const ToDoList = () => {
  const [taskValue, setTaskValue] = useState("");
  const [count, setCount] = useState(0);
  const [addOrEdit, setAddOrEdit] = useState("Add New Task");
  const [tempId, setTempId] = useState("");
  const [category, setCategory] = useState("");
  const [filter, setFilter] = useState("all");
  const [completedIsBlue, setCompletedIsBlue] = useState(
    localStorage.getItem("completedIsBlue") !== null
      ? JSON.parse(localStorage.getItem("completedIsBlue"))
      : true
  );
  const inputRef = useRef();
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
      setTaskValue(event.target.value);
    } else {
      setTaskValue("");
    }
  };

  const handleAddNewTask = (event) => {
    event.preventDefault();
    if (!taskValue) {
      setTaskValue("");
      inputRef.current.focus();

      return;
    }
    if (addOrEdit === "Add New Task") {
      const task = {
        id: nanoid(),
        task: taskValue.trim(),
        category: !category ? "uncategorized" : category,
        displayedDate: moment().format("MM/DD/YYYY"),
        displayedTime: moment().format("h:mm A"),
        dateTime: moment().format("YYYY-MM-DDTHH:mm:ss"),
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
          task.task = taskValue.trim();
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
        inputRef.current.focus();
        return true;
      }
      return false;
    });
  };

  const handleDeleteAll = () => {
    if (window.confirm("Delete all incomplete as well as complete tasks?")) {
      setAllTasks(() => {
        localStorage.removeItem("allTodos");
        return [];
      });
      setAddOrEdit("Add New Task");
      setCategory("");
      setFilter("all");
      setTaskValue("");
      inputRef.current.focus();
    }
  };

  const handleDeleteCompleted = () => {
    setAllTasks((prevTasks) => {
      localStorage.setItem(
        "allTodos",
        JSON.stringify(prevTasks.filter((obj) => !obj.completed))
      );
      return prevTasks.filter((obj) => !obj.completed);
    });
    inputRef.current.focus();
  };

  const handleEditTask = (taskId) => {
    allTasks.some((task) => {
      if (taskId === task.id) {
        setTaskValue(task.task);
        setAddOrEdit("Done");
        setTempId(taskId);
        return true;
      }
      return false;
    });
    inputRef.current.focus();
  };

  const handleDeleteTask = (taskId) => {
    setAllTasks((prevTasks) => {
      const updatedAllTasks = prevTasks.filter((task) => task.id !== taskId);
      localStorage.setItem("allTodos", JSON.stringify(updatedAllTasks));
      return updatedAllTasks;
    });
    setCount((prevCount) => prevCount + 1);
    setAddOrEdit("Add New Task");
    inputRef.current.focus();
  };

  const handleCanceEdit = () => {
    setAddOrEdit("Add New Task");
    setTaskValue("");
    inputRef.current.focus();
  };

  const handleCategoryChange = (event) => {
    setCategory(event.target.value);
    inputRef.current.focus();
  };

  const handleFilterChange = (event) => {
    setFilter(event.target.value);
    setAddOrEdit("Add New Task");
    setCategory("");
    setTaskValue("");
    inputRef.current.focus();
  };

  const showCompletedColor = {
    backgroundColor: completedIsBlue ? "rgb(60, 74, 226)" : "rgb(57, 169, 59)",
  };
  const handleCompleted = () => {
    setCompletedIsBlue((prevState) => {
      localStorage.setItem("completedIsBlue", JSON.stringify(!prevState));
      return !prevState;
    });
    inputRef.current.focus();
  };

  const buildTask = () => {
    if (filter === "all") {
      return completedIsBlue
        ? allTasks.map((obj) => {
            if (!obj.completed) {
              return (
                <div className="task" key={obj.id}>
                  <div className="task-status">
                    <input
                      id="task-status"
                      onChange={() => handleStatusChange(obj.id)}
                      checked={obj.completed}
                      type="checkbox"
                    />
                  </div>
                  <div className="task-date-container">
                    <div
                      style={{
                        textDecoration: obj.completed && "line-through",
                      }}
                      className="task-content"
                    >
                      {obj.task}
                    </div>

                    <div className="task-date">{`${obj.displayedTime}, ${obj.displayedDate}`}</div>
                  </div>
                  <button
                    id="edit-task"
                    onClick={() => handleEditTask(obj.id)}
                    className="edit-delete-container"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteTask(obj.id)}
                    className="edit-delete-container"
                  >
                    Delete
                  </button>
                </div>
              );
            }
            return null;
          })
        : allTasks.map((obj) => {
            return (
              <div className="task" key={obj.id}>
                <div className="task-status">
                  <input
                    id="task-status"
                    onChange={() => handleStatusChange(obj.id)}
                    checked={obj.completed}
                    type="checkbox"
                  />
                </div>
                <div className="task-date-container">
                  <div
                    style={{ textDecoration: obj.completed && "line-through" }}
                    className="task-content"
                  >
                    {obj.task}
                  </div>

                  <div className="task-date">{`${obj.displayedTime}, ${obj.displayedDate}`}</div>
                </div>
                <button
                  id="edit-task"
                  onClick={() => handleEditTask(obj.id)}
                  className="edit-delete-container"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDeleteTask(obj.id)}
                  className="edit-delete-container"
                >
                  Delete
                </button>
              </div>
            );
          });
    } else {
      const filteredTasks = allTasks.filter((obj) => obj.category === filter);
      return filteredTasks.length ? (
        completedIsBlue ? (
          filteredTasks.map((obj) => {
            if (!obj.completed) {
              return (
                <div className="task" key={obj.id}>
                  <div className="task-status">
                    <input
                      id="task-status"
                      onChange={() => handleStatusChange(obj.id)}
                      checked={obj.completed}
                      type="checkbox"
                    />
                  </div>
                  <div className="task-date-container">
                    <div
                      style={{
                        textDecoration: obj.completed && "line-through",
                      }}
                      className="task-content"
                    >
                      {obj.task}
                    </div>

                    <div className="task-date">{`${obj.displayedTime}, ${obj.displayedDate}`}</div>
                  </div>
                  <button
                    id="edit-task"
                    onClick={() => handleEditTask(obj.id)}
                    className="edit-delete-container"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteTask(obj.id)}
                    className="edit-delete-container"
                  >
                    Delete
                  </button>
                </div>
              );
            }
            return null;
          })
        ) : (
          filteredTasks.map((obj) => {
            return (
              <div className="task" key={obj.id}>
                <div className="task-status">
                  <input
                    id="task-status"
                    onChange={() => handleStatusChange(obj.id)}
                    checked={obj.completed}
                    type="checkbox"
                  />
                </div>
                <div className="task-date-container">
                  <div
                    style={{ textDecoration: obj.completed && "line-through" }}
                    className="task-content"
                  >
                    {obj.task}
                  </div>

                  <div className="task-date">{`${obj.displayedTime}, ${obj.displayedDate}`}</div>
                </div>
                <button
                  id="edit-task"
                  onClick={() => handleEditTask(obj.id)}
                  className="edit-delete-container"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDeleteTask(obj.id)}
                  className="edit-delete-container"
                >
                  Delete
                </button>
              </div>
            );
          })
        )
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
            ref={inputRef}
            autoComplete="off"
            autoFocus
            onChange={handleTaskValueChange}
            id="new-task"
            value={taskValue}
            placeholder={
              addOrEdit === "Add New Task"
                ? "Enter new task..."
                : "Edit Your Task..."
            }
            type="text"
          />
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
          <button id="add-task" type="submit">
            {addOrEdit}
          </button>
        </div>
      </form>
      <h5>Nothing yet!</h5>
    </div>
  ) : (
    <div className="container">
      <form onSubmit={handleAddNewTask}>
        <div className="form-container">
          <input
            ref={inputRef}
            autoComplete="off"
            autoFocus
            onChange={handleTaskValueChange}
            id="new-task"
            value={taskValue}
            placeholder={
              addOrEdit === "Add New Task"
                ? "Enter new task..."
                : "Edit Your Task..."
            }
            type="text"
          />
          <div>
            <select
              value={category}
              onChange={handleCategoryChange}
              name="choose-category"
              id="choose-category"
            >
              <option value="">
                {addOrEdit === "Done"
                  ? "--Edit Category--"
                  : "--Choose Category--"}
              </option>
              <option value="home">Home</option>
              <option value="work">Work</option>
              <option value="casual">Casual</option>
            </select>
          </div>
          <button id="add-task" type="submit">
            {addOrEdit}
          </button>
          {addOrEdit === "Done" && (
            <button style={{ marginLeft: 0 }} onClick={handleCanceEdit}>
              Cancel
            </button>
          )}
        </div>
      </form>
      <div className="tasks-display">
        <div className="clear-filter-container">
          <div style={{ display: "flex" }}>
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

            <div>
              <button
                id="show-completed"
                style={showCompletedColor}
                onClick={handleCompleted}
              >
                Show Completed
              </button>
            </div>
          </div>
          <div style={{ display: "flex" }}>
            <div>
              <button id="delete-completed" onClick={handleDeleteCompleted}>
                Delete Completed
              </button>
            </div>
            <div>
              <button id="delete-all" onClick={handleDeleteAll}>
                Delete All
              </button>
            </div>
          </div>
        </div>
        {buildTask()}
      </div>
    </div>
  );
};
