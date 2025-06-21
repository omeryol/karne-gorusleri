import { useState } from "react";
import { GraduationCap, Home, Users, MessageSquare, FileText, Filter } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { CLASSES, SECTIONS, SEMESTERS } from "@/lib/constants";

interface SidebarProps {
  selectedClass: string;
  selectedSection: string;
  selectedSemester: string;
  onClassChange: (value: string) => void;
  onSectionChange: (value: string) => void;
  onSemesterChange: (value: string) => void;
  onFilter: () => void;
  isOpen: boolean;
  onClose: () => void;
  activeNav: string;
  onNavChange: (nav: string) => void;
}

export function Sidebar({
  selectedClass,
  selectedSection,
  selectedSemester,
  onClassChange,
  onSectionChange,
  onSemesterChange,
  onFilter,
  isOpen,
  onClose,
  activeNav,
  onNavChange
}: SidebarProps) {

  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: Home },
    { id: "students", label: "Öğrenci Yönetimi", icon: Users },
    { id: "templates", label: "Yorum Şablonları", icon: MessageSquare },
    { id: "comments", label: "Karne Yorumları", icon: FileText },
  ];

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={onClose}
        />
      )}
      
      <div className={`w-80 bg-white dark:bg-gray-800 shadow-xl transform transition-transform duration-300 fixed lg:relative z-40 h-full ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
              <GraduationCap className="text-white h-6 w-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">Karne Sistemi</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">Öğretmen Paneli</p>
            </div>
          </div>
        </div>

        {/* Class Selection */}
        <div className="p-6 space-y-4">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Sınıf ve Dönem Seçimi</h3>
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Sınıf</label>
            <Select value={selectedClass} onValueChange={onClassChange}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Sınıf seçiniz" />
              </SelectTrigger>
              <SelectContent>
                {CLASSES.map((cls) => (
                  <SelectItem key={cls} value={cls}>
                    {cls}. Sınıf
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Dönem</label>
            <Select value={selectedSemester} onValueChange={onSemesterChange}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Dönem seçiniz" />
              </SelectTrigger>
              <SelectContent>
                {SEMESTERS.map((sem) => (
                  <SelectItem key={sem} value={sem}>
                    {sem}. Dönem
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Şube</label>
            <Select value={selectedSection} onValueChange={onSectionChange}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Şube seçiniz" />
              </SelectTrigger>
              <SelectContent>
                {SECTIONS.map((section) => (
                  <SelectItem key={section} value={section}>
                    {section} Şubesi
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button onClick={onFilter} className="w-full">
            <Filter className="mr-2 h-4 w-4" />
            Filtrele
          </Button>
        </div>

        {/* Navigation Menu */}
        <nav className="px-6 pb-6">
          <ul className="space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeNav === item.id;
              return (
                <li key={item.id}>
                  <button
                    onClick={() => {
                      onNavChange(item.id);
                      onClose(); // Close mobile sidebar when navigation changes
                    }}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors transform hover:scale-105 ${
                      isActive
                        ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 shadow-lg"
                        : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    <span>{item.label}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
    </>
  );
}
