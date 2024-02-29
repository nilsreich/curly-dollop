import { db, auth } from "@/lib/firebase";
import {
  getDocs,
  collection,
  query,
  where,
  doc,
  addDoc,
  deleteDoc,
  updateDoc,
} from "firebase/firestore";
import { useState, FormEvent, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Todos = {
  id: string;
  title: string;
  completed: boolean;
  owner: string;
};

const fetchTodos = async () => {
  const q = query(
    collection(db, "todos"),
    where("owner", "==", auth.currentUser!.uid)
  );
  const querySnapshot = await getDocs(q);

  const data = querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Todos[];

  return data;
};

export const Todolist = () => {
  const [todos, setTodos] = useState<Todos[]>([]);
  const [value, setValue] = useState("");

  useEffect(() => {
    const fetchAndSetTodos = async () => {
      const fetchedTodos = await fetchTodos();
      setTodos(fetchedTodos);
    };

    fetchAndSetTodos();
  }, []);

  const toggleTodo = useCallback(
    async (id: string) => {
      setTodos(
        todos.map((todo) =>
          todo.id === id ? { ...todo, completed: !todo.completed } : todo
        )
      );

      await updateDoc(doc(db, "todos", id), {
        completed: !todos.find((todo) => todo.id === id)!.completed,
      });
    },
    [todos, db]
  );

  const deleteTodo = useCallback(
    async (id: string) => {
      setTodos(todos.filter((todo) => todo.id !== id)); // Update state before deletion

      await deleteDoc(doc(db, `todos/${id}`));
    },
    [todos, db]
  );

  const addTodo = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();
      if (!value) return;

      const newTodo = {
        title: value,
        completed: false,
        owner: auth.currentUser!.uid,
      } as Todos;

      try {
        // Import the addDoc and doc functions
        const docRef = await addDoc(collection(db, "todos"), newTodo);

        // Access the automatically generated ID
        const newTodoId = docRef.id;

        setTodos([...todos, { ...newTodo, id: newTodoId }]);
        setValue("");
      } catch (error) {
        console.error("Error adding todo:", error);
        // Handle potential errors (e.g., display an error message to the user)
      }
    },
    [value]
  );
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
