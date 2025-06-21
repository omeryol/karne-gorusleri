import { useState } from "react";
import { X, Plus } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Student } from "@shared/schema";
import { CLASSES, SECTIONS } from "@/lib/constants";

interface AddStudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (students: Omit<Student, "id" | "createdAt">[]) => void;
}

export function AddStudentModal({ isOpen, onClose, onSave }: AddStudentModalProps) {
  const [activeTab, setActiveTab] = useState("single");
  const [singleStudent, setSingleStudent] = useState({
    name: "",
    class: "5" as const,
    section: "A" as const
  });
  const [bulkStudents, setBulkStudents] = useState({
    names: "",
    class: "5" as const,
    section: "A" as const
  });

  const handleSingleSubmit = () => {
    if (!singleStudent.name.trim()) return;
    
    onSave([singleStudent]);
    setSingleStudent({ name: "", class: "5", section: "A" });
    onClose();
  };

  const handleBulkSubmit = () => {
    const names = bulkStudents.names
      .split("\n")
      .map(name => name.trim())
      .filter(name => name.length > 0);
    
    if (names.length === 0) return;
    
    const students = names.map(name => ({
      name,
      class: bulkStudents.class,
      section: bulkStudents.section
    }));
    
    onSave(students);
    setBulkStudents({ names: "", class: "5", section: "A" });
    onClose();
  };

  const handleClose = () => {
    setSingleStudent({ name: "", class: "5", section: "A" });
    setBulkStudents({ names: "", class: "5", section: "A" });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg blur-backdrop-strong bg-white/95 dark:bg-gray-800/95 border-0 shadow-2xl animate-fade-in">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Öğrenci Ekle</DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="single">Tekil Ekleme</TabsTrigger>
            <TabsTrigger value="bulk">Toplu Ekleme</TabsTrigger>
          </TabsList>

          <TabsContent value="single" className="space-y-4 mt-6">
            <div>
              <Label htmlFor="single-name">Öğrenci Adı Soyadı</Label>
              <Input
                id="single-name"
                placeholder="Örnek: Ayşe Yılmaz"
                value={singleStudent.name}
                onChange={(e) => setSingleStudent(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Sınıf</Label>
                <Select 
                  value={singleStudent.class} 
                  onValueChange={(value: any) => setSingleStudent(prev => ({ ...prev, class: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
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
              <div>
                <Label>Şube</Label>
                <Select 
                  value={singleStudent.section} 
                  onValueChange={(value: any) => setSingleStudent(prev => ({ ...prev, section: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
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
            </div>

            <div className="flex space-x-3 mt-6">
              <Button onClick={handleSingleSubmit} className="flex-1">
                <Plus className="mr-2 h-4 w-4" />
                Ekle
              </Button>
              <Button variant="outline" onClick={handleClose}>
                İptal
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="bulk" className="space-y-4 mt-6">
            <div>
              <Label htmlFor="bulk-names">Öğrenci Listesi (Her satıra bir isim)</Label>
              <Textarea
                id="bulk-names"
                placeholder="Ayşe Yılmaz&#10;Mehmet Kaya&#10;Fatma Demir"
                rows={8}
                value={bulkStudents.names}
                onChange={(e) => setBulkStudents(prev => ({ ...prev, names: e.target.value }))}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Sınıf</Label>
                <Select 
                  value={bulkStudents.class} 
                  onValueChange={(value: any) => setBulkStudents(prev => ({ ...prev, class: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
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
              <div>
                <Label>Şube</Label>
                <Select 
                  value={bulkStudents.section} 
                  onValueChange={(value: any) => setBulkStudents(prev => ({ ...prev, section: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
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
            </div>

            <div className="flex space-x-3 mt-6">
              <Button onClick={handleBulkSubmit} className="flex-1">
                <Plus className="mr-2 h-4 w-4" />
                Ekle
              </Button>
              <Button variant="outline" onClick={handleClose}>
                İptal
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
