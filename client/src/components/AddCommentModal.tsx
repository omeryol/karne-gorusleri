import { useState, useEffect } from "react";
import { Sparkles, Save, ChevronLeft, ChevronRight, Users, FileText } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Comment, Student } from "@shared/schema";
import { TONE_CONFIG } from "@/lib/constants";
import { getTemplatesForClassAndSemester, replaceNamePlaceholder } from "@/data/templates/index";

interface AddCommentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (comment: Omit<Comment, "id" | "createdAt" | "updatedAt">) => void;
  students: Student[];
  selectedClass: string;
  selectedSection: string;
  selectedSemester: string;
  editingComment?: Comment | null;
  comments?: Comment[];
  onViewAllComments?: () => void;
}

export function AddCommentModal({
  isOpen,
  onClose,
  onSave,
  students,
  selectedClass,
  selectedSection,
  selectedSemester,
  editingComment,
  comments = [],
  onViewAllComments
}: AddCommentModalProps) {
  const [selectedStudent, setSelectedStudent] = useState("");
  const [selectedTone, setSelectedTone] = useState<"positive" | "neutral" | "negative">("positive");
  const [commentText, setCommentText] = useState("");
  const [showAISuggestions, setShowAISuggestions] = useState(false);
  const [currentStudentIndex, setCurrentStudentIndex] = useState(0);
  const [currentCommentIndex, setCurrentCommentIndex] = useState(0);

  const charCount = commentText.length;
  const maxChars = 500;

  useEffect(() => {
    if (editingComment) {
      setSelectedStudent(editingComment.studentId);
      setSelectedTone(editingComment.tone);
      setCommentText(editingComment.text);
    } else {
      setSelectedStudent("");
      setSelectedTone("positive");
      setCommentText("");
    }
  }, [editingComment, isOpen]);

  const handleSave = () => {
    if (!selectedStudent || !commentText.trim()) return;

    onSave({
      studentId: selectedStudent,
      class: selectedClass as any,
      section: selectedSection as any,
      semester: selectedSemester as any,
      text: commentText.trim(),
      tone: selectedTone,
      tags: extractTags(commentText)
    });

    handleClose();
  };

  const handleClose = () => {
    setSelectedStudent("");
    setSelectedTone("positive");
    setCommentText("");
    setShowAISuggestions(false);
    onClose();
  };

  const extractTags = (text: string): string[] => {
    const keywords = [
      "matematik", "başarılı", "aktif-katılım", "ödev-düzenli", "dikkatli",
      "problem-çözme", "pratik", "çalışma-alışkanlığı", "performans",
      "türkçe", "yaratıcı", "okuma", "tartışma", "fen-bilgisi",
      "meraklı", "araştırmacı", "deney", "sorumluluk"
    ];
    
    return keywords.filter(keyword => 
      text.toLowerCase().includes(keyword.replace("-", " "))
    );
  };

  const getSuggestions = () => {
    const templates = getTemplatesForClassAndSemester(selectedClass, selectedSemester);
    return templates.filter(template => template.tone === selectedTone);
  };

  const applySuggestion = (suggestionTemplate: any) => {
    const selectedStudentData = students.find(s => s.id === selectedStudent);
    if (selectedStudentData) {
      const processedTemplate = replaceNamePlaceholder(suggestionTemplate, selectedStudentData.name);
      setCommentText(processedTemplate.text);
    } else {
      setCommentText(suggestionTemplate.text);
    }
    setShowAISuggestions(false);
  };

  const navigateStudent = (direction: 'prev' | 'next') => {
    const currentIndex = students.findIndex(s => s.id === selectedStudent);
    let newIndex;
    
    if (direction === 'prev') {
      newIndex = currentIndex > 0 ? currentIndex - 1 : students.length - 1;
    } else {
      newIndex = currentIndex < students.length - 1 ? currentIndex + 1 : 0;
    }
    
    if (students[newIndex]) {
      setSelectedStudent(students[newIndex].id);
      // Update placeholder text when student changes
      const studentName = students[newIndex].name.split(" ")[0];
      if (commentText.includes("{name}")) {
        setCommentText(commentText.replace(/{name}/g, studentName));
      }
    }
  };

  const navigateComment = (direction: 'prev' | 'next') => {
    if (comments.length === 0) return;
    
    let newIndex;
    if (direction === 'prev') {
      newIndex = currentCommentIndex > 0 ? currentCommentIndex - 1 : comments.length - 1;
    } else {
      newIndex = currentCommentIndex < comments.length - 1 ? currentCommentIndex + 1 : 0;
    }
    
    setCurrentCommentIndex(newIndex);
    const comment = comments[newIndex];
    if (comment) {
      setSelectedStudent(comment.studentId);
      setSelectedTone(comment.tone);
      setCommentText(comment.text);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl blur-backdrop-strong bg-white/95 dark:bg-gray-800/95 max-h-[90vh] overflow-y-auto border-0 shadow-2xl animate-fade-in">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            {editingComment ? "Yorum Düzenle" : "Yorum Ekle"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Navigation and Student Selection */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Öğrenci Seç</Label>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigateStudent('prev')}
                  disabled={students.length <= 1}
                  className="px-2"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm text-gray-500 dark:text-gray-400 px-2">
                  {students.findIndex(s => s.id === selectedStudent) + 1} / {students.length}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigateStudent('next')}
                  disabled={students.length <= 1}
                  className="px-2"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            <Select value={selectedStudent} onValueChange={setSelectedStudent}>
              <SelectTrigger>
                <SelectValue placeholder="Öğrenci seçiniz..." />
              </SelectTrigger>
              <SelectContent>
                {students.map((student) => (
                  <SelectItem key={student.id} value={student.id}>
                    {student.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Comment Navigation */}
            {comments.length > 0 && (
              <div className="flex items-center justify-between bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3">
                <div className="flex items-center space-x-2">
                  <FileText className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                    Mevcut Yorumlar
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigateComment('prev')}
                    className="px-2"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="text-sm text-blue-600 dark:text-blue-400 px-2">
                    {currentCommentIndex + 1} / {comments.length}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigateComment('next')}
                    className="px-2"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                  {onViewAllComments && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={onViewAllComments}
                      className="ml-2"
                    >
                      <Users className="h-4 w-4 mr-1" />
                      Tümü
                    </Button>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Comment Tone */}
          <div>
            <Label className="mb-3 block">Yorum Tonu</Label>
            <div className="flex space-x-3">
              {Object.entries(TONE_CONFIG).map(([tone, config]) => (
                <Button
                  key={tone}
                  variant={selectedTone === tone ? "default" : "outline"}
                  onClick={() => setSelectedTone(tone as any)}
                  className={`flex-1 ${
                    selectedTone === tone
                      ? tone === "positive"
                        ? "bg-green-500 hover:bg-green-600"
                        : tone === "neutral"
                        ? "bg-yellow-500 hover:bg-yellow-600"
                        : "bg-red-500 hover:bg-red-600"
                      : ""
                  }`}
                >
                  {config.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Comment Editor */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <Label>Yorum Metni</Label>
              <div className="flex items-center space-x-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowAISuggestions(!showAISuggestions)}
                  className="bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0 hover:from-purple-600 hover:to-pink-600"
                >
                  <Sparkles className="mr-1 h-4 w-4" />
                  AI Öneri
                </Button>
                <span className={`text-sm ${charCount > 450 ? 'text-red-500' : charCount > 400 ? 'text-yellow-500' : 'text-gray-500 dark:text-gray-400'}`}>
                  {charCount}/{maxChars}
                </span>
              </div>
            </div>
            
            <Textarea
              rows={6}
              maxLength={maxChars}
              placeholder={
                selectedStudent 
                  ? `${students.find(s => s.id === selectedStudent)?.name.split(" ")[0] || "Öğrenci"} hakkındaki yorumunuzu buraya yazınız...`
                  : "Öğrenci hakkındaki yorumunuzu buraya yazınız..."
              }
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              className="resize-none"
            />
            
            {/* AI Suggestions Panel */}
            {showAISuggestions && (
              <div className="mt-3 p-4 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
                <h4 className="text-sm font-medium text-purple-700 dark:text-purple-300 mb-2">
                  <Sparkles className="inline mr-1 h-4 w-4" />
                  AI Önerileri
                </h4>
                <div className="space-y-2">
                  {getSuggestions().map((suggestion) => (
                    <div
                      key={suggestion.id}
                      onClick={() => applySuggestion(suggestion)}
                      className="p-2 bg-white dark:bg-gray-800 rounded cursor-pointer hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors text-sm text-gray-700 dark:text-gray-300"
                    >
                      {suggestion.text}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex space-x-3 mt-6">
          <Button onClick={handleSave} className="flex-1" disabled={!selectedStudent || !commentText.trim()}>
            <Save className="mr-2 h-4 w-4" />
            Kaydet
          </Button>
          <Button variant="outline" onClick={handleClose}>
            İptal
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
