import { db, auth } from "@/lib/firebase";
import {
  collection,
  query,
  where,
  doc,
  addDoc,
  deleteDoc,
  updateDoc,
  onSnapshot,
  serverTimestamp,
  getDoc,
} from "firebase/firestore";
import { useState, FormEvent, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Todos = {
  id: string;
  title: string;
  completed: boolean;
  owner: string;
  timestamp: any;
};

export const Todolist = () => {
  const [todos, setTodos] = useState<Todos[]>([]);
  const [value, setValue] = useState("");

  useEffect(() => {
    const q = query(
      collection(db, "todos"),
      where("owner", "==", auth.currentUser!.uid)
    );

    const unsubscribe = onSnapshot(
      q,
      { includeMetadataChanges: true },
      (snapshot) => {
        const fetchedTodos = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Todos[];

        setTodos(fetchedTodos);

        snapshot.docChanges().forEach((change) => {
          if (change.type === "added") {
            console.log("New todo: ", change.doc.data());
          }

          const source = snapshot.metadata.fromCache ? "local cache" : "server";
          console.log("Data came from " + source);
        });
      }
    );

    // Clean up the onSnapshot listener when the component is unmounted
    return () => unsubscribe();
  }, []);

  const toggleTodo = async (id: string) => {
    const todoRef = doc(db, "todos", id);
    const todoSnapshot = await getDoc(todoRef);
    const serverTodo = todoSnapshot.data() as Todos;

    const newTodoData: Partial<Todos> = {
      completed: !serverTodo.completed,
      timestamp: serverTimestamp(),
    };

    if (newTodoData.timestamp > serverTodo.timestamp) {
      // Local changes are newer, update the server
      await updateDoc(todoRef, newTodoData);
    } else {
      // Server changes are newer, update the local state
      setTodos(
        todos.map((todo) =>
          todo.id === id ? { ...todo, ...serverTodo } : todo
        )
      );
    }
  };

  const deleteTodo = async (id: string) => {
    const todoRef = doc(db, "todos", id);
    const todoSnapshot = await getDoc(todoRef);
    const serverTodo = todoSnapshot.data() as Todos;

    const newTodoData: Partial<Todos> = {
      timestamp: serverTimestamp(),
    };

    if (newTodoData.timestamp > serverTodo.timestamp) {
      // Local changes are newer, delete the todo on the server
      await deleteDoc(todoRef);
    } else {
      // Server changes are newer, update the local state
      setTodos(todos.filter((todo) => todo.id !== id));
    }
  };

  const addTodo = async (e: FormEvent) => {
    e.preventDefault();
    if (!value) return;

    const newTodo: Partial<Todos> = {
      title: value,
      completed: false,
      owner: auth.currentUser!.uid,
      timestamp: serverTimestamp(),
    };
    setValue("");

    await addDoc(collection(db, "todos"), newTodo);
  };

  return (
    <>
      <div className="p-2 grow">
        {todos.map((todo) => (
          <div key={todo.id} className="flex">
            <div
              className={`${todo.completed ? "line-through" : ""} grow`}
              onClick={() => toggleTodo(todo.id)}
            >
              {todo.title}
            </div>
            <Button variant={"ghost"} onClick={() => deleteTodo(todo.id)}>
              Delete
            </Button>
          </div>
        ))}
      </div>
      <form className="flex gap-2">
        <Input value={value} onChange={(e) => setValue(e.target.value)} />
        <Button onClick={addTodo}>Add</Button>
      </form>
    </>
  );
};
