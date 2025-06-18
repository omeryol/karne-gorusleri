import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Router, Route, Switch } from "wouter";
import { motion } from "framer-motion";
import Dashboard from "./pages/Dashboard";
import StudentManagement from "./pages/StudentManagement";
import CommentAssignment from "./pages/CommentAssignment";
import Navigation from "./components/Navigation";
import { queryClient } from "./lib/queryClient";
import { useState } from "react";

function App() {
  const [darkMode, setDarkMode] = useState(false);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle("dark");
  };

  return (
    <QueryClientProvider client={queryClient}>
      <div className={`min-h-screen animated-gradient ${darkMode ? 'dark' : ''}`}>
        <Router>
          <div className="flex flex-col min-h-screen">
            <Navigation darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
            
            <main className="flex-1 container mx-auto px-4 py-8">
              <motion.div
                key="main-content"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full"
              >
                <Switch>
                  <Route path="/" component={Dashboard} />
                  <Route path="/dashboard" component={Dashboard} />
                  <Route path="/students" component={StudentManagement} />
                  <Route path="/comments" component={CommentAssignment} />
                  <Route>
                    <div className="text-center py-20">
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 260, damping: 20 }}
                      >
                        <h1 className="text-4xl font-bold text-white mb-4">
                          Sayfa Bulunamadı
                        </h1>
                        <p className="text-white/80">
                          Aradığınız sayfa mevcut değil.
                        </p>
                      </motion.div>
                    </div>
                  </Route>
                </Switch>
              </motion.div>
            </main>

            <footer className="bg-black/20 backdrop-blur-sm text-center py-4 text-white/70">
              <p>&copy; 2025 Karne Yorumları Yönetim Sistemi</p>
            </footer>
          </div>
        </Router>
      </div>
    </QueryClientProvider>
  );
}

export default App;