import { useState, useEffect } from "react";
import { Moon, Sun, Menu, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "./ThemeProvider";
import { Sidebar } from "./Sidebar";
import { Dashboard } from "./Dashboard";
import StudentsPage from "@/pages/Students";
import TemplatesPage from "@/pages/Templates";
import CommentsPage from "@/pages/Comments";

export function Layout() {
  const { theme, toggleTheme } = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedClass, setSelectedClass] = useState("5");
  const [selectedSection, setSelectedSection] = useState("A");
  const [selectedSemester, setSelectedSemester] = useState("1");
  const [activeNav, setActiveNav] = useState("dashboard");
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);

  useEffect(() => {
    // Listen for PWA install prompt
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleFilter = () => {
    // Filter logic is handled by the Dashboard component through props
    setSidebarOpen(false); // Close sidebar on mobile after filter
  };

  const handleInstallApp = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setShowInstallPrompt(false);
      }
      setDeferredPrompt(null);
    }
  };

  return (
    <div className="min-h-screen flex bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      {/* Theme Toggle and Install Button */}
      <div className="fixed top-4 right-4 z-50 flex gap-2">
        {showInstallPrompt && (
          <Button
            onClick={handleInstallApp}
            variant="outline"
            size="icon"
            className="bg-blue-500 hover:bg-blue-600 text-white border-blue-500 shadow-lg hover:shadow-xl transition-all duration-300 animate-bounce-in"
            title="Uygulamayı telefonunuza yükleyin"
          >
            <Download className="h-5 w-5" />
          </Button>
        )}
        <Button
          onClick={toggleTheme}
          variant="outline"
          size="icon"
          className="bg-white dark:bg-gray-800 shadow-lg border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all duration-300"
        >
          {theme === "dark" ? (
            <Sun className="h-5 w-5 text-yellow-400" />
          ) : (
            <Moon className="h-5 w-5 text-gray-600" />
          )}
        </Button>
      </div>

      {/* Mobile Menu Button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Button
          onClick={() => setSidebarOpen(true)}
          variant="outline"
          size="icon"
          className="bg-white dark:bg-gray-800 shadow-lg border-gray-200 dark:border-gray-700"
        >
          <Menu className="h-5 w-5" />
        </Button>
      </div>

      {/* Sidebar */}
      <Sidebar
        selectedClass={selectedClass}
        selectedSection={selectedSection}
        selectedSemester={selectedSemester}
        onClassChange={setSelectedClass}
        onSectionChange={setSelectedSection}
        onSemesterChange={setSelectedSemester}
        onFilter={handleFilter}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        activeNav={activeNav}
        onNavChange={setActiveNav}
      />

      {/* Main Content */}
      <div className="flex-1 lg:ml-80">
        {activeNav === "dashboard" && (
          <Dashboard
            selectedClass={selectedClass}
            selectedSection={selectedSection}
            selectedSemester={selectedSemester}
          />
        )}
        {activeNav === "students" && (
          <StudentsPage
            selectedClass={selectedClass}
            selectedSection={selectedSection}
            selectedSemester={selectedSemester}
          />
        )}
        {activeNav === "templates" && (
          <TemplatesPage
            selectedClass={selectedClass}
            selectedSection={selectedSection}
            selectedSemester={selectedSemester}
          />
        )}
        {activeNav === "comments" && (
          <CommentsPage
            selectedClass={selectedClass}
            selectedSection={selectedSection}
            selectedSemester={selectedSemester}
          />
        )}
      </div>
    </div>
  );
}
