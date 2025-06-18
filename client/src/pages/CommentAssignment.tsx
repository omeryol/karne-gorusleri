import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery, useMutation } from "@tanstack/react-query";
import { 
  MessageSquare, 
  Users, 
  Search, 
  Filter,
  Copy,
  Eye,
  Trash2,
  Sparkles,
  BookOpen,
  Clock,
  CheckCircle,
  AlertCircle
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { personalizeComment, copyToClipboard, getGradeTheme } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

interface Student {
  id: string;
  name: string;
  surname: string;
  studentNumber: string;
  grade: number;
  section: string;
}

interface CommentTemplate {
  id: string;
  text: string;
  grade: number;
  semester: number;
  category: string;
  number: number;
}

interface StudentComment {
  id: string;
  studentId: string;
  commentText: string;
  originalTemplateId?: string;
  createdAt: string;
}

export default function CommentAssignment() {
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [selectedGrade, setSelectedGrade] = useState<number>(5);
  const [selectedSemester, setSelectedSemester] = useState<number>(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [commentText, setCommentText] = useState("");
  const [showAllComments, setShowAllComments] = useState(false);
  const [onlyPending, setOnlyPending] = useState(false);
  const { toast } = useToast();

  const { data: students = [] } = useQuery<Student[]>({
    queryKey: ['/api/students'],
    queryFn: () => apiRequest('/api/students'),
  });

  const { data: templates = [] } = useQuery<CommentTemplate[]>({
    queryKey: ['/api/comment-templates', selectedGrade, selectedSemester],
    queryFn: () => apiRequest(`/api/comment-templates?grade=${selectedGrade}&semester=${selectedSemester}`),
  });

  const { data: studentComments = [] } = useQuery<StudentComment[]>({
    queryKey: ['/api/student-comments'],
    queryFn: () => apiRequest('/api/student-comments'),
  });

  const createCommentMutation = useMutation({
    mutationFn: (comment: { studentId: string; commentText: string; originalTemplateId?: string }) => 
      apiRequest('/api/student-comments', {
        method: 'POST',
        body: JSON.stringify(comment),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/student-comments'] });
      queryClient.invalidateQueries({ queryKey: ['/api/statistics'] });
      toast({ title: "Başarılı", description: "Yorum başarıyla atandı!" });
      setCommentText("");
    },
    onError: () => {
      toast({ title: "Hata", description: "Yorum atanırken bir hata oluştu.", variant: "destructive" });
    }
  });

  const deleteCommentMutation = useMutation({
    mutationFn: (commentId: string) => apiRequest(`/api/student-comments/${commentId}`, {
      method: 'DELETE',
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/student-comments'] });
      queryClient.invalidateQueries({ queryKey: ['/api/statistics'] });
      toast({ title: "Başarılı", description: "Yorum silindi!" });
    },
    onError: () => {
      toast({ title: "Hata", description: "Yorum silinirken bir hata oluştu.", variant: "destructive" });
    }
  });

  const filteredStudents = students.filter(student => {
    const matchesSearch = searchTerm === "" || 
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.surname.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.studentNumber.includes(searchTerm);
    
    const hasComment = studentComments.some(comment => comment.studentId === student.id);
    const matchesPending = !onlyPending || !hasComment;
    
    return matchesSearch && matchesPending;
  });

  const handleTemplateSelect = (template: CommentTemplate) => {
    if (selectedStudent) {
      const personalizedText = personalizeComment(template.text, selectedStudent.name);
      setCommentText(personalizedText);
    }
  };

  const handleAssignComment = () => {
    if (selectedStudent && commentText.trim()) {
      createCommentMutation.mutate({
        studentId: selectedStudent.id,
        commentText: commentText.trim(),
      });
    }
  };

  const handleCopyComment = async (text: string) => {
    try {
      await copyToClipboard(text);
      toast({ title: "Başarılı", description: "Yorum panoya kopyalandı!" });
    } catch (error) {
      toast({ title: "Hata", description: "Kopyalama işlemi başarısız.", variant: "destructive" });
    }
  };

  const getStudentComments = (studentId: string) => {
    return studentComments.filter(comment => comment.studentId === studentId);
  };

  const studentsWithComments = students.map(student => ({
    ...student,
    comments: getStudentComments(student.id)
  })).filter(student => student.comments.length > 0);

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
            <MessageSquare className="h-8 w-8" />
            Yorum Atama
          </h1>
          <p className="text-white/80 mt-2">
            Öğrencilere özel karne yorumları oluşturun ve atayın
          </p>
        </div>
        
        <Button 
          onClick={() => setShowAllComments(true)}
          variant="outline"
          className="glass-effect border-white/20 text-white hover:bg-white/10"
        >
          <Eye className="h-4 w-4 mr-2" />
          Tüm Yorumları Görüntüle
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Student Selection */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Öğrenci Seçimi
              </CardTitle>
              <CardDescription>
                Yorum atanacak öğrenciyi seçin
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Öğrenci ara..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant={onlyPending ? "default" : "outline"}
                  onClick={() => setOnlyPending(!onlyPending)}
                >
                  <AlertCircle className="h-4 w-4 mr-1" />
                  Sadece Bekleyenler
                </Button>
              </div>

              <div className="space-y-2 max-h-96 overflow-y-auto">
                {filteredStudents.map((student) => {
                  const hasComment = studentComments.some(comment => comment.studentId === student.id);
                  return (
                    <motion.div
                      key={student.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className={`p-3 rounded-lg cursor-pointer transition-all ${
                        selectedStudent?.id === student.id
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted hover:bg-muted/80"
                      }`}
                      onClick={() => setSelectedStudent(student)}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium">
                            {student.name} {student.surname}
                          </div>
                          <div className="text-sm opacity-70">
                            {student.grade}.{student.section} - No: {student.studentNumber}
                          </div>
                        </div>
                        {hasComment && (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        )}
                      </div>
                    </motion.div>
                  );
                })}
                
                {filteredStudents.length === 0 && (
                  <div className="text-center py-4 text-muted-foreground">
                    <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Öğrenci bulunamadı</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Selected Student Info */}
          {selectedStudent && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle>Seçili Öğrenci</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className={`p-4 rounded-lg ${getGradeTheme(selectedStudent.grade)}`}>
                    <div className="text-white">
                      <div className="font-bold text-lg">
                        {selectedStudent.name} {selectedStudent.surname}
                      </div>
                      <div className="text-white/80">
                        {selectedStudent.grade}. Sınıf {selectedStudent.section} Şubesi
                      </div>
                      <div className="text-white/80">
                        Öğrenci No: {selectedStudent.studentNumber}
                      </div>
                    </div>
                  </div>
                  
                  {/* Existing Comments */}
                  {getStudentComments(selectedStudent.id).length > 0 && (
                    <div className="mt-4 space-y-2">
                      <div className="text-sm font-medium">Mevcut Yorumlar:</div>
                      {getStudentComments(selectedStudent.id).map((comment) => (
                        <div key={comment.id} className="p-2 bg-muted rounded text-sm">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 line-clamp-2">{comment.commentText}</div>
                            <div className="flex gap-1">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleCopyComment(comment.commentText)}
                              >
                                <Copy className="h-3 w-3" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => deleteCommentMutation.mutate(comment.id)}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>

        {/* Template Selection */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Yorum Şablonları
              </CardTitle>
              <CardDescription>
                Sınıf ve dönem seçerek uygun şablonları görüntüleyin
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-sm font-medium">Sınıf</label>
                  <select
                    value={selectedGrade}
                    onChange={(e) => setSelectedGrade(parseInt(e.target.value))}
                    className="w-full h-10 px-3 py-2 text-sm rounded-md border border-input bg-background"
                  >
                    <option value={5}>5. Sınıf</option>
                    <option value={6}>6. Sınıf</option>
                    <option value={7}>7. Sınıf</option>
                    <option value={8}>8. Sınıf</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium">Dönem</label>
                  <select
                    value={selectedSemester}
                    onChange={(e) => setSelectedSemester(parseInt(e.target.value))}
                    className="w-full h-10 px-3 py-2 text-sm rounded-md border border-input bg-background"
                  >
                    <option value={1}>1. Dönem</option>
                    <option value={2}>2. Dönem</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2 max-h-96 overflow-y-auto">
                {templates.map((template) => (
                  <motion.div
                    key={template.id}
                    whileHover={{ scale: 1.01 }}
                    className="p-3 rounded-lg bg-muted cursor-pointer hover:bg-muted/80 transition-all"
                    onClick={() => handleTemplateSelect(template)}
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="text-sm font-medium">
                        Şablon #{template.number}
                      </div>
                      <Sparkles className="h-4 w-4 text-primary" />
                    </div>
                    <div className="text-sm text-muted-foreground line-clamp-3">
                      {template.text}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {template.text.length} karakter
                    </div>
                  </motion.div>
                ))}
                
                {templates.length === 0 && (
                  <div className="text-center py-4 text-muted-foreground">
                    <BookOpen className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Şablon bulunamadı</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Comment Editor */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Yorum Düzenleyici
              </CardTitle>
              <CardDescription>
                Yorumu düzenleyin ve öğrenciye atayın
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {!selectedStudent && (
                <div className="text-center py-8 text-muted-foreground">
                  <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Önce bir öğrenci seçin</p>
                </div>
              )}
              
              {selectedStudent && (
                <>
                  <div>
                    <label className="text-sm font-medium">Yorum Metni</label>
                    <Textarea
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      placeholder="Yorum metnini yazın veya şablon seçin..."
                      className="min-h-[200px] mt-1"
                      maxLength={500}
                    />
                    <div className="flex justify-between items-center mt-2 text-xs text-muted-foreground">
                      <span>Maksimum 500 karakter</span>
                      <span className={commentText.length > 500 ? "text-destructive" : ""}>
                        {commentText.length}/500
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleCopyComment(commentText)}
                      variant="outline"
                      disabled={!commentText.trim()}
                      className="flex-1"
                    >
                      <Copy className="h-4 w-4 mr-2" />
                      Kopyala
                    </Button>
                    <Button
                      onClick={handleAssignComment}
                      disabled={!commentText.trim() || commentText.length > 500 || createCommentMutation.isPending}
                      className="flex-1"
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Atama
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* All Comments Modal */}
      <AnimatePresence>
        {showAllComments && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            onClick={() => setShowAllComments(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-4xl max-h-[80vh] overflow-hidden"
            >
              <Card>
                <CardHeader>
                  <CardTitle>Tüm Atanan Yorumlar</CardTitle>
                  <CardDescription>
                    Öğrencilere atanmış tüm yorumların listesi
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 max-h-[60vh] overflow-y-auto">
                  {studentsWithComments.map((student) => (
                    <div key={student.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="font-semibold">
                          {student.name} {student.surname}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {student.grade}.{student.section} - No: {student.studentNumber}
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        {student.comments.map((comment) => (
                          <div key={comment.id} className="bg-muted p-3 rounded">
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1 text-sm">{comment.commentText}</div>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleCopyComment(comment.commentText)}
                              >
                                <Copy className="h-4 w-4" />
                              </Button>
                            </div>
                            <div className="text-xs text-muted-foreground mt-2">
                              {new Date(comment.createdAt).toLocaleDateString('tr-TR')} • {comment.commentText.length} karakter
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                  
                  {studentsWithComments.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>Henüz atanmış yorum bulunmuyor</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}