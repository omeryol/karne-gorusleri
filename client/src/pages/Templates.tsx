import { useState, useEffect } from "react";
import { MessageSquare, Plus, Search, Filter, Edit, Copy, Trash2, Tag, Heart, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Template } from "@shared/schema";
import { TONE_CONFIG, CLASSES, SEMESTERS } from "@/lib/constants";
import { getTemplatesForClassAndSemester } from "@/data/templates/index";
import { storage } from "@/lib/storage";

interface TemplatesPageProps {
  selectedClass: string;
  selectedSection: string;
  selectedSemester: string;
}

export default function TemplatesPage({ selectedClass, selectedSection, selectedSemester }: TemplatesPageProps) {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [filteredTemplates, setFilteredTemplates] = useState<Template[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterTone, setFilterTone] = useState<string>("all");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [filterClass, setFilterClass] = useState(selectedClass);
  const [filterSemester, setFilterSemester] = useState(selectedSemester);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);
  const [favorites, setFavorites] = useState<string[]>([]);

  // Create template form state
  const [newTemplate, setNewTemplate] = useState({
    text: "",
    tone: "positive" as const,
    category: "",
    tags: [] as string[]
  });

  useEffect(() => {
    loadTemplates();
    loadFavorites();
  }, [filterClass, filterSemester]);

  useEffect(() => {
    filterTemplates();
  }, [templates, searchTerm, filterTone, filterCategory]);

  const loadTemplates = () => {
    const systemTemplates = getTemplatesForClassAndSemester(filterClass, filterSemester);
    const customTemplates = storage.getTemplates().filter(t => 
      t.category === `${filterClass}-${filterSemester}` || !t.category.includes('-')
    );
    setTemplates([...systemTemplates, ...customTemplates]);
  };

  const loadFavorites = () => {
    const saved = localStorage.getItem('template_favorites');
    if (saved) {
      setFavorites(JSON.parse(saved));
    }
  };

  const saveFavorites = (newFavorites: string[]) => {
    setFavorites(newFavorites);
    localStorage.setItem('template_favorites', JSON.stringify(newFavorites));
  };

  const filterTemplates = () => {
    let filtered = templates;

    if (searchTerm) {
      filtered = filtered.filter(template =>
        template.text.toLowerCase().includes(searchTerm.toLowerCase()) ||
        template.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())) ||
        template.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterTone !== "all") {
      filtered = filtered.filter(template => template.tone === filterTone);
    }

    if (filterCategory !== "all") {
      filtered = filtered.filter(template => 
        template.category === filterCategory ||
        template.tags.includes(filterCategory)
      );
    }

    setFilteredTemplates(filtered);
  };

  const handleCreateTemplate = () => {
    if (!newTemplate.text.trim()) return;

    const template: Template = {
      id: `custom-${Date.now()}`,
      text: newTemplate.text,
      tone: newTemplate.tone,
      category: `${filterClass}-${filterSemester}`,
      tags: newTemplate.tags
    };

    storage.saveTemplate(template);
    loadTemplates();
    setShowCreateModal(false);
    setNewTemplate({ text: "", tone: "positive", category: "", tags: [] });
  };

  const handleCopyTemplate = (template: Template) => {
    navigator.clipboard.writeText(template.text);
  };

  const toggleFavorite = (templateId: string) => {
    const newFavorites = favorites.includes(templateId)
      ? favorites.filter(id => id !== templateId)
      : [...favorites, templateId];
    saveFavorites(newFavorites);
  };

  const uniqueCategories = Array.from(new Set([
    ...templates.map(t => t.category),
    ...templates.flatMap(t => t.tags)
  ])).filter(Boolean);

  const getTemplateStats = () => {
    const byTone = templates.reduce((acc, template) => {
      acc[template.tone] = (acc[template.tone] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      total: templates.length,
      byTone,
      favorites: favorites.length,
      custom: templates.filter(t => t.id.startsWith('custom-')).length
    };
  };

  const stats = getTemplateStats();

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Yorum Şablonları</h1>
          <p className="text-gray-600 dark:text-gray-400">
            {filterClass}. Sınıf - {filterSemester}. Dönem şablonları
          </p>
        </div>
        <Button onClick={() => setShowCreateModal(true)} className="animate-bounce-in">
          <Plus className="mr-2 h-4 w-4" />
          Yeni Şablon
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="animate-fade-in hover:shadow-lg transition-all duration-300 border-0 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20">
          <CardContent className="p-4">
            <div className="flex items-center">
              <MessageSquare className="text-purple-600 h-6 w-6" />
              <div className="ml-3">
                <p className="text-sm text-purple-700 dark:text-purple-300">Toplam Şablon</p>
                <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="animate-fade-in hover:shadow-lg transition-all duration-300 border-0 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20" style={{ animationDelay: '0.1s' }}>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Heart className="text-green-600 h-6 w-6" />
              <div className="ml-3">
                <p className="text-sm text-green-700 dark:text-green-300">Favoriler</p>
                <p className="text-2xl font-bold text-green-900 dark:text-green-100">{stats.favorites}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="animate-fade-in hover:shadow-lg transition-all duration-300 border-0 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20" style={{ animationDelay: '0.2s' }}>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Star className="text-blue-600 h-6 w-6" />
              <div className="ml-3">
                <p className="text-sm text-blue-700 dark:text-blue-300">Özel Şablonlar</p>
                <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">{stats.custom}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="animate-fade-in hover:shadow-lg transition-all duration-300 border-0 bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20" style={{ animationDelay: '0.3s' }}>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Tag className="text-yellow-600 h-6 w-6" />
              <div className="ml-3">
                <p className="text-sm text-yellow-700 dark:text-yellow-300">Kategoriler</p>
                <p className="text-2xl font-bold text-yellow-900 dark:text-yellow-100">{uniqueCategories.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Class and Semester Selection */}
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
                  placeholder="Şablon ara..."
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
        </CardContent>
      </Card>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTemplates.length === 0 ? (
          <div className="col-span-full">
            <Card className="animate-fade-in">
              <CardContent className="p-8 text-center">
                <MessageSquare className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Şablon bulunamadı</h3>
                <p className="text-gray-500 dark:text-gray-400 mb-4">Arama kriterlerinizi değiştirin veya yeni şablon oluşturun</p>
                <Button onClick={() => setShowCreateModal(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Yeni Şablon Oluştur
                </Button>
              </CardContent>
            </Card>
          </div>
        ) : (
          filteredTemplates.map((template, index) => {
            const toneConfig = TONE_CONFIG[template.tone];
            const isFavorite = favorites.includes(template.id);
            
            return (
              <Card
                key={template.id}
                className={`animate-fade-in hover:shadow-lg transition-all duration-300 cursor-pointer ${toneConfig.bgColor} border ${toneConfig.borderColor}`}
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <Badge className={toneConfig.badgeColor}>
                      {toneConfig.label}
                    </Badge>
                    <div className="flex space-x-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleFavorite(template.id)}
                        className={`p-1 ${isFavorite ? 'text-red-500' : 'text-gray-400'}`}
                      >
                        <Heart className={`h-4 w-4 ${isFavorite ? 'fill-current' : ''}`} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleCopyTemplate(template)}
                        className="p-1 text-gray-400 hover:text-gray-600"
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed mb-3 line-clamp-4">
                    {template.text}
                  </p>
                  
                  {template.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {template.tags.slice(0, 3).map((tag, tagIndex) => (
                        <span
                          key={tagIndex}
                          className="px-2 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 text-xs rounded-full"
                        >
                          #{tag}
                        </span>
                      ))}
                      {template.tags.length > 3 && (
                        <span className="px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 text-xs rounded-full">
                          +{template.tags.length - 3}
                        </span>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* Create Template Modal */}
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent className="max-w-2xl blur-backdrop-strong bg-white/95 dark:bg-gray-800/95 border-0 shadow-2xl animate-fade-in">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Yeni Şablon Oluştur</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label>Şablon Metni</Label>
              <Textarea
                rows={6}
                placeholder="Şablon metnini yazın... (Örnek: {name} bu dönem matematik dersinde...)"
                value={newTemplate.text}
                onChange={(e) => setNewTemplate(prev => ({ ...prev, text: e.target.value }))}
                className="resize-none"
              />
              <p className="text-xs text-gray-500 mt-1">
                İpucu: {"{name}"} yazarak öğrenci adının otomatik eklenmesini sağlayabilirsiniz
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Ton</Label>
                <Select 
                  value={newTemplate.tone} 
                  onValueChange={(value: any) => setNewTemplate(prev => ({ ...prev, tone: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(TONE_CONFIG).map(([tone, config]) => (
                      <SelectItem key={tone} value={tone}>
                        {config.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Kategori</Label>
                <Input
                  placeholder="Örnek: matematik, türkçe..."
                  value={newTemplate.category}
                  onChange={(e) => setNewTemplate(prev => ({ ...prev, category: e.target.value }))}
                />
              </div>
            </div>

            <div className="flex space-x-3">
              <Button onClick={handleCreateTemplate} className="flex-1" disabled={!newTemplate.text.trim()}>
                <Plus className="mr-2 h-4 w-4" />
                Şablon Oluştur
              </Button>
              <Button variant="outline" onClick={() => setShowCreateModal(false)}>
                İptal
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}