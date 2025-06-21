import { useState, useEffect } from "react";
import { Users, Plus, Search, Filter, Edit, Trash2, Download, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AddStudentModal } from "@/components/AddStudentModal";
import { Toast } from "@/components/Toast";
import { Student } from "@shared/schema";
import { storage } from "@/lib/storage";
import { CLASSES, SECTIONS } from "@/lib/constants";

interface StudentsPageProps {
  selectedClass: string;
  selectedSection: string;
  selectedSemester: string;
}

interface ToastMessage {
  id: string;
  message: string;
  type: "success" | "error" | "warning" | "info";
}

export default function StudentsPage({ selectedClass, selectedSection, selectedSemester }: StudentsPageProps) {
  const [students, setStudents] = useState<Student[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterClass, setFilterClass] = useState("all");
  const [filterSection, setFilterSection] = useState("all");
  const [showAddStudent, setShowAddStudent] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  useEffect(() => {
    loadAllStudents();
  }, []);

  useEffect(() => {
    filterStudents();
  }, [students, searchTerm, filterClass, filterSection]);

  const loadAllStudents = () => {
    const allStudents: Student[] = [];
    CLASSES.forEach(cls => {
      SECTIONS.forEach(section => {
        const classStudents = storage.getStudents(cls, section);
        allStudents.push(...classStudents);
      });
    });
    setStudents(allStudents);
  };

  const filterStudents = () => {
    let filtered = students;

    if (searchTerm) {
      filtered = filtered.filter(student =>
        student.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterClass !== "all") {
      filtered = filtered.filter(student => student.class === filterClass);
    }

    if (filterSection !== "all") {
      filtered = filtered.filter(student => student.section === filterSection);
    }

    setFilteredStudents(filtered);
  };

  const addToast = (message: string, type: ToastMessage["type"] = "info") => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts(prev => [...prev, { id, message, type }]);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  const handleSaveStudents = (newStudents: Omit<Student, "id" | "createdAt">[]) => {
    newStudents.forEach(studentData => {
      const student: Student = {
        ...studentData,
        id: Math.random().toString(36).substr(2, 9),
        createdAt: new Date()
      };
      storage.saveStudent(student);
    });
    
    loadAllStudents();
    addToast(`${newStudents.length} öğrenci başarıyla eklendi`, "success");
  };

  const handleDeleteStudent = (student: Student) => {
    if (confirm(`${student.name} adlı öğrenciyi silmek istediğinizden emin misiniz?`)) {
      storage.deleteStudent(student.id, student.class);
      loadAllStudents();
      addToast("Öğrenci silindi", "success");
    }
  };

  const getStudentsByClass = () => {
    const grouped: Record<string, Student[]> = {};
    filteredStudents.forEach(student => {
      const key = `${student.class}-${student.section}`;
      if (!grouped[key]) {
        grouped[key] = [];
      }
      grouped[key].push(student);
    });
    return grouped;
  };

  const exportStudents = () => {
    const data = JSON.stringify(students, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'ogrenciler.json';
    a.click();
    addToast("Öğrenci listesi indirildi", "success");
  };

  const groupedStudents = getStudentsByClass();

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Öğrenci Yönetimi</h1>
          <p className="text-gray-600 dark:text-gray-400">Tüm öğrencilerinizi görüntüleyin ve yönetin</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={exportStudents} variant="outline" className="animate-bounce-in">
            <Download className="mr-2 h-4 w-4" />
            Dışa Aktar
          </Button>
          <Button onClick={() => setShowAddStudent(true)} className="animate-bounce-in" style={{ animationDelay: '0.1s' }}>
            <Plus className="mr-2 h-4 w-4" />
            Öğrenci Ekle
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="animate-fade-in hover:shadow-lg transition-all duration-300 border-0 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20">
          <CardContent className="p-4">
            <div className="flex items-center">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg">
                <Users className="text-white h-5 w-5" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-blue-700 dark:text-blue-300">Toplam Öğrenci</p>
                <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">{students.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {CLASSES.map((cls, index) => {
          const classStudents = students.filter(s => s.class === cls).length;
          return (
            <Card key={`class-${cls}-${index}`} className="animate-fade-in hover:shadow-lg transition-all duration-300 border-0 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20" style={{ animationDelay: `${(index + 1) * 0.1}s` }}>
              <CardContent className="p-4">
                <div className="flex items-center">
                  <div className="p-2 bg-gradient-to-br from-green-500 to-green-600 rounded-lg">
                    <span className="text-white font-bold text-sm">{cls}</span>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-green-700 dark:text-green-300">{cls}. Sınıf</p>
                    <p className="text-2xl font-bold text-green-900 dark:text-green-100">{classStudents}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Filters */}
      <Card className="animate-slide-in">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Öğrenci adı ara..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Select value={filterClass} onValueChange={setFilterClass}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Sınıf" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tüm Sınıflar</SelectItem>
                {CLASSES.map((cls) => (
                  <SelectItem key={cls} value={cls}>
                    {cls}. Sınıf
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filterSection} onValueChange={setFilterSection}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Şube" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tüm Şubeler</SelectItem>
                {SECTIONS.map((section) => (
                  <SelectItem key={section} value={section}>
                    {section} Şubesi
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Student Lists by Class */}
      <div className="space-y-6">
        {Object.keys(groupedStudents).length === 0 ? (
          <Card className="animate-fade-in">
            <CardContent className="p-8 text-center">
              <Users className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Henüz öğrenci yok</h3>
              <p className="text-gray-500 dark:text-gray-400 mb-4">İlk öğrencinizi ekleyerek başlayın</p>
              <Button onClick={() => setShowAddStudent(true)}>
                <Plus className="mr-2 h-4 w-4" />
                İlk Öğrenciyi Ekle
              </Button>
            </CardContent>
          </Card>
        ) : (
          Object.entries(groupedStudents).map(([classSection, classStudents], groupIndex) => {
            const [cls, section] = classSection.split('-');
            return (
              <Card key={`group-${classSection}-${groupIndex}`} className="animate-fade-in hover:shadow-lg transition-all duration-300">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>{cls}. Sınıf {section} Şubesi ({classStudents.length} öğrenci)</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {classStudents.map((student, index) => (
                      <div
                        key={`student-${student.id}-${index}-${groupIndex}`}
                        className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-md transition-all duration-200 animate-slide-in"
                        style={{ animationDelay: `${index * 0.05}s` }}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                              <span className="text-white font-semibold text-sm">
                                {student.name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)}
                              </span>
                            </div>
                            <div>
                              <h4 className="font-medium text-gray-900 dark:text-white">{student.name}</h4>
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                {student.class}-{student.section}
                              </p>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteStudent(student)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* Modals */}
      <AddStudentModal
        isOpen={showAddStudent}
        onClose={() => setShowAddStudent(false)}
        onSave={handleSaveStudents}
      />

      {/* Toast Container */}
      <div className="fixed top-20 right-4 z-50 space-y-2">
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            id={toast.id}
            message={toast.message}
            type={toast.type}
            onClose={removeToast}
          />
        ))}
      </div>
    </div>
  );
}