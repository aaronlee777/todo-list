"use client";

import { useSession } from "next-auth/react";
import { TodoList } from "@/app/components/TodoList";
import { useRef } from "react";

export default function DashboardClient() {
  const { data: session, status } = useSession();
  const todoListRef = useRef<{ refresh: () => Promise<void> }>(null);

  if (status === "loading") {
    return <div>Loading...</div>;
  }

  if (!session) {
    return <div>Please sign in</div>;
  }

  return (
    <div className="space-y-8">
      <div className="grid gap-6 max-w-5xl mx-auto">
        <TodoList ref={todoListRef} />
      </div>
    </div>
  );
}
