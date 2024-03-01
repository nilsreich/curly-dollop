import { FormEvent } from "react";
import { db, auth } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { Todos } from "@/lib/types";

export const useTodos = () => {
  const db_addTodo = async (e: FormEvent, value: string) => {
    e.preventDefault();
    if (!value) return;

    const newTodo: Partial<Todos> = {
      title: value,
      completed: false,
      owner: auth.currentUser!.uid,
      timestamp: serverTimestamp(),
    };

    await addDoc(collection(db, "todos"), newTodo);
  };

  return { db_addTodo };
};
