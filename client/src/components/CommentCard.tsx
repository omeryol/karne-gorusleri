import { formatDistanceToNow } from "date-fns";
import { tr } from "date-fns/locale";
import { Edit, Copy } from "lucide-react";
import { Comment, Student } from "@shared/schema";
import { TONE_CONFIG } from "@/lib/constants";

interface CommentCardProps {
  comment: Comment;
  student: Student;
  onEdit: (comment: Comment) => void;
  onCopy: (comment: Comment) => void;
}

export function CommentCard({ comment, student, onEdit, onCopy }: CommentCardProps) {
  const toneConfig = TONE_CONFIG[comment.tone];
  
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map(n => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className={`${toneConfig.bgColor} border ${toneConfig.borderColor} rounded-lg p-4 animate-fade-in hover:shadow-lg transition-all duration-300`}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-3">
          <div className={`w-10 h-10 ${toneConfig.bgColor} rounded-full flex items-center justify-center`}>
            <span className={`${toneConfig.textColor} font-semibold text-sm`}>
              {getInitials(student.name)}
            </span>
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 dark:text-white">{student.name}</h4>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {student.class}-{student.section} / {comment.semester}. Dönem
            </p>
          </div>
        </div>
        <span className={`px-2 py-1 ${toneConfig.badgeColor} text-xs rounded-full`}>
          {toneConfig.label}
        </span>
      </div>
      
      <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed mb-3">
        {comment.text}
      </p>
      
      {comment.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {comment.tags.map((tag, index) => (
            <span
              key={index}
              className="px-2 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 text-xs rounded-full"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}
      
      <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
        <span>
          Son güncelleme: {formatDistanceToNow(new Date(comment.updatedAt), { addSuffix: true, locale: tr })}
        </span>
        <div className="flex space-x-2">
          <button
            onClick={() => onEdit(comment)}
            className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
          >
            <Edit className="h-4 w-4" />
          </button>
          <button
            onClick={() => onCopy(comment)}
            className="hover:text-yellow-600 dark:hover:text-yellow-400 transition-colors"
          >
            <Copy className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
