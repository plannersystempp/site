import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Camera, Upload, X, User, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface PersonnelPhotoUploadProps {
  currentPhotoUrl?: string;
  personnelId?: string;
  personnelName?: string;
  onPhotoChange: (photoUrl: string | null) => void;
  disabled?: boolean;
}

export const PersonnelPhotoUpload: React.FC<PersonnelPhotoUploadProps> = ({
  currentPhotoUrl,
  personnelId,
  personnelName,
  onPhotoChange,
  disabled = false
}) => {
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'processing' | 'success' | 'error'>('idle');
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentPhotoUrl || null);
  const [localBlobUrl, setLocalBlobUrl] = useState<string | null>(null);
  const [imageLoading, setImageLoading] = useState(false);
  const [isInternalUpload, setIsInternalUpload] = useState(false);
  const [lastUploadTime, setLastUploadTime] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync previewUrl with currentPhotoUrl when it changes (e.g., when editing existing personnel)
  useEffect(() => {
    // Skip validation if the URL was set by our own upload
    if (isInternalUpload) {
      setIsInternalUpload(false);
      return;
    }

    if (currentPhotoUrl) {
      // Add cache-busting to force fresh load
      const urlWithTimestamp = `${currentPhotoUrl.split('?')[0]}?v=${Date.now()}`;
      setPreviewUrl(urlWithTimestamp);
      setImageLoading(true);
      
      // Validate URL
      const img = new Image();
      img.crossOrigin = 'anonymous';
      
      img.onload = () => {
        setImageLoading(false);
      };
      
      img.onerror = () => {
        console.warn('Failed to load photo from database:', currentPhotoUrl);
        setImageLoading(false);
      };
      
      img.src = urlWithTimestamp;
    } else {
      setPreviewUrl(null);
      setImageLoading(false);
    }
  }, [currentPhotoUrl, isInternalUpload]);

  const validateFile = (file: File): { valid: boolean; error?: string } => {
    // Validar tipo de arquivo
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      return { valid: false, error: 'Formato inválido. Use JPEG, PNG ou WebP.' };
    }

    // Validar tamanho (máximo 2MB)
    const maxSize = 2 * 1024 * 1024; // 2MB em bytes
    if (file.size > maxSize) {
      return { valid: false, error: 'Arquivo muito grande. Máximo: 2MB.' };
    }

    return { valid: true };
  };

  const compressImage = (file: File): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;

          // Redimensionar se muito grande (máximo 800px na maior dimensão)
          const maxDimension = 800;
          if (width > maxDimension || height > maxDimension) {
            if (width > height) {
              height = (height / width) * maxDimension;
              width = maxDimension;
            } else {
              width = (width / height) * maxDimension;
              height = maxDimension;
            }
          }

          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);

          canvas.toBlob(
            (blob) => {
              if (blob) {
                resolve(blob);
              } else {
                reject(new Error('Falha ao comprimir imagem'));
              }
            },
            'image/jpeg',
            0.85 // Qualidade 85%
          );
        };
        img.onerror = () => reject(new Error('Falha ao carregar imagem'));
      };
      reader.onerror = () => reject(new Error('Falha ao ler arquivo'));
    });
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // FASE 4: Throttle - prevenir uploads múltiplos rápidos
    const now = Date.now();
    if (now - lastUploadTime < 3000) {
      toast({
        title: 'Aguarde',
        description: 'Processando upload anterior. Aguarde alguns segundos.',
        variant: 'default'
      });
      return;
    }

    // Validar arquivo
    const validation = validateFile(file);
    if (!validation.valid) {
      toast({
        title: 'Arquivo inválido',
        description: validation.error,
        variant: 'destructive'
      });
      return;
    }

    // FASE 2: Preview otimista - mostrar preview local imediato
    const localUrl = URL.createObjectURL(file);
    setLocalBlobUrl(localUrl);
    setPreviewUrl(localUrl);
    
    setUploading(true);
    setUploadStatus('uploading');
    setLastUploadTime(now);
    
    // FASE 1: Toast com progresso melhorado
    const uploadToast = toast({
      title: '📤 Enviando foto...',
      description: 'Aguarde enquanto processamos sua imagem.',
      duration: 10000
    });

    try {
      // FASE 1: Status de processamento
      setUploadStatus('processing');
      uploadToast.update?.({
        id: uploadToast.id,
        title: '⚙️ Processando imagem...',
        description: 'Otimizando e enviando para o servidor.'
      });

      // Comprimir imagem
      const compressedBlob = await compressImage(file);

      // Gerar nome único para o arquivo
      const fileExt = file.name.split('.').pop();
      const timestamp = Date.now();
      const fileName = personnelId 
        ? `${personnelId}_${timestamp}.${fileExt}`
        : `temp_${timestamp}.${fileExt}`;

      // Fazer upload para o Supabase Storage
      const { data, error: uploadError } = await supabase.storage
        .from('personnel-photos')
        .upload(fileName, compressedBlob, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        console.error('Upload error:', uploadError);
        throw new Error('Erro ao fazer upload da foto');
      }

      // Obter URL pública
      const { data: { publicUrl } } = supabase.storage
        .from('personnel-photos')
        .getPublicUrl(fileName);

      // FASE 2: Limpar blob local e usar URL real
      if (localBlobUrl) {
        URL.revokeObjectURL(localBlobUrl);
        setLocalBlobUrl(null);
      }

      // Success: set preview and notify parent
      setIsInternalUpload(true);
      setPreviewUrl(publicUrl);
      onPhotoChange(publicUrl);
      setUploadStatus('success');

      // FASE 1: Feedback de sucesso com instruções claras
      toast({
        title: '✅ Foto carregada!',
        description: 'A foto só aparecerá nos cards após clicar em "Salvar" abaixo.',
        duration: 6000
      });
    } catch (error: any) {
      console.error('Error uploading photo:', error);
      
      // FASE 2: Limpar blob local em caso de erro
      if (localBlobUrl) {
        URL.revokeObjectURL(localBlobUrl);
        setLocalBlobUrl(null);
      }
      setPreviewUrl(currentPhotoUrl || null);
      
      setUploadStatus('error');
      
      // Diferenciar tipos de erro
      const isNetworkError = error.message?.includes('fetch') || error.message?.includes('network');
      const isStorageError = error.message?.includes('storage') || error.message?.includes('bucket');
      
      toast({
        title: '❌ Erro no upload',
        description: isNetworkError 
          ? 'Problema de conexão. Verifique sua internet e tente novamente.'
          : isStorageError
          ? 'Erro no servidor de arquivos. Tente novamente em alguns segundos.'
          : error.message || 'Não foi possível fazer upload da foto',
        variant: 'destructive'
      });
    } finally {
      setUploading(false);
      
      // Reset status após 3 segundos
      setTimeout(() => setUploadStatus('idle'), 3000);
      
      // Limpar input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemovePhoto = async () => {
    if (!previewUrl) return;

    try {
      // Extrair nome do arquivo da URL
      const urlParts = previewUrl.split('/');
      const fileName = urlParts[urlParts.length - 1];

      // Tentar deletar do storage (pode falhar se não for admin, mas não é crítico)
      await supabase.storage
        .from('personnel-photos')
        .remove([fileName]);

      setPreviewUrl(null);
      onPhotoChange(null);

      toast({
        title: 'Foto removida',
        description: 'Foto de perfil removida com sucesso'
      });
    } catch (error) {
      console.error('Error removing photo:', error);
      // Mesmo que falhe ao deletar do storage, limpar a URL
      setPreviewUrl(null);
      onPhotoChange(null);
    }
  };

  // FASE 3: Detectar se há mudanças não salvas
  const hasUnsavedPhoto = previewUrl !== currentPhotoUrl;

  return (
    <div className="space-y-4">
      {/* FASE 3: Badge de foto não salva */}
      {hasUnsavedPhoto && (
        <Badge variant="secondary" className="bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/20">
          ⚠️ Foto alterada - clique em "Salvar" abaixo para confirmar
        </Badge>
      )}
      
      <div className="flex items-center gap-4">
        {/* Avatar Preview */}
        <Avatar className="h-20 w-20 ring-2 ring-border">
          {(imageLoading || uploading) ? (
            <AvatarFallback className="bg-primary/10">
              <Loader2 className="h-8 w-8 text-primary animate-spin" />
            </AvatarFallback>
          ) : (
            <>
              <AvatarImage 
                src={previewUrl || undefined} 
                alt={personnelName || 'Foto'}
                crossOrigin="anonymous"
                loading="lazy"
                onLoad={() => setImageLoading(false)}
                onError={(e) => {
                  console.error(`Failed to load photo for ${personnelName}`);
                  setImageLoading(false);
                }}
              />
              <AvatarFallback className="bg-primary/10">
                <User className="h-10 w-10 text-primary" />
              </AvatarFallback>
            </>
          )}
        </Avatar>

        {/* Upload/Remove Actions */}
        <div className="flex flex-col gap-2">
          {!previewUrl ? (
            <>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                disabled={disabled || uploading || uploadStatus === 'processing'}
                className="gap-2"
              >
                {uploadStatus === 'uploading' ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    📤 Enviando...
                  </>
                ) : uploadStatus === 'processing' ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    ⚙️ Processando...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4" />
                    Escolher Foto
                  </>
                )}
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp"
                onChange={handleFileSelect}
                className="hidden"
                disabled={disabled || uploading}
              />
            </>
          ) : (
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                disabled={disabled || uploading || uploadStatus === 'processing'}
                className="gap-2"
              >
                {uploadStatus === 'uploading' ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    📤 Enviando...
                  </>
                ) : uploadStatus === 'processing' ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    ⚙️ Processando...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4" />
                    Trocar
                  </>
                )}
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleRemovePhoto}
                disabled={disabled || uploading}
                className="gap-2 text-destructive hover:text-destructive"
              >
                <X className="h-4 w-4" />
                Remover
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp"
                onChange={handleFileSelect}
                className="hidden"
                disabled={disabled || uploading}
              />
            </div>
          )}
          <p className="text-xs text-muted-foreground">
            JPEG, PNG ou WebP. Máx: 2MB
          </p>
        </div>
      </div>
    </div>
  );
};
