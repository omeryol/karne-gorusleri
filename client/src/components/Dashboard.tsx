import { useState, useEffect } from "react";
import { Users, CheckCircle, Clock, FileText, UserPlus, MessageSquare, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CommentCard } from "./CommentCard";
import { AddStudentModal } from "./AddStudentModal";
import { AddCommentModal } from "./AddCommentModal";
import { ViewAllCommentsModal } from "./ViewAllCommentsModal";
import { Toast } from "./Toast";
import { Student, Comment } from "@shared/schema";
import { storage } from "@/lib/storage";
import { CLASS_COLORS } from "@/lib/constants";

interface DashboardProps {
  selectedClass: string;
  selectedSection: string;
  selectedSemester: string;
}

interface ToastMessage {
  id: string;
  message: string;
  type: "success" | "error" | "warning" | "info";
}

export function Dashboard({ selectedClass, selectedSection, selectedSemester }: DashboardProps) {
  const [students, setStudents] = useState<Student[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [showAddStudent, setShowAddStudent] = useState(false);
  const [showAddComment, setShowAddComment] = useState(false);
  const [showAllComments, setShowAllComments] = useState(false);
  const [editingComment, setEditingComment] = useState<Comment | null>(null);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  useEffect(() => {
    loadData();
  }, [selectedClass, selectedSection, selectedSemester]);

  const loadData = () => {
    const studentsData = storage.getStudents(selectedClass, selectedSection);
    const commentsData = storage.getComments(selectedClass, selectedSection, selectedSemester);
    setStudents(studentsData);
    setComments(commentsData);
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
    
    loadData();
    addToast(`${newStudents.length} öğrenci başarıyla eklendi`, "success");
  };

  const handleSaveComment = (commentData: Omit<Comment, "id" | "createdAt" | "updatedAt">) => {
    const comment: Comment = {
      ...commentData,
      id: editingComment?.id || Math.random().toString(36).substr(2, 9),
      createdAt: editingComment?.createdAt || new Date(),
      updatedAt: new Date()
    };
    
    storage.saveComment(comment);
    loadData();
    setEditingComment(null);
    addToast(editingComment ? "Yorum güncellendi" : "Yorum eklendi", "success");
  };

  const handleEditComment = (comment: Comment) => {
    setEditingComment(comment);
    setShowAddComment(true);
  };

  const handleCopyComment = (comment: Comment) => {
    navigator.clipboard.writeText(comment.text);
    addToast("Yorum panoya kopyalandı", "info");
  };

  const handleDeleteComment = (commentId: string) => {
    storage.deleteComment(commentId, selectedClass, selectedSemester);
    loadData();
    addToast("Yorum silindi", "success");
  };

  const getRecentComments = () => {
    return comments
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      .slice(0, 5);
  };

  const getStudentById = (id: string) => {
    return students.find(s => s.id === id);
  };

  const completedComments = comments.length;
  const pendingComments = students.length - completedComments;

  return (
    <div className="flex-1">
      {/* Mobile Header */}
      <div className="lg:hidden bg-white dark:bg-gray-800 shadow-sm p-4">
        <h1 className="text-lg font-semibold text-gray-900 dark:text-white">Karne Sistemi</h1>
      </div>

      {/* Hero Section with Dynamic Background */}
      <div className="relative overflow-hidden">
        <div className={`absolute inset-0 bg-gradient-to-br ${CLASS_COLORS[selectedClass as keyof typeof CLASS_COLORS]} opacity-90`} />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
        
        <div className="relative px-6 py-16 lg:py-24">
          <div className="max-w-4xl mx-auto text-center text-white">
            <h1 className="text-3xl lg:text-4xl font-bold mb-4">
              Karne Asistanı
            </h1>
            <p className="text-lg lg:text-xl mb-6 opacity-90">
              {selectedClass}. Sınıf {selectedSection} Şubesi - {selectedSemester}. Dönem
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                onClick={() => setShowAddStudent(true)}
                className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-4 text-lg shadow-lg transform hover:scale-105 transition-all duration-200 animate-bounce-in"
              >
                <UserPlus className="mr-2 h-5 w-5" />
                Öğrenci Ekle
              </Button>
              <Button
                onClick={() => setShowAddComment(true)}
                variant="outline"
                className="bg-white/20 text-white border-white/30 hover:bg-white/30 px-8 py-4 text-lg blur-backdrop transform hover:scale-105 transition-all duration-200 animate-bounce-in"
                style={{ animationDelay: '0.2s' }}
              >
                <MessageSquare className="mr-2 h-5 w-5" />
                Yorum Ekle
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Dashboard Stats */}
      <div className="px-6 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="animate-fade-in hover:shadow-xl transition-all duration-300 animate-pulse-hover border-0 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg">
                    <Users className="text-white h-6 w-6" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-blue-700 dark:text-blue-300">Toplam Öğrenci</p>
                    <p className="text-3xl font-bold text-blue-900 dark:text-blue-100">{students.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="animate-fade-in hover:shadow-xl transition-all duration-300 animate-pulse-hover border-0 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20" style={{ animationDelay: '0.1s' }}>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-3 bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg">
                    <CheckCircle className="text-white h-6 w-6" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-green-700 dark:text-green-300">Tamamlanan Yorumlar</p>
                    <p className="text-3xl font-bold text-green-900 dark:text-green-100">{completedComments}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="animate-fade-in hover:shadow-xl transition-all duration-300 animate-pulse-hover border-0 bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20" style={{ animationDelay: '0.2s' }}>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-3 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl shadow-lg">
                    <Clock className="text-white h-6 w-6" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-yellow-700 dark:text-yellow-300">Bekleyen Yorumlar</p>
                    <p className="text-3xl font-bold text-yellow-900 dark:text-yellow-100">{pendingComments}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="animate-fade-in hover:shadow-xl transition-all duration-300 animate-pulse-hover border-0 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20" style={{ animationDelay: '0.3s' }}>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg">
                    <FileText className="text-white h-6 w-6" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-purple-700 dark:text-purple-300">Şablon Sayısı</p>
                    <p className="text-3xl font-bold text-purple-900 dark:text-purple-100">80</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Comments */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Son Yorumlar</h2>
                <Button 
                  variant="ghost" 
                  className="text-blue-600 dark:text-blue-400"
                  onClick={() => setShowAllComments(true)}
                >
                  <Eye className="mr-2 h-4 w-4" />
                  Tümünü Gör
                </Button>
              </div>

              <div className="space-y-4">
                {getRecentComments().length === 0 ? (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    <MessageSquare className="mx-auto h-12 w-12 mb-4 opacity-50" />
                    <p>Henüz yorum eklenmemiş</p>
                    <Button 
                      onClick={() => setShowAddComment(true)}
                      variant="outline" 
                      className="mt-4"
                    >
                      İlk Yorumu Ekle
                    </Button>
                  </div>
                ) : (
                  getRecentComments().map((comment) => {
                    const student = getStudentById(comment.studentId);
                    if (!student) return null;
                    
                    return (
                      <CommentCard
                        key={comment.id}
                        comment={comment}
                        student={student}
                        onEdit={handleEditComment}
                        onCopy={handleCopyComment}
                      />
                    );
                  })
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Modals */}
      <AddStudentModal
        isOpen={showAddStudent}
        onClose={() => setShowAddStudent(false)}
        onSave={handleSaveStudents}
      />

      <AddCommentModal
        isOpen={showAddComment}
        onClose={() => {
          setShowAddComment(false);
          setEditingComment(null);
        }}
        onSave={handleSaveComment}
        students={students}
        selectedClass={selectedClass}
        selectedSection={selectedSection}
        selectedSemester={selectedSemester}
        editingComment={editingComment}
        comments={comments}
        onViewAllComments={() => {
          setShowAddComment(false);
          setShowAllComments(true);
        }}
      />

      <ViewAllCommentsModal
        isOpen={showAllComments}
        onClose={() => setShowAllComments(false)}
        comments={comments}
        students={students}
        onEdit={(comment) => {
          setEditingComment(comment);
          setShowAllComments(false);
          setShowAddComment(true);
        }}
        onCopy={handleCopyComment}
        onDelete={handleDeleteComment}
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
