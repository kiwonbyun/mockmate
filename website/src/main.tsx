import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import { MockMateTools } from "mockmate";
import { Toaster } from "@b-origin/ming-toast";
import "./index.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 0, refetchOnWindowFocus: false },
  },
});

createRoot(document.getElementById("root")!).render(
  <QueryClientProvider client={queryClient}>
    <MockMateTools>
      <App />
      <Toaster position="top-right" />
    </MockMateTools>
  </QueryClientProvider>
);
