import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { 
  Heart, 
  MessageCircle, 
  Share, 
  Download, 
  FileText, 
  Image as ImageIcon,
  MoreHorizontal,
  Coins
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface MainFeedProps {
  onOpenUpload: () => void;
}

export default function MainFeed({ onOpenUpload }: MainFeedProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [newPostContent, setNewPostContent] = useState("");
  const [showPostForm, setShowPostForm] = useState(false);

  // Fetch feed data (combining notes and posts)
  const { data: notes, isLoading: notesLoading } = useQuery({
    queryKey: ["/api/notes"],
  });

  const { data: posts, isLoading: postsLoading } = useQuery({
    queryKey: ["/api/posts"],
  });

  // Create post mutation
  const createPostMutation = useMutation({
    mutationFn: async (content: string) => {
      const res = await apiRequest("POST", "/api/posts", { content, postType: "post" });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/posts"] });
      setNewPostContent("");
      setShowPostForm(false);
      toast({
        title: "Publicación creada",
        description: "Tu publicación se ha compartido exitosamente",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo crear la publicación",
        variant: "destructive",
      });
    },
  });

  // Like mutations
  const likeMutation = useMutation({
    mutationFn: async ({ type, id }: { type: 'note' | 'post', id: number }) => {
      await apiRequest("POST", `/api/${type}s/${id}/like`);
    },
    onSuccess: (_, { type }) => {
      queryClient.invalidateQueries({ queryKey: [`/api/${type}s`] });
    },
  });

  const handleCreatePost = () => {
    if (newPostContent.trim()) {
      createPostMutation.mutate(newPostContent);
    }
  };

  const handleLike = (type: 'note' | 'post', id: number) => {
    likeMutation.mutate({ type, id });
  };

  // Combine and sort notes and posts by date
  const feedItems = [
    ...(notes || []).map((note: any) => ({ ...note, type: 'note' })),
    ...(posts || []).map((post: any) => ({ ...post, type: 'post' }))
  ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffHours < 1) return "Hace menos de 1 hora";
    if (diffHours < 24) return `Hace ${diffHours} hora${diffHours > 1 ? 's' : ''}`;
    
    const diffDays = Math.floor(diffHours / 24);
    return `Hace ${diffDays} día${diffDays > 1 ? 's' : ''}`;
  };

  if (notesLoading || postsLoading) {
    return (
      <div className="space-y-6">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-4 bg-slate-200 rounded w-3/4 mb-4"></div>
              <div className="h-4 bg-slate-200 rounded w-1/2"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Create Post */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center space-x-3">
            <Avatar className="w-10 h-10">
              <AvatarImage src={user?.avatar} alt={user?.fullName} />
              <AvatarFallback>
                {user?.fullName?.charAt(0) || user?.username?.charAt(0) || "U"}
              </AvatarFallback>
            </Avatar>
            <Input
              placeholder="¿Qué estás estudiando hoy?"
              value={showPostForm ? newPostContent : ""}
              onChange={(e) => setNewPostContent(e.target.value)}
              onFocus={() => setShowPostForm(true)}
              className="flex-1 bg-slate-100 border-0 focus:bg-white"
            />
          </div>
          
          {showPostForm && (
            <div className="mt-4">
              <Textarea
                value={newPostContent}
                onChange={(e) => setNewPostContent(e.target.value)}
                placeholder="Comparte tus pensamientos..."
                className="w-full mb-4"
              />
            </div>
          )}
          
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-100">
            <div className="flex space-x-4">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={onOpenUpload}
                className="text-slate-600 hover:text-crunevo-purple"
              >
                <FileText className="w-4 h-4 mr-2" />
                Apunte
              </Button>
              <Button 
                variant="ghost" 
                size="sm"
                className="text-slate-600 hover:text-crunevo-purple"
              >
                <ImageIcon className="w-4 h-4 mr-2" />
                Imagen
              </Button>
            </div>
            {showPostForm && (
              <div className="flex space-x-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    setShowPostForm(false);
                    setNewPostContent("");
                  }}
                >
                  Cancelar
                </Button>
                <Button 
                  size="sm"
                  onClick={handleCreatePost}
                  disabled={!newPostContent.trim() || createPostMutation.isPending}
                  className="bg-crunevo-purple hover:bg-purple-600"
                >
                  Publicar
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Feed Items */}
      {feedItems.map((item: any) => (
        <Card key={`${item.type}-${item.id}`}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <Avatar className="w-10 h-10">
                  <AvatarImage src={item.author?.avatar} alt={item.author?.fullName} />
                  <AvatarFallback>
                    {item.author?.fullName?.charAt(0) || item.author?.username?.charAt(0) || "U"}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h4 className="font-semibold text-slate-800">
                    {item.author?.fullName || item.author?.username}
                  </h4>
                  <p className="text-xs text-slate-500">
                    {item.type === 'note' ? item.subject : item.author?.career} • {formatDate(item.createdAt)}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {item.type === 'note' && item.creditsAwarded && (
                  <Badge variant="secondary" className="bg-emerald-50 text-emerald-700">
                    <Coins className="w-3 h-3 mr-1" />
                    +{item.creditsAwarded}
                  </Badge>
                )}
                <Button variant="ghost" size="sm">
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </div>
            </div>
            
            {item.type === 'note' ? (
              <>
                <h3 className="font-semibold text-slate-800 mb-2">{item.title}</h3>
                <p className="text-slate-600 mb-4">{item.description}</p>
                
                {/* Note Preview */}
                <div className="bg-slate-50 rounded-lg p-4 border border-slate-200 mb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-red-500 rounded-lg flex items-center justify-center">
                        <FileText className="text-white w-6 h-6" />
                      </div>
                      <div>
                        <div className="font-medium text-slate-800">{item.fileName}</div>
                        <div className="text-sm text-slate-500">
                          {item.fileSize ? `${(item.fileSize / 1024 / 1024).toFixed(1)} MB` : 'Archivo'}
                        </div>
                      </div>
                    </div>
                    <Button 
                      size="sm"
                      className="bg-crunevo-purple hover:bg-purple-600"
                    >
                      Ver Apunte
                    </Button>
                  </div>
                </div>
                
                {/* Tags */}
                {item.tags && item.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {item.tags.map((tag: string, index: number) => (
                      <Badge key={index} variant="secondary">
                        #{tag}
                      </Badge>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <>
                <p className="text-slate-700 mb-4">{item.content}</p>
                {item.imageUrl && (
                  <img 
                    src={item.imageUrl} 
                    alt="Imagen del post" 
                    className="w-full h-48 object-cover rounded-lg mb-4"
                  />
                )}
              </>
            )}
            
            {/* Post Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              <div className="flex items-center space-x-6">
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => handleLike(item.type, item.id)}
                  className="text-slate-600 hover:text-crunevo-pink"
                >
                  <Heart className="w-4 h-4 mr-2" />
                  {item.likesCount || 0}
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="text-slate-600 hover:text-crunevo-purple"
                >
                  <MessageCircle className="w-4 h-4 mr-2" />
                  {item.commentsCount || 0}
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="text-slate-600 hover:text-crunevo-purple"
                >
                  <Share className="w-4 h-4 mr-2" />
                  Compartir
                </Button>
              </div>
              {item.type === 'note' && (
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="text-slate-600 hover:text-crunevo-emerald"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Descargar
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ))}

      {/* Load More */}
      <div className="text-center py-8">
        <Button variant="outline">
          Cargar más publicaciones
        </Button>
      </div>
    </div>
  );
}
