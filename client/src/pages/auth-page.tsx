import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GraduationCap, BookOpen, Users, Award } from "lucide-react";

export default function AuthPage() {
  const { user, loginMutation, registerMutation } = useAuth();
  const [, navigate] = useLocation();
  
  const [loginData, setLoginData] = useState({ username: "", password: "" });
  const [registerData, setRegisterData] = useState({ 
    username: "", 
    password: "", 
    email: "", 
    fullName: "", 
    career: "" 
  });

  // Redirect if already logged in
  if (user) {
    navigate("/");
    return null;
  }

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    loginMutation.mutate(loginData);
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    registerMutation.mutate(registerData);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-purple-50 flex">
      {/* Left side - Forms */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-r from-crunevo-purple to-crunevo-pink rounded-2xl flex items-center justify-center mx-auto mb-4">
              <GraduationCap className="text-white text-2xl" />
            </div>
            <h1 className="text-3xl font-bold text-slate-800">CRUNEVO</h1>
            <p className="text-slate-600 mt-2">Plataforma educativa social</p>
          </div>

          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Iniciar Sesión</TabsTrigger>
              <TabsTrigger value="register">Registrarse</TabsTrigger>
            </TabsList>
            
            <TabsContent value="login">
              <Card>
                <CardHeader>
                  <CardTitle>Iniciar Sesión</CardTitle>
                  <CardDescription>
                    Ingresa a tu cuenta para continuar
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                      <Label htmlFor="login-username">Usuario</Label>
                      <Input
                        id="login-username"
                        type="text"
                        value={loginData.username}
                        onChange={(e) => setLoginData({ ...loginData, username: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="login-password">Contraseña</Label>
                      <Input
                        id="login-password"
                        type="password"
                        value={loginData.password}
                        onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                        required
                      />
                    </div>
                    <Button 
                      type="submit" 
                      className="w-full bg-crunevo-purple hover:bg-purple-600"
                      disabled={loginMutation.isPending}
                    >
                      {loginMutation.isPending ? "Iniciando..." : "Iniciar Sesión"}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="register">
              <Card>
                <CardHeader>
                  <CardTitle>Crear Cuenta</CardTitle>
                  <CardDescription>
                    Únete a la comunidad estudiantil
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleRegister} className="space-y-4">
                    <div>
                      <Label htmlFor="register-username">Usuario</Label>
                      <Input
                        id="register-username"
                        type="text"
                        value={registerData.username}
                        onChange={(e) => setRegisterData({ ...registerData, username: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="register-email">Email</Label>
                      <Input
                        id="register-email"
                        type="email"
                        value={registerData.email}
                        onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="register-fullName">Nombre Completo</Label>
                      <Input
                        id="register-fullName"
                        type="text"
                        value={registerData.fullName}
                        onChange={(e) => setRegisterData({ ...registerData, fullName: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="register-career">Carrera</Label>
                      <Input
                        id="register-career"
                        type="text"
                        value={registerData.career}
                        onChange={(e) => setRegisterData({ ...registerData, career: e.target.value })}
                        placeholder="Ej: Ingeniería Informática"
                      />
                    </div>
                    <div>
                      <Label htmlFor="register-password">Contraseña</Label>
                      <Input
                        id="register-password"
                        type="password"
                        value={registerData.password}
                        onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                        required
                      />
                    </div>
                    <Button 
                      type="submit" 
                      className="w-full bg-crunevo-purple hover:bg-purple-600"
                      disabled={registerMutation.isPending}
                    >
                      {registerMutation.isPending ? "Creando cuenta..." : "Crear Cuenta"}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Right side - Hero section */}
      <div className="hidden lg:flex lg:flex-1 bg-gradient-to-br from-crunevo-purple to-crunevo-pink p-12 text-white items-center">
        <div className="max-w-lg">
          <h2 className="text-4xl font-bold mb-6">
            Conecta, Aprende y Comparte
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Únete a la comunidad estudiantil más activa. Comparte tus apuntes, 
            resuelve dudas y gana recompensas por tu participación académica.
          </p>
          
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <BookOpen className="w-6 h-6" />
              <span>Comparte apuntes y recursos</span>
            </div>
            <div className="flex items-center space-x-3">
              <Users className="w-6 h-6" />
              <span>Conecta con otros estudiantes</span>
            </div>
            <div className="flex items-center space-x-3">
              <Award className="w-6 h-6" />
              <span>Gana créditos y logros</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
