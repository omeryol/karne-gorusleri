import { useState } from "react";
import { X, Filter, Search, Copy, Edit, Trash2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CommentCard } from "./CommentCard";
import { Comment, Student } from "@shared/schema";
import { TONE_CONFIG } from "@/lib/constants";

interface ViewAllCommentsModalProps {
  isOpen: boolean;
  onClose: () => void;
  comments: Comment[];
  students: Student[];
  onEdit: (comment: Comment) => void;
  onCopy: (comment: Comment) => void;
  onDelete?: (commentId: string) => void;
}

export function ViewAllCommentsModal({
  isOpen,
  onClose,
  comments,
  students,
  onEdit,
  onCopy,
  onDelete
}: ViewAllCommentsModalProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterTone, setFilterTone] = useState<string>("all");
  const [filterCategory, setFilterCategory] = useState<string>("all");

  const getStudentById = (studentId: string) => {
    return students.find(s => s.id === studentId);
  };

  const filteredComments = comments.filter(comment => {
    const student = getStudentById(comment.studentId);
    const matchesSearch = !searchTerm || 
      student?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      comment.text.toLowerCase().includes(searchTerm.toLowerCase()) ||
      comment.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesTone = filterTone === "all" || comment.tone === filterTone;
    const matchesCategory = filterCategory === "all" || comment.tags.includes(filterCategory);
    
    return matchesSearch && matchesTone && matchesCategory;
  });

  const uniqueCategories = Array.from(new Set(comments.flatMap(c => c.tags)));

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] blur-backdrop-strong bg-white/95 dark:bg-gray-800/95 border-0 shadow-2xl animate-fade-in">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold flex items-center justify-between">
            <span>Tüm Yorumlar ({filteredComments.length})</span>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Öğrenci adı, yorum metni veya etiket ara..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="flex gap-2">
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

              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Kategori" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tüm Kategoriler</SelectItem>
                  {uniqueCategories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Comments Grid */}
          <div className="overflow-y-auto max-h-96 space-y-4 p-2">
            {filteredComments.length === 0 ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <Filter className="mx-auto h-12 w-12 mb-4 opacity-50" />
                <p>Filtre kriterlerinize uygun yorum bulunamadı.</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {filteredComments.map((comment) => {
                  const student = getStudentById(comment.studentId);
                  if (!student) return null;
                  
                  return (
                    <div key={comment.id} className="relative group">
                      <CommentCard
                        comment={comment}
                        student={student}
                        onEdit={onEdit}
                        onCopy={onCopy}
                      />
                      {onDelete && (
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => onDelete(comment.id)}
                          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-between items-center pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Toplam {comments.length} yorum • Gösterilen {filteredComments.length}
          </div>
          <Button onClick={onClose} variant="outline">
            Kapat
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}