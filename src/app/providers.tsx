"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";
import { useState } from "react";

/**
 * 전역 Provider. react-query의 QueryClient와 sonner 토스트를 앱 전체에 제공한다.
 * - QueryClient는 컴포넌트 수명 동안 한 번만 생성되도록 useState 초기화 함수로 만든다.
 * - Toaster는 앱 다크 테마에 맞춘다.
 */
export default function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: { retry: 1, refetchOnWindowFocus: false },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <Toaster theme="dark" position="top-center" richColors />
    </QueryClientProvider>
  );
}
