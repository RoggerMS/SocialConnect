import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Trophy, Plus, HelpCircle } from "lucide-react";

interface LeftSidebarProps {
  onOpenUpload: () => void;
}

export default function LeftSidebar({ onOpenUpload }: LeftSidebarProps) {
  const { user } = useAuth();
  
  const { data: userStats } = useQuery({
    queryKey: ["/api/user/stats"],
    enabled: !!user,
  });

  const { data: achievements } = useQuery({
    queryKey: ["/api/user/achievements"],
    enabled: !!user,
  });

  return (
    <div className="space-y-6">
      {/* User Profile Card */}
      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <Avatar className="w-20 h-20 mx-auto border-4 border-crunevo-purple">
              <AvatarImage src={user?.avatar} alt={user?.fullName} />
              <AvatarFallback className="text-lg">
                {user?.fullName?.charAt(0) || user?.username?.charAt(0) || "U"}
              </AvatarFallback>
            </Avatar>
            
            <h3 className="mt-3 font-semibold text-slate-800">
              {user?.fullName || user?.username}
            </h3>
            <p className="text-sm text-slate-500">{user?.career}</p>
            
            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-slate-100">
              <div className="text-center">
                <div className="font-bold text-crunevo-purple">
                  {userStats?.notesCount || 0}
                </div>
                <div className="text-xs text-slate-500">Apuntes</div>
              </div>
              <div className="text-center">
                <div className="font-bold text-crunevo-pink">
                  {userStats?.likesReceived || 0}
                </div>
                <div className="text-xs text-slate-500">Likes</div>
              </div>
              <div className="text-center">
                <div className="font-bold text-crunevo-emerald">
                  {userStats?.rank || 0}
                </div>
                <div className="text-xs text-slate-500">Ranking</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardContent className="p-6">
          <h4 className="font-semibold text-slate-800 mb-4">Acciones Rápidas</h4>
          <div className="space-y-3">
            <Button 
              onClick={onOpenUpload}
              className="w-full bg-crunevo-purple text-white hover:bg-purple-600"
            >
              <Plus className="w-4 h-4 mr-2" />
              Subir Apunte
            </Button>
            <Button 
              variant="outline" 
              className="w-full"
            >
              <HelpCircle className="w-4 h-4 mr-2" />
              Hacer Pregunta
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Recent Achievements */}
      <Card>
        <CardContent className="p-6">
          <h4 className="font-semibold text-slate-800 mb-4">Logros Recientes</h4>
          <div className="space-y-3">
            {achievements && achievements.length > 0 ? (
              achievements.slice(0, 3).map((achievement: any) => (
                <div key={achievement.id} className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                    <Trophy className="text-white text-sm" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-slate-800">
                      {achievement.title}
                    </div>
                    <div className="text-xs text-slate-500">
                      Hace {Math.floor((Date.now() - new Date(achievement.createdAt).getTime()) / (1000 * 60 * 60 * 24))} días
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-sm text-slate-500 text-center py-4">
                Aún no tienes logros. ¡Sube tu primer apunte para comenzar!
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
