import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CloudUpload, FileText, X } from "lucide-react";

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function UploadModal({ isOpen, onClose }: UploadModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [file, setFile] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    subject: "",
    tags: "",
  });

  const subjects = [
    "Matemáticas",
    "Física",
    "Química",
    "Historia",
    "Literatura",
    "Biología",
    "Geografía",
    "Filosofía",
    "Inglés",
    "Informática",
  ];

  const uploadMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const response = await fetch("/api/notes", {
        method: "POST",
        body: data,
        credentials: "include",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Error al subir el archivo");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notes"] });
      toast({
        title: "¡Apunte subido exitosamente!",
        description: "Tu apunte ha sido publicado y ganaste créditos.",
      });
      handleClose();
    },
    onError: (error: Error) => {
      toast({
        title: "Error al subir apunte",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      // Validate file type
      const allowedTypes = ['.pdf', '.doc', '.docx'];
      const fileExtension = '.' + selectedFile.name.split('.').pop()?.toLowerCase();
      
      if (!allowedTypes.includes(fileExtension)) {
        toast({
          title: "Tipo de archivo no válido",
          description: "Solo se permiten archivos PDF, DOC y DOCX",
          variant: "destructive",
        });
        return;
      }

      // Validate file size (10MB limit)
      if (selectedFile.size > 10 * 1024 * 1024) {
        toast({
          title: "Archivo muy grande",
          description: "El archivo no puede exceder 10MB",
          variant: "destructive",
        });
        return;
      }

      setFile(selectedFile);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!file) {
      toast({
        title: "Archivo requerido",
        description: "Por favor selecciona un archivo para subir",
        variant: "destructive",
      });
      return;
    }

    if (!formData.title.trim() || !formData.subject) {
      toast({
        title: "Campos requeridos",
        description: "Por favor completa el título y la materia",
        variant: "destructive",
      });
      return;
    }

    const data = new FormData();
    data.append("file", file);
    data.append("title", formData.title);
    data.append("description", formData.description);
    data.append("subject", formData.subject);
    
    if (formData.tags.trim()) {
      const tagsArray = formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag);
      data.append("tags", JSON.stringify(tagsArray));
    }

    uploadMutation.mutate(data);
  };

  const handleClose = () => {
    setFile(null);
    setFormData({
      title: "",
      description: "",
      subject: "",
      tags: "",
    });
    onClose();
  };

  const removeFile = () => {
    setFile(null);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Subir Apunte</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* File Upload Area */}
          <div className="space-y-4">
            {!file ? (
              <div className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center">
                <div className="w-16 h-16 bg-crunevo-purple/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CloudUpload className="text-crunevo-purple w-8 h-8" />
                </div>
                <h4 className="font-medium text-slate-800 mb-2">Arrastra tu archivo aquí</h4>
                <p className="text-sm text-slate-500 mb-4">O haz clic para seleccionar</p>
                <Button 
                  type="button"
                  variant="outline"
                  onClick={() => document.getElementById('file-input')?.click()}
                  className="bg-crunevo-purple text-white hover:bg-purple-600 border-crunevo-purple"
                >
                  Seleccionar archivo
                </Button>
                <p className="text-xs text-slate-400 mt-2">PDF, DOC, DOCX hasta 10MB</p>
                <input
                  id="file-input"
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </div>
            ) : (
              <div className="border border-slate-200 rounded-lg p-4 bg-slate-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-crunevo-purple rounded-lg flex items-center justify-center">
                      <FileText className="text-white w-5 h-5" />
                    </div>
                    <div>
                      <div className="font-medium text-slate-800">{file.name}</div>
                      <div className="text-sm text-slate-500">
                        {(file.size / 1024 / 1024).toFixed(1)} MB
                      </div>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={removeFile}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>
          
          {/* Form Fields */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Título del apunte *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Ej: Cálculo Diferencial - Límites y Derivadas"
                required
              />
            </div>
            
            <div>
              <Label htmlFor="description">Descripción</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe brevemente el contenido del apunte..."
                rows={3}
              />
            </div>
            
            <div>
              <Label htmlFor="subject">Materia *</Label>
              <Select
                value={formData.subject}
                onValueChange={(value) => setFormData({ ...formData, subject: value })}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona una materia" />
                </SelectTrigger>
                <SelectContent>
                  {subjects.map((subject) => (
                    <SelectItem key={subject} value={subject}>
                      {subject}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="tags">Tags (opcional)</Label>
              <Input
                id="tags"
                value={formData.tags}
                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                placeholder="Ej: derivadas, límites, cálculo"
              />
              <p className="text-xs text-slate-500 mt-1">Separa los tags con comas</p>
            </div>
          </div>
          
          <div className="flex justify-end space-x-3 pt-6 border-t">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={uploadMutation.isPending}
              className="bg-crunevo-purple hover:bg-purple-600"
            >
              {uploadMutation.isPending ? "Subiendo..." : "Subir Apunte"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
