"use client";
import Image from "next/image";
import styles from "./page.module.css";
import { useEffect, useState } from "react";

const colors = ["#FF3B30", "#FF9500", "#FFCC00", "#34C759", "#007AFF", "#5856D6", "#AF52DE", "#FF2D55", "#A2845E"];
const maxTitleLength = 100;

interface Task {
  id: string;
  title: string;
  color: string;
  isCompleted: boolean;
}

const apiURL = "http://localhost:3001";

interface FormProps {
  initialTitle?: string;
  initialColor?: string;
  buttonText: string;
  buttonIconSrc: string;
  buttonIconAlt: string;
  buttonIconWidth: number;
  buttonIconHeight: number;
  close: () => void;
  submit: (title: string, color: string) => void;
}
function Form({
  initialTitle,
  initialColor,
  buttonText,
  buttonIconSrc,
  buttonIconAlt,
  buttonIconWidth,
  buttonIconHeight,
  close,
  submit
}: FormProps) {
  const [title, setTitle] = useState(initialTitle ?? "");
  const [selectedColor, setSelectedColor] = useState<string | undefined>(initialColor);
  return (
    <>
      <Image className={styles.back} src="/back.svg" alt="back" width={16} height={16} onClick={() => {
        close()
      }} />
      <label className={styles.formLabel} htmlFor="form-title">{"Title"}</label>
      <input className={styles.formInput} id="form-title" placeholder="Ex. Brush your teeth" maxLength={maxTitleLength} value={title} onChange={(event) => {
        setTitle(event.target.value);
      }} />
      <label className={styles.formLabel}>{"Color"}</label>
      <div className={styles.formColors}>
        {colors.map((color) => {
          const classNames = [styles.formColor];
          if (selectedColor === color) {
            classNames.push(styles.formColorSelected);
          }
          return <div className={classNames.join(" ")} style={{ backgroundColor: color }} key={color} onClick={() => {
            setSelectedColor(color);
          }} />
        }
        )}
      </div>
      <button className={styles.button} onClick={() => {
        const errors: string[] = [];
        if (!title) {
          errors.push("Title is required.");
        }
        if (!selectedColor) {
          errors.push("Color is required.");
        }
        if (errors.length > 0) {
          alert(errors.join("\n"));
        }
        else {
          submit(title, selectedColor as string);
        }
      }}>
        {buttonText}
        <Image
          className={styles.buttonIcon}
          src={buttonIconSrc}
          alt={buttonIconAlt}
          width={buttonIconWidth}
          height={buttonIconHeight}
        />
      </button>
    </>
  );
}

interface TaskProps {
  task: Task;
  toggleCompletion: () => void;
  update: () => void;
  remove: () => void;
}
function Task({ task, toggleCompletion, update, remove }: TaskProps) {
  return (<div className={styles.task} onClick={() => { update(); }}>
    {!task.isCompleted &&
      <span
        className={styles.taskUnchecked}
        style={{ borderColor: task.color }}
        onClick={(event) => {
          event.stopPropagation();
          toggleCompletion();
        }}
      />
    }
    {task.isCompleted &&
      <span
        className={styles.taskChecked}
        style={{ backgroundColor: task.color }}
        onClick={(event) => {
          event.stopPropagation();
          toggleCompletion();
        }}
      >{"✓"}</span>
    }
    <span className={styles.taskTitle}>{task.title}</span>
    <Image className={styles.taskDelete} src="/delete.svg" alt="delete" width={13} height={14} onClick={(event) => {
      event.stopPropagation();
      remove();
    }} />
  </div >);
}

export default function Home() {
  const [isCreatingTask, setIsCreatingTask] = useState(false);
  const [updatingTaskID, setUpdatingTaskID] = useState<string | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const fetchTasks = () => {
    fetch(`${apiURL}/tasks`).then((response) => {
      if (response.ok) {
        return response.json();
      }
      else {
        alert("Failed to fetch tasks");
        return [];
      }
    })
      .then((data) => {
        setTasks(data);
      })
      .catch((error) => {
        console.error(error);
        alert("Failed to fetch tasks");
      });
  }
  useEffect(() => {
    fetchTasks();
  }, []);
  const tasksCount = tasks.length;
  const completedTasksCount = tasks.filter(task => task.isCompleted).length;
  const updatingTask = updatingTaskID ? tasks.find(task => task.id === updatingTaskID) : undefined;
  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <Image className={styles.rocket} src="/rocket.svg" alt="rocket" width={22} height={36} />
        <h1 className={styles.title}>
          <span className={styles.title1}>{"Todo"}</span>
          <span className={styles.title2}>{"App"}</span>
        </h1>
      </header>
      <main className={styles.main}>
        {/* List view */}
        {!isCreatingTask && !updatingTaskID && <>
          <button className={`${styles.button} ${styles.createTaskButton}`} onClick={() => {
            setIsCreatingTask(true);
          }}>{"Create Task"}<Image className={styles.buttonIcon} src="/plus.svg" alt="plus" width={16} height={16} /></button>
          <div className={styles.tasksDetails}>
            <div>
              <span className={styles.tasksDetailLabel}>{"Tasks"}</span>
              <span className={styles.tasksDetailValue}>{tasksCount}</span>
            </div>
            <div>
              <span className={styles.tasksDetailLabel}>{"Completed"}</span>
              <span className={styles.tasksDetailValue}>{tasksCount > 0 ? `${completedTasksCount} of ${tasksCount}` : tasksCount}</span>
            </div>
          </div>
          {tasksCount === 0 && <div className={styles.tasksEmpty}>
            <Image src="/clipboard.png" alt="clipboard" width={56} height={56} />
            <p className={styles.tasksEmptyLine1}>{"You don't have any tasks registered yet."}</p>
            <p>{"Create tasks and organize your to-do items."}</p>
          </div>}
          {tasksCount > 0 && <div className={styles.tasks}>
            {tasks.map((task) =>
              <Task
                task={task}
                key={task.id}
                toggleCompletion={() => {
                  fetch(`${apiURL}/tasks/${task.id}`, {
                    method: "PUT",
                    headers: {
                      "Content-Type": "application/json"
                    },
                    body: JSON.stringify({ title: task.title, color: task.color, isCompleted: !task.isCompleted })
                  })
                    .then((response) => {
                      if (response.ok) {
                        setUpdatingTaskID(null);
                        fetchTasks();
                      }
                      else {
                        alert("Failed to update task");
                      }
                    })
                    .catch((error) => {
                      console.error(error);
                      alert("Failed to update task");
                    });
                }}
                update={() => {
                  setUpdatingTaskID(task.id);
                }}
                remove={() => {
                  const shouldDelete = confirm("Are you sure you want to delete this task?");
                  if (shouldDelete) {
                    fetch(`${apiURL}/tasks/${task.id}`, {
                      method: "DELETE"
                    })
                      .then((response) => {
                        if (response.ok) {
                          fetchTasks();
                        }
                        else {
                          alert("Failed to delete task");
                        }
                      })
                      .catch((error) => {
                        console.error(error);
                        alert("Failed to delete task");
                      });
                  }
                }}
              />)}
          </div>}
        </>}
        {/* Create form */}
        {isCreatingTask &&
          <Form
            buttonText="Add Task"
            buttonIconSrc="/plus.svg"
            buttonIconAlt="plus"
            buttonIconWidth={16}
            buttonIconHeight={16}
            close={() => {
              setIsCreatingTask(false);
            }}
            submit={(title, color) => {
              fetch(`${apiURL}/tasks`, {
                method: "POST",
                headers: {
                  "Content-Type": "application/json"
                },
                body: JSON.stringify({ title, color, isCompleted: false })
              })
                .then((response) => {
                  if (response.ok) {
                    setIsCreatingTask(false);
                    fetchTasks();
                  }
                  else {
                    alert("Failed to create task");
                  }
                })
                .catch((error) => {
                  console.error(error);
                  alert("Failed to create task");
                });
            }}
          />
        }
        {/* Update form */}
        {updatingTask &&
          <Form
            initialTitle={updatingTask.title}
            initialColor={updatingTask.color}
            buttonText="Save"
            buttonIconSrc="/check.svg"
            buttonIconAlt="check" close={() => {
              setUpdatingTaskID(null);
            }}
            buttonIconWidth={17}
            buttonIconHeight={14}
            submit={(title, color) => {
              fetch(`${apiURL}/tasks/${updatingTaskID}`, {
                method: "PUT",
                headers: {
                  "Content-Type": "application/json"
                },
                body: JSON.stringify({ title, color, isCompleted: updatingTask.isCompleted })
              })
                .then((response) => {
                  if (response.ok) {
                    setUpdatingTaskID(null);
                    fetchTasks();
                  }
                  else {
                    alert("Failed to update task");
                  }
                })
                .catch((error) => {
                  console.error(error);
                  alert("Failed to update task");
                });
            }}
          />
        }
      </main>
    </div>
  );
}
