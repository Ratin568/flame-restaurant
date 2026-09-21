import type { ReactNode } from "react";
import { BackgroundPaths } from "@/components/ui/background-paths";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <main className="auth-neutral relative flex min-h-[calc(100svh-4rem)] items-center justify-center overflow-hidden px-4 py-12">
      <BackgroundPaths />

      <div className="relative z-10 w-full">
        {children}
      </div>
    </main>
  );
}