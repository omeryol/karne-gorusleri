import { useState, useEffect } from "react";
import { FileText, Plus, Search, Filter, Eye, Download, BarChart3, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CommentCard } from "@/components/CommentCard";
import { AddCommentModal } from "@/components/AddCommentModal";
import { ViewAllCommentsModal } from "@/components/ViewAllCommentsModal";
import { Toast } from "@/components/Toast";
import { Comment, Student } from "@shared/schema";
import { storage } from "@/lib/storage";
import { CLASSES, SECTIONS, SEMESTERS, TONE_CONFIG } from "@/lib/constants";

interface CommentsPageProps {
  selectedClass: string;
  selectedSection: string;
  selectedSemester: string;
}

interface ToastMessage {
  id: string;
  message: string;
  type: "success" | "error" | "warning" | "info";
}

export default function CommentsPage({ selectedClass, selectedSection, selectedSemester }: CommentsPageProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [filteredComments, setFilteredComments] = useState<Comment[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterTone, setFilterTone] = useState<string>("all");
  const [filterClass, setFilterClass] = useState(selectedClass);
  const [filterSection, setFilterSection] = useState(selectedSection);
  const [filterSemester, setFilterSemester] = useState(selectedSemester);
  const [showAddComment, setShowAddComment] = useState(false);
  const [showAllComments, setShowAllComments] = useState(false);
  const [editingComment, setEditingComment] = useState<Comment | null>(null);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  useEffect(() => {
    loadData();
  }, [filterClass, filterSection, filterSemester]);

  useEffect(() => {
    filterComments();
  }, [comments, searchTerm, filterTone]);

  const loadData = () => {
    const commentsData = storage.getComments(filterClass, filterSection, filterSemester);
    const studentsData = storage.getStudents(filterClass, filterSection);
    setComments(commentsData);
    setStudents(studentsData);
  };

  const filterComments = () => {
    let filtered = comments;

    if (searchTerm) {
      filtered = filtered.filter(comment => {
        const student = getStudentById(comment.studentId);
        return comment.text.toLowerCase().includes(searchTerm.toLowerCase()) ||
               student?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
               comment.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
      });
    }

    if (filterTone !== "all") {
      filtered = filtered.filter(comment => comment.tone === filterTone);
    }

    setFilteredComments(filtered);
  };

  const addToast = (message: string, type: ToastMessage["type"] = "info") => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts(prev => [...prev, { id, message, type }]);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  const getStudentById = (studentId: string) => {
    return students.find(s => s.id === studentId);
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
    storage.deleteComment(commentId, filterClass, filterSemester);
    loadData();
    addToast("Yorum silindi", "success");
  };

  const exportComments = () => {
    const data = comments.map(comment => {
      const student = getStudentById(comment.studentId);
      return {
        studentName: student?.name || "Bilinmeyen",
        class: comment.class,
        section: comment.section,
        semester: comment.semester,
        text: comment.text,
        tone: comment.tone,
        tags: comment.tags,
        createdAt: comment.createdAt,
        updatedAt: comment.updatedAt
      };
    });
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `yorumlar-${filterClass}-${filterSection}-${filterSemester}.json`;
    a.click();
    addToast("Yorumlar indirildi", "success");
  };

  const getCommentStats = () => {
    const allComments = comments;
    const byTone = allComments.reduce((acc, comment) => {
      acc[comment.tone] = (acc[comment.tone] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const completedStudents = new Set(allComments.map(c => c.studentId)).size;
    const totalStudents = students.length;
    const completionRate = totalStudents > 0 ? Math.round((completedStudents / totalStudents) * 100) : 0;

    return {
      total: allComments.length,
      byTone,
      completedStudents,
      totalStudents,
      completionRate,
      pendingStudents: totalStudents - completedStudents
    };
  };

  const stats = getCommentStats();

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Karne Yorumları</h1>
          <p className="text-gray-600 dark:text-gray-400">
            {filterClass}. Sınıf {filterSection} Şubesi - {filterSemester}. Dönem
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={exportComments} variant="outline" className="animate-bounce-in">
            <Download className="mr-2 h-4 w-4" />
            Dışa Aktar
          </Button>
          <Button onClick={() => setShowAllComments(true)} variant="outline" className="animate-bounce-in" style={{ animationDelay: '0.1s' }}>
            <Eye className="mr-2 h-4 w-4" />
            Tümünü Gör
          </Button>
          <Button onClick={() => setShowAddComment(true)} className="animate-bounce-in" style={{ animationDelay: '0.2s' }}>
            <Plus className="mr-2 h-4 w-4" />
            Yorum Ekle
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="animate-fade-in hover:shadow-lg transition-all duration-300 border-0 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20">
          <CardContent className="p-4">
            <div className="flex items-center">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg">
                <FileText className="text-white h-5 w-5" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-blue-700 dark:text-blue-300">Toplam Yorum</p>
                <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="animate-fade-in hover:shadow-lg transition-all duration-300 border-0 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20" style={{ animationDelay: '0.1s' }}>
          <CardContent className="p-4">
            <div className="flex items-center">
              <div className="p-2 bg-gradient-to-br from-green-500 to-green-600 rounded-lg">
                <TrendingUp className="text-white h-5 w-5" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-green-700 dark:text-green-300">Tamamlanma</p>
                <p className="text-2xl font-bold text-green-900 dark:text-green-100">{stats.completionRate}%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="animate-fade-in hover:shadow-lg transition-all duration-300 border-0 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20" style={{ animationDelay: '0.2s' }}>
          <CardContent className="p-4">
            <div className="flex items-center">
              <div className="p-2 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg">
                <BarChart3 className="text-white h-5 w-5" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-purple-700 dark:text-purple-300">Olumlu Yorum</p>
                <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">{stats.byTone.positive || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="animate-fade-in hover:shadow-lg transition-all duration-300 border-0 bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20" style={{ animationDelay: '0.3s' }}>
          <CardContent className="p-4">
            <div className="flex items-center">
              <div className="p-2 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-lg">
                <span className="text-white font-bold text-sm">{stats.pendingStudents}</span>
              </div>
              <div className="ml-3">
                <p className="text-sm text-yellow-700 dark:text-yellow-300">Bekleyen</p>
                <p className="text-2xl font-bold text-yellow-900 dark:text-yellow-100">{stats.pendingStudents}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Class Selection and Filters */}
      <Card className="animate-slide-in">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex gap-2">
              <Select value={filterClass} onValueChange={setFilterClass}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Sınıf" />
                </SelectTrigger>
                <SelectContent>
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
                  {SECTIONS.map((section) => (
                    <SelectItem key={section} value={section}>
                      {section} Şubesi
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={filterSemester} onValueChange={setFilterSemester}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Dönem" />
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

            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Yorum, öğrenci adı veya etiket ara..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Select value={filterTone} onValueChange={setFilterTone}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Ton" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tüm Tonlar</SelectItem>
                {Object.entries(TONE_CONFIG).map(([tone, config]) => (
                  <SelectItem key={tone} value={tone}>
                    {config.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Comments List */}
      <div className="space-y-4">
        {filteredComments.length === 0 ? (
          <Card className="animate-fade-in">
            <CardContent className="p-8 text-center">
              <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                {comments.length === 0 ? "Henüz yorum yok" : "Filtreye uygun yorum bulunamadı"}
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                {comments.length === 0 
                  ? "İlk yorumunuzu ekleyerek başlayın" 
                  : "Arama kriterlerinizi değiştirin"}
              </p>
              <Button onClick={() => setShowAddComment(true)}>
                <Plus className="mr-2 h-4 w-4" />
                {comments.length === 0 ? "İlk Yorumu Ekle" : "Yorum Ekle"}
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {filteredComments.map((comment, index) => {
              const student = getStudentById(comment.studentId);
              if (!student) return null;
              
              return (
                <div key={comment.id} style={{ animationDelay: `${index * 0.05}s` }}>
                  <CommentCard
                    comment={comment}
                    student={student}
                    onEdit={handleEditComment}
                    onCopy={handleCopyComment}
                  />
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modals */}
      <AddCommentModal
        isOpen={showAddComment}
        onClose={() => {
          setShowAddComment(false);
          setEditingComment(null);
        }}
        onSave={handleSaveComment}
        students={students}
        selectedClass={filterClass}
        selectedSection={filterSection}
        selectedSemester={filterSemester}
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