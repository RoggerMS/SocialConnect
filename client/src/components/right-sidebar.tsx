import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Crown, Users } from "lucide-react";

export default function RightSidebar() {
  const { data: leaderboard } = useQuery({
    queryKey: ["/api/leaderboard"],
  });

  // Mock data for trending topics and study groups
  const trendingTopics = [
    { name: "Matemáticas", count: 125, trend: "up" },
    { name: "Física", count: 87, trend: "up" },
    { name: "Química", count: 64, trend: "down" },
    { name: "Historia", count: 45, trend: "up" },
  ];

  const studyGroups = [
    { name: "Cálculo Integral", members: 12 },
    { name: "Química Orgánica", members: 8 },
    { name: "Historia Mundial", members: 15 },
  ];

  return (
    <div className="space-y-6">
      {/* Weekly Mission */}
      <Card className="bg-gradient-to-r from-crunevo-purple to-crunevo-pink text-white">
        <CardContent className="p-6">
          <h4 className="font-bold mb-2">🎯 Misión Semanal</h4>
          <p className="text-sm mb-3 opacity-90">Sube 3 apuntes esta semana</p>
          <Progress value={33} className="mb-2 bg-white/20" />
          <div className="text-xs opacity-75 mb-3">1 de 3 completado</div>
          <div className="text-right">
            <span className="text-sm font-semibold">+200 créditos</span>
          </div>
        </CardContent>
      </Card>

      {/* Trending Topics */}
      <Card>
        <CardContent className="p-6">
          <h4 className="font-semibold text-slate-800 mb-4 flex items-center">
            📈 Tendencias
          </h4>
          <div className="space-y-3">
            {trendingTopics.map((topic, index) => (
              <div key={index} className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-slate-800">#{topic.name}</div>
                  <div className="text-xs text-slate-500">
                    {topic.count} apuntes esta semana
                  </div>
                </div>
                {topic.trend === "up" ? (
                  <TrendingUp className="w-4 h-4 text-green-500" />
                ) : (
                  <TrendingDown className="w-4 h-4 text-red-500" />
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Leaderboard */}
      <Card>
        <CardContent className="p-6">
          <h4 className="font-semibold text-slate-800 mb-4 flex items-center">
            🏆 Top Estudiantes
          </h4>
          <div className="space-y-4">
            {leaderboard && leaderboard.slice(0, 3).map((student: any, index: number) => (
              <div key={student.id} className="flex items-center space-x-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  index === 0 ? "bg-gradient-to-r from-yellow-400 to-orange-500" :
                  index === 1 ? "bg-gradient-to-r from-gray-300 to-gray-400" :
                  "bg-gradient-to-r from-amber-600 to-amber-700"
                }`}>
                  {index === 0 ? (
                    <Crown className="text-white text-sm" />
                  ) : (
                    <span className="text-white text-sm font-bold">{index + 1}</span>
                  )}
                </div>
                <Avatar className="w-8 h-8">
                  <AvatarImage src={student.avatar} alt={student.fullName} />
                  <AvatarFallback>
                    {student.fullName?.charAt(0) || student.username?.charAt(0) || "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="font-medium text-slate-800 text-sm">
                    {student.fullName || student.username}
                  </div>
                  <div className="text-xs text-slate-500">
                    {student.credits} créditos
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <Button variant="ghost" className="w-full mt-4 text-crunevo-purple hover:underline">
            Ver ranking completo
          </Button>
        </CardContent>
      </Card>

      {/* Study Groups */}
      <Card>
        <CardContent className="p-6">
          <h4 className="font-semibold text-slate-800 mb-4 flex items-center">
            👥 Grupos de Estudio
          </h4>
          <div className="space-y-3">
            {studyGroups.map((group, index) => (
              <div key={index} className="p-3 bg-slate-50 rounded-lg">
                <div className="font-medium text-slate-800 text-sm">{group.name}</div>
                <div className="text-xs text-slate-500 mb-2 flex items-center">
                  <Users className="w-3 h-3 mr-1" />
                  {group.members} miembros activos
                </div>
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="text-crunevo-purple hover:underline p-0 h-auto font-medium text-xs"
                >
                  Unirse al grupo
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
