import React, { useCallback, useEffect, useRef, useState } from "react";
import moment from "moment";
import { nanoid } from "nanoid";
import { Task } from "./Task";

export const TaskList = () => {
  const [taskValue, setTaskValue] = useState("");
  const [count, setCount] = useState(0);
  const [addOrEdit, setAddOrEdit] = useState("Add New Task");
  const [tempId, setTempId] = useState("");
  const [category, setCategory] = useState("");
  const [highPriority, setHighPriority] = useState(false);
  const inputRef = useRef();
  const [filter, setFilter] = useState(
    localStorage.getItem("filter") !== null
      ? JSON.parse(localStorage.getItem("filter"))
      : "all"
  );
  const [sortParameter, setSortParameter] = useState(
    localStorage.getItem("sortParam") !== null
      ? JSON.parse(localStorage.getItem("sortParam"))
      : "most recent"
  );
  const [completedIsBlue, setCompletedIsBlue] = useState(
    localStorage.getItem("completedIsBlue") !== null
      ? JSON.parse(localStorage.getItem("completedIsBlue"))
      : true
  );
  const [allTasks, setAllTasks] = useState(
    localStorage.getItem("allTodos") !== null
      ? JSON.parse(localStorage.getItem("allTodos")).sort(
          (a, b) => b.dateTime - a.dateTime
        )
      : []
  );

  // const taskSuggestions = () => {
  //   const suggestions = ["Meeting today at 11 AM", "Do laundry tomorrow", ""];
  //   setInterval(() => {
  //     for (const suggestion of suggestions) {
  //     }
  //   }, 2000);
  // };

  const sortingFunction = useCallback((arr, sortParam) => {
    if (sortParam === "dateTime") {
      arr.sort((a, b) => {
        const dateA = moment(a.dateTime, "YYYY-MM-DDTh:mm:ss A");
        const dateB = moment(b.dateTime, "YYYY-MM-DDTh:mm:ss A");

        if (dateA.isBefore(dateB)) {
          return 1;
        } else if (dateA.isAfter(dateB)) {
          return -1;
        } else {
          return 0;
        }
      });
    } else if (sortParam === "highPriority") {
      arr.sort((a, b) => b.highPriority - a.highPriority);
    }
    return arr;
  }, []);

  useEffect(() => {
    setAllTasks(
      localStorage.getItem("allTodos") !== null
        ? sortingFunction(
            JSON.parse(localStorage.getItem("allTodos")),
            sortParameter === "most recent" ? "dateTime" : "highPriority"
          )
        : []
    );
  }, [count, sortParameter, sortingFunction]);

  useEffect(() => {
    if (!allTasks.length) {
      localStorage.removeItem("allTodos");
      localStorage.removeItem("completedIsBlue");
      localStorage.removeItem("sortParam");
      localStorage.removeItem("filter");
      setCategory("");
      setFilter("all");
      setCompletedIsBlue(true);
    }
  }, [allTasks]);

  const handleAddNewTask = (event) => {
    event.preventDefault();
    if (!taskValue) {
      setTaskValue("");
      inputRef.current.focus();

      return;
    }
    if (addOrEdit === "Add New Task") {
      const newTask = {
        id: nanoid(),
        task: taskValue.trim(),
        highPriority: highPriority,
        category: !category ? "uncategorized" : category,
        displayedDate: moment().format("MM/DD/YYYY"),
        displayedTime: moment().format("h:mm A"),
        dateTime: moment().format("YYYY-MM-DDTh:mm:ss A"),
        completed: false,
      };
      if (allTasks.length) {
        setAllTasks((prevTasks) => {
          localStorage.setItem(
            "allTodos",
            JSON.stringify([newTask, ...prevTasks])
          );
          return [newTask, ...prevTasks];
        });
      } else {
        setAllTasks(() => {
          localStorage.setItem("allTodos", JSON.stringify([newTask]));
          return [newTask];
        });
      }
    } else {
      allTasks.some((task, index) => {
        setHighPriority(task.highPriority);
        if (task.id === tempId) {
          task.task = taskValue.trim();
          if (category) {
            task.category = category;
          }
          task.highPriority = highPriority;
          const updatedTask = task;
          setAllTasks((prevTasks) => {
            prevTasks.splice(index, 1, updatedTask);
            localStorage.setItem("allTodos", JSON.stringify(prevTasks));
            return prevTasks;
          });
          return true;
        }
        return false;
      });
    }
    setAddOrEdit("Add New Task");
    setCategory("");
    setTaskValue("");
    setHighPriority(false);
    setCount((prevCount) => prevCount + 1);
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

  const handleTaskValueChange = (event) => {
    if (event.target.value.trim().length) {
      setTaskValue(event.target.value);
    } else {
      setTaskValue("");
    }
  };

  const handleCategoryChange = (event) => {
    setCategory(event.target.value);
    inputRef.current.focus();
  };

  const handlePriority = () => {
    setHighPriority((prevState) => !prevState);
    setCount((prevCount) => prevCount + 1);
    inputRef.current.focus();
  };

  const handleEditTask = (taskId) => {
    allTasks.some((task) => {
      if (taskId === task.id) {
        setTaskValue(task.task);
        setAddOrEdit("Save");
        setTempId(taskId);
        setHighPriority(task.highPriority);
        setCategory(task.category);
        return true;
      }
      return false;
    });
    inputRef.current.focus();
  };

  const handleCanceEdit = () => {
    setAddOrEdit("Add New Task");
    setTaskValue("");
    setHighPriority(false);
    inputRef.current.focus();
  };

  const handleDeleteTask = (taskId) => {
    setAllTasks((prevTasks) => {
      const updatedAllTasks = prevTasks.filter((task) => task.id !== taskId);
      localStorage.setItem("allTodos", JSON.stringify(updatedAllTasks));
      return updatedAllTasks;
    });
    setAddOrEdit("Add New Task");
    inputRef.current.focus();
  };

  const handleDeleteCompleted = () => {
    setAllTasks((prevTasks) => {
      localStorage.setItem(
        "allTodos",
        JSON.stringify(prevTasks.filter((obj) => !obj.completed))
      );
      return prevTasks.filter((obj) => !obj.completed);
    });
    setAddOrEdit("Add New Task");
    inputRef.current.focus();
  };

  const handleDeleteAll = () => {
    if (window.confirm("Delete all incomplete as well as complete tasks?")) {
      setAllTasks(() => {
        return [];
      });
      setAddOrEdit("Add New Task");
      setTaskValue("");
      inputRef.current.focus();
    }
  };

  const handleFilterChange = (event) => {
    setFilter(() => {
      localStorage.setItem("filter", JSON.stringify(event.target.value));
      return event.target.value;
    });
    setAddOrEdit("Add New Task");
    setCategory("");
    setTaskValue("");
    setHighPriority(false);
    inputRef.current.focus();
  };

  const handleSortTasks = (event) => {
    setSortParameter(() => {
      localStorage.setItem("sortParam", JSON.stringify(event.target.value));
      return event.target.value;
    });
    setAddOrEdit("Add New Task");
    setCategory("");
    setTaskValue("");
    setHighPriority(false);
    setCount((prevCount) => prevCount + 1);
    inputRef.current.focus();
  };

  const showCompletedColor = {
    backgroundColor: completedIsBlue ? "rgb(60, 74, 226)" : "rgb(57, 169, 59)",
  };
  const handleCompleted = (event) => {
    setCompletedIsBlue((prevState) => {
      localStorage.setItem("completedIsBlue", JSON.stringify(!prevState));
      return !prevState;
    });
    inputRef.current.focus();
  };

  const displayedTasks = () => {
    if (filter === "all") {
      return completedIsBlue
        ? allTasks.map((obj, idx) => {
            if (!obj.completed) {
              return (
                <Task
                  key={idx}
                  obj={obj}
                  handleStatusChange={handleStatusChange}
                  handleEditTask={handleEditTask}
                  handleDeleteTask={handleDeleteTask}
                />
              );
            }
            return null;
          })
        : allTasks.map((obj, idx) => {
            return (
              <Task
                key={idx}
                obj={obj}
                handleStatusChange={handleStatusChange}
                handleEditTask={handleEditTask}
                handleDeleteTask={handleDeleteTask}
              />
            );
          });
    } else {
      const filteredTasks = allTasks.filter((obj) => obj.category === filter);
      return allTasks.filter((obj) => obj.category === filter).length ? (
        completedIsBlue ? (
          filteredTasks.map((obj, idx) => {
            if (!obj.completed) {
              return (
                <Task
                  key={idx}
                  obj={obj}
                  handleStatusChange={handleStatusChange}
                  handleEditTask={handleEditTask}
                  handleDeleteTask={handleDeleteTask}
                />
              );
            }
            return null;
          })
        ) : (
          filteredTasks.map((obj, idx) => {
            return (
              <Task
                key={idx}
                obj={obj}
                handleStatusChange={handleStatusChange}
                handleEditTask={handleEditTask}
                handleDeleteTask={handleDeleteTask}
              />
            );
          })
        )
      ) : (
        <h5>No {filter} tasks!</h5>
      );
    }
  };

  return (
    <div className="container">
      <form onSubmit={handleAddNewTask}>
        <div className="form-container">
          <input
            ref={inputRef}
            autoComplete="off"
            autoFocus
            onChange={handleTaskValueChange}
            className="new-task-input"
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
              className="choose-category-select"
            >
              <option value="">--Choose Category--</option>
              <option value="home">Home</option>
              <option value="work">Work</option>
              <option value="casual">Casual</option>
            </select>
          </div>
          <label className="high-priority-label" htmlFor="high-priority">
            High Priority?
          </label>
          <input
            className="high-priority-input"
            type="checkbox"
            checked={highPriority}
            onChange={handlePriority}
          />
          <button className="add-task-button" type="submit">
            {addOrEdit}
          </button>
          {addOrEdit === "Save" && (
            <button style={{ marginLeft: 0 }} onClick={handleCanceEdit}>
              Cancel
            </button>
          )}
        </div>
      </form>
      {!allTasks.length ? (
        <h5>Nothing yet!</h5>
      ) : (
        <div>
          <div className="operative-buttons">
            <div className="filter-sort-container">
              <div className="task-category">
                <select
                  value={filter}
                  onChange={handleFilterChange}
                  name="filter-category"
                  className="filter-category-select"
                >
                  <option value="all">All Tasks</option>
                  <option value="home">Home</option>
                  <option value="work">Work</option>
                  <option value="casual">Casual</option>
                  <option value="uncategorized">Uncategorized</option>
                </select>
              </div>
              <div className="sort-tasks">
                <select
                  value={sortParameter}
                  onChange={handleSortTasks}
                  name="sort-task"
                  className="sort-tasks-select"
                >
                  <option value="most recent">Most Recent</option>
                  <option value="priority">Priority</option>
                </select>
              </div>
            </div>
            <div>
              <button
                className="show-completed-button"
                style={showCompletedColor}
                onClick={handleCompleted}
              >
                {completedIsBlue ? "Show Completed" : "Hide Completed"}
              </button>
            </div>
          </div>
          {displayedTasks()}
          <div className="delete-completed-container">
            <div>
              <button className="delete-completed-button" onClick={handleDeleteCompleted}>
                Delete Completed
              </button>
            </div>
            <div>
              <button className="delete-all-button" onClick={handleDeleteAll}>
                Delete All
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
