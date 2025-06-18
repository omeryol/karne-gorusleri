import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { 
  Users, 
  MessageSquare, 
  CheckCircle, 
  AlertCircle,
  TrendingUp,
  BookOpen,
  Target,
  Award
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface Statistics {
  totalStudents: number;
  studentsWithComments: number;
  studentsWithoutComments: number;
  completionRate: number;
  gradeStats: Record<number, { total: number; withComments: number }>;
}

export default function Dashboard() {
  const { data: stats, isLoading } = useQuery<Statistics>({
    queryKey: ['/api/statistics'],
    queryFn: () => fetch('/api/statistics').then(res => res.json()),
  });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 24
      }
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

  const statCards = [
    {
      title: "Toplam Öğrenci",
      value: stats?.totalStudents || 0,
      description: "Sisteme kayıtlı öğrenci sayısı",
      icon: Users,
      color: "from-blue-500 to-blue-600",
      link: "/students"
    },
    {
      title: "Tamamlanan Yorumlar",
      value: stats?.studentsWithComments || 0,
      description: "Yorumu hazırlanmış öğrenciler",
      icon: CheckCircle,
      color: "from-green-500 to-green-600",
      link: "/comments?filter=completed"
    },
    {
      title: "Bekleyen Yorumlar",
      value: stats?.studentsWithoutComments || 0,
      description: "Yorumu hazırlanmamış öğrenciler",
      icon: AlertCircle,
      color: "from-orange-500 to-orange-600",
      link: "/comments?filter=pending"
    },
    {
      title: "Tamamlanma Oranı",
      value: `%${stats?.completionRate || 0}`,
      description: "Genel ilerleme durumu",
      icon: TrendingUp,
      color: "from-purple-500 to-purple-600",
      link: "/comments"
    }
  ];

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-8"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mb-4 floating-animation">
          <BookOpen className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-4xl font-bold text-white mb-2">
          Karne Yorumları Yönetim Sistemi
        </h1>
        <p className="text-xl text-white/80 max-w-2xl mx-auto">
          Öğrenci karne yorumlarınızı kolayca oluşturun, düzenleyin ve yönetin
        </p>
      </motion.div>

      {/* Statistics Cards */}
      <motion.div 
        variants={containerVariants}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        {statCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <motion.div key={card.title} variants={itemVariants}>
              <Link href={card.link}>
                <Card className="cursor-pointer hover:shadow-xl transition-all duration-300 hover:-translate-y-1 pulse-glow">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      {card.title}
                    </CardTitle>
                    <div className={`p-2 rounded-lg bg-gradient-to-r ${card.color}`}>
                      <Icon className="h-4 w-4 text-white" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className={`text-3xl font-bold bg-gradient-to-r ${card.color} bg-clip-text text-transparent`}>
                      {card.value}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {card.description}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Grade Statistics */}
      {stats?.gradeStats && Object.keys(stats.gradeStats).length > 0 && (
        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Sınıf Bazında İstatistikler
              </CardTitle>
              <CardDescription>
                Her sınıftaki öğrenci sayısı ve yorum tamamlanma durumu
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {Object.entries(stats.gradeStats).map(([grade, data]) => {
                  const completionRate = data.total > 0 ? Math.round((data.withComments / data.total) * 100) : 0;
                  const gradeColors = {
                    5: "from-indigo-500 to-indigo-600",
                    6: "from-green-500 to-green-600", 
                    7: "from-yellow-500 to-yellow-600",
                    8: "from-red-500 to-red-600"
                  };
                  
                  return (
                    <motion.div
                      key={grade}
                      whileHover={{ scale: 1.02 }}
                      className="p-4 rounded-lg glass-effect border"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold">{grade}. Sınıf</span>
                        <Award className={`h-4 w-4 bg-gradient-to-r ${gradeColors[grade as keyof typeof gradeColors]} bg-clip-text text-transparent`} />
                      </div>
                      <div className="text-2xl font-bold mb-1">{data.total}</div>
                      <div className="text-sm text-muted-foreground mb-2">
                        Toplam Öğrenci
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full bg-gradient-to-r ${gradeColors[grade as keyof typeof gradeColors]} transition-all duration-300`}
                            style={{ width: `${completionRate}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium">%{completionRate}</span>
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {data.withComments}/{data.total} tamamlandı
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Quick Actions */}
      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader>
            <CardTitle>Hızlı İşlemler</CardTitle>
            <CardDescription>
              En sık kullanılan işlemlere hızlı erişim
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link href="/students">
                <Button className="w-full h-auto p-6 flex flex-col items-center gap-3 hover:scale-105 transition-transform">
                  <Users className="h-8 w-8" />
                  <div className="text-center">
                    <div className="font-semibold">Öğrenci Ekle</div>
                    <div className="text-sm opacity-80">Yeni öğrenci kaydı</div>
                  </div>
                </Button>
              </Link>
              
              <Link href="/comments">
                <Button className="w-full h-auto p-6 flex flex-col items-center gap-3 hover:scale-105 transition-transform">
                  <MessageSquare className="h-8 w-8" />
                  <div className="text-center">
                    <div className="font-semibold">Yorum Ata</div>
                    <div className="text-sm opacity-80">Öğrenciye yorum ekle</div>
                  </div>
                </Button>
              </Link>
              
              <Link href="/comments?view=all">
                <Button className="w-full h-auto p-6 flex flex-col items-center gap-3 hover:scale-105 transition-transform">
                  <CheckCircle className="h-8 w-8" />
                  <div className="text-center">
                    <div className="font-semibold">Yorumları Görüntüle</div>
                    <div className="text-sm opacity-80">Tüm yorumları listele</div>
                  </div>
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}