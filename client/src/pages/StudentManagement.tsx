import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery, useMutation } from "@tanstack/react-query";
import { 
  Users, 
  UserPlus, 
  Upload, 
  Search, 
  Filter,
  Edit,
  Trash2,
  Download,
  FileText
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { parseStudentData, getGradeTheme } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

interface Student {
  id: string;
  name: string;
  surname: string;
  studentNumber: string;
  grade: number;
  section: string;
}

export default function StudentManagement() {
  const [searchTerm, setSearchTerm] = useState("");
  const [gradeFilter, setGradeFilter] = useState<number | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showBulkUpload, setShowBulkUpload] = useState(false);
  const [bulkData, setBulkData] = useState("");
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const { toast } = useToast();

  const { data: students = [], isLoading } = useQuery<Student[]>({
    queryKey: ['/api/students'],
    queryFn: () => apiRequest('/api/students'),
  });

  const createStudentMutation = useMutation({
    mutationFn: (student: Omit<Student, 'id'>) => apiRequest('/api/students', {
      method: 'POST',
      body: JSON.stringify(student),
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/students'] });
      queryClient.invalidateQueries({ queryKey: ['/api/statistics'] });
      toast({ title: "Başarılı", description: "Öğrenci başarıyla eklendi!" });
      setShowAddForm(false);
    },
    onError: () => {
      toast({ title: "Hata", description: "Öğrenci eklenirken bir hata oluştu.", variant: "destructive" });
    }
  });

  const bulkCreateMutation = useMutation({
    mutationFn: (students: Omit<Student, 'id'>[]) => apiRequest('/api/students/bulk', {
      method: 'POST',
      body: JSON.stringify({ students }),
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/students'] });
      queryClient.invalidateQueries({ queryKey: ['/api/statistics'] });
      toast({ title: "Başarılı", description: "Öğrenciler başarıyla eklendi!" });
      setShowBulkUpload(false);
      setBulkData("");
    },
    onError: () => {
      toast({ title: "Hata", description: "Toplu yükleme sırasında bir hata oluştu.", variant: "destructive" });
    }
  });

  const updateStudentMutation = useMutation({
    mutationFn: ({ id, ...student }: Student) => apiRequest(`/api/students/${id}`, {
      method: 'PUT',
      body: JSON.stringify(student),
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/students'] });
      toast({ title: "Başarılı", description: "Öğrenci bilgileri güncellendi!" });
      setEditingStudent(null);
    },
    onError: () => {
      toast({ title: "Hata", description: "Güncelleme sırasında bir hata oluştu.", variant: "destructive" });
    }
  });

  const deleteStudentMutation = useMutation({
    mutationFn: (id: string) => apiRequest(`/api/students/${id}`, {
      method: 'DELETE',
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/students'] });
      queryClient.invalidateQueries({ queryKey: ['/api/statistics'] });
      toast({ title: "Başarılı", description: "Öğrenci silindi!" });
    },
    onError: () => {
      toast({ title: "Hata", description: "Silme işlemi sırasında bir hata oluştu.", variant: "destructive" });
    }
  });

  const filteredStudents = students.filter(student => {
    const matchesSearch = searchTerm === "" || 
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.surname.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.studentNumber.includes(searchTerm);
    
    const matchesGrade = gradeFilter === null || student.grade === gradeFilter;
    
    return matchesSearch && matchesGrade;
  });

  const handleBulkUpload = () => {
    const parsedStudents = parseStudentData(bulkData);
    if (parsedStudents.length > 0) {
      bulkCreateMutation.mutate(parsedStudents);
    } else {
      toast({ 
        title: "Uyarı", 
        description: "Geçerli öğrenci verisi bulunamadı. Format: Ad Soyad NumaraSınıfŞube", 
        variant: "destructive" 
      });
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const student = {
      name: formData.get('name') as string,
      surname: formData.get('surname') as string,
      studentNumber: formData.get('studentNumber') as string,
      grade: parseInt(formData.get('grade') as string),
      section: formData.get('section') as string,
    };

    if (editingStudent) {
      updateStudentMutation.mutate({ ...student, id: editingStudent.id });
    } else {
      createStudentMutation.mutate(student);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 border-4 border-white/30 border-t-white rounded-full"
        />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <Users className="h-8 w-8" />
            Öğrenci Yönetimi
          </h1>
          <p className="text-white/80 mt-2">
            Öğrenci bilgilerini ekleyin, düzenleyin ve yönetin
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button 
            onClick={() => setShowBulkUpload(true)}
            variant="outline"
            className="glass-effect border-white/20 text-white hover:bg-white/10"
          >
            <Upload className="h-4 w-4 mr-2" />
            Toplu Yükle
          </Button>
          <Button 
            onClick={() => setShowAddForm(true)}
            className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
          >
            <UserPlus className="h-4 w-4 mr-2" />
            Öğrenci Ekle
          </Button>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[5, 6, 7, 8].map(grade => {
          const gradeStudents = students.filter(s => s.grade === grade);
          return (
            <motion.div 
              key={grade}
              whileHover={{ scale: 1.02 }}
              className={`p-4 rounded-lg glass-effect border cursor-pointer ${getGradeTheme(grade)}`}
              onClick={() => setGradeFilter(gradeFilter === grade ? null : grade)}
            >
              <div className="text-center">
                <div className="text-2xl font-bold text-white">{gradeStudents.length}</div>
                <div className="text-white/80 text-sm">{grade}. Sınıf Öğrencisi</div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Search and Filter */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Öğrenci adı, soyadı veya numarası ile ara..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant={gradeFilter === null ? "default" : "outline"}
                onClick={() => setGradeFilter(null)}
                size="sm"
              >
                Tümü
              </Button>
              {[5, 6, 7, 8].map(grade => (
                <Button
                  key={grade}
                  variant={gradeFilter === grade ? "default" : "outline"}
                  onClick={() => setGradeFilter(gradeFilter === grade ? null : grade)}
                  size="sm"
                >
                  {grade}. Sınıf
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Students List */}
      <Card>
        <CardHeader>
          <CardTitle>Öğrenci Listesi ({filteredStudents.length})</CardTitle>
          <CardDescription>
            Kayıtlı öğrencilerin listesi
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            <AnimatePresence>
              {filteredStudents.map((student) => (
                <motion.div
                  key={student.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="flex items-center justify-between p-4 rounded-lg glass-effect border hover:shadow-md transition-all"
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold ${getGradeTheme(student.grade)}`}>
                      {student.grade}
                    </div>
                    <div>
                      <div className="font-semibold">
                        {student.name} {student.surname}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        No: {student.studentNumber} | {student.grade}.{student.section}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setEditingStudent(student)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => deleteStudentMutation.mutate(student.id)}
                      disabled={deleteStudentMutation.isPending}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            
            {filteredStudents.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Öğrenci bulunamadı</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Add/Edit Student Modal */}
      <AnimatePresence>
        {(showAddForm || editingStudent) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            onClick={() => {
              setShowAddForm(false);
              setEditingStudent(null);
            }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md"
            >
              <Card>
                <CardHeader>
                  <CardTitle>
                    {editingStudent ? "Öğrenci Düzenle" : "Yeni Öğrenci Ekle"}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium">Ad</label>
                        <Input
                          name="name"
                          defaultValue={editingStudent?.name || ""}
                          required
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium">Soyad</label>
                        <Input
                          name="surname"
                          defaultValue={editingStudent?.surname || ""}
                          required
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium">Öğrenci Numarası</label>
                      <Input
                        name="studentNumber"
                        defaultValue={editingStudent?.studentNumber || ""}
                        required
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium">Sınıf</label>
                        <select
                          name="grade"
                          defaultValue={editingStudent?.grade || 5}
                          className="w-full h-10 px-3 py-2 text-sm rounded-md border border-input bg-background"
                          required
                        >
                          <option value={5}>5. Sınıf</option>
                          <option value={6}>6. Sınıf</option>
                          <option value={7}>7. Sınıf</option>
                          <option value={8}>8. Sınıf</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-sm font-medium">Şube</label>
                        <Input
                          name="section"
                          defaultValue={editingStudent?.section || "A"}
                          placeholder="A"
                          required
                        />
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setShowAddForm(false);
                          setEditingStudent(null);
                        }}
                        className="flex-1"
                      >
                        İptal
                      </Button>
                      <Button
                        type="submit"
                        disabled={createStudentMutation.isPending || updateStudentMutation.isPending}
                        className="flex-1"
                      >
                        {editingStudent ? "Güncelle" : "Ekle"}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bulk Upload Modal */}
      <AnimatePresence>
        {showBulkUpload && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            onClick={() => setShowBulkUpload(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-2xl"
            >
              <Card>
                <CardHeader>
                  <CardTitle>Toplu Öğrenci Yükleme</CardTitle>
                  <CardDescription>
                    Öğrenci bilgilerini aşağıdaki formatlardan birinde yapıştırın:
                    <br />• Ad Soyad Numara Sınıf Şube (örn: Ahmet Yılmaz 123 5 A)
                    <br />• Ad,Soyad,Numara,Sınıf,Şube (virgülle ayrılmış)
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Textarea
                    placeholder={`Ahmet Yılmaz 123 5 A
Ayşe Demir 124 5 A
Mehmet Kaya 125 5 B`}
                    value={bulkData}
                    onChange={(e) => setBulkData(e.target.value)}
                    rows={10}
                  />
                  
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setShowBulkUpload(false)}
                      className="flex-1"
                    >
                      İptal
                    </Button>
                    <Button
                      onClick={handleBulkUpload}
                      disabled={bulkCreateMutation.isPending || !bulkData.trim()}
                      className="flex-1"
                    >
                      Yükle
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}