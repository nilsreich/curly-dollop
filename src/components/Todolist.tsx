import { db, auth } from "@/lib/firebase";
import {
  collection,
  query,
  where,
  doc,
  addDoc,
  deleteDoc,
  onSnapshot,
  serverTimestamp,
  getDoc,
} from "firebase/firestore";
import { useState, FormEvent, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";
import { PlusIcon } from "lucide-react";
import { PanInfo } from "framer-motion";

type Todos = {
  id: string;
  title: string;
  owner: string;
  timestamp: any;
};

export const Todolist = () => {
  const [todos, setTodos] = useState<Todos[]>([]);
  const [value, setValue] = useState("");

  const [opacity, setOpacity] = useState(0);

  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    const q = query(
      collection(db, "todos"),
      where("owner", "==", auth.currentUser!.uid)
    );

    const unsubscribe = onSnapshot(
      q,
      { includeMetadataChanges: true }, // Add this line
      (snapshot) => {
        const fetchedTodos = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Todos[];
        fetchedTodos.sort((a, b) => b.timestamp.seconds - a.timestamp.seconds);
        setTodos(fetchedTodos);
      }
    );

    return () => unsubscribe();
  }, []);

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
      owner: auth.currentUser!.uid,
      timestamp: serverTimestamp(),
    };
    setValue("");
    inputRef.current?.focus();
    await addDoc(collection(db, "todos"), newTodo);
  };

  const onDragEnd = (info: PanInfo, todo: Todos) => {
    if (info.offset.x < -115) {
      deleteTodo(todo.id);
    }
  };

  return (
    <div className="grow">
      <AnimatePresence>
        {todos.map((todo) => (
          <motion.div
            key={todo.id}
            className="relative flex items-center b"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div
              className="absolute bg-red-500 text-black p-3 font-black h-12 w-full text-right pr-8"
              style={{ opacity: opacity }}
            >
              {opacity > 1 ? "Delete" : ""}
            </div>

            <motion.div
              drag="x"
              className="h-12 bg-background p-3 z-10 w-full"
              dragConstraints={{ left: 0, right: 0 }}
              onDragEnd={(_event, info) => onDragEnd( info, todo)}
              dragElastic={{ left: 1, right: 0 }}
              dragMomentum={false}
              onDrag={(_event, info) => {
                setOpacity(Math.abs(info.offset.x / 115));
              }}
            >
              {todo.title}
            </motion.div>
          </motion.div>
        ))}
      </AnimatePresence>

      <form className="flex gap-4 fixed bottom-0 left-0 right-0 p-4 bg-background items-center">
        <Input
          ref={inputRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Add something..."
          className="px-3 py-6"
        />
        <Button onClick={addTodo} className="h-12">
          <PlusIcon size={24} />
        </Button>
      </form>
    </div>
  );
};
