import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useTeam } from '@/contexts/TeamContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface TechnicalData {
  url: string;
  pageTitle: string;
  userAgent: string;
  browserName: string;
  browserVersion: string;
  os: string;
  screenResolution: string;
  viewportSize: string;
  devicePixelRatio: number;
  isMobile: boolean;
  timestamp: string;
  timezone: string;
  locale: string;
  consoleLogs: Array<{ type: string; message: string; timestamp: string }>;
  networkErrors: Array<{ url: string; status: number; timestamp: string }>;
}

interface ErrorReport {
  whatTryingToDo: string;
  whatHappened: string;
  stepsToReproduce?: string;
  urgency: 'low' | 'medium' | 'high';
  screenshot?: File;
  screenshotAnnotations?: any;
}

export const useErrorReporting = () => {
  const { user } = useAuth();
  const { activeTeam } = useTeam();
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const consoleLogsRef = useRef<Array<{ type: string; message: string; timestamp: string }>>([]);
  const networkErrorsRef = useRef<Array<{ url: string; status: number; timestamp: string }>>([]);

  // Interceptar console.error e console.warn
  useEffect(() => {
    const originalError = console.error;
    const originalWarn = console.warn;

    console.error = (...args: any[]) => {
      consoleLogsRef.current.push({
        type: 'error',
        message: args.map(a => String(a)).join(' '),
        timestamp: new Date().toISOString()
      });
      if (consoleLogsRef.current.length > 50) {
        consoleLogsRef.current.shift();
      }
      originalError.apply(console, args);
    };

    console.warn = (...args: any[]) => {
      consoleLogsRef.current.push({
        type: 'warn',
        message: args.map(a => String(a)).join(' '),
        timestamp: new Date().toISOString()
      });
      if (consoleLogsRef.current.length > 50) {
        consoleLogsRef.current.shift();
      }
      originalWarn.apply(console, args);
    };

    const handleError = (event: ErrorEvent) => {
      consoleLogsRef.current.push({
        type: 'error',
        message: `${event.message} (${event.filename}:${event.lineno}:${event.colno})`,
        timestamp: new Date().toISOString()
      });
      if (consoleLogsRef.current.length > 50) {
        consoleLogsRef.current.shift();
      }
    };

    window.addEventListener('error', handleError);

    return () => {
      console.error = originalError;
      console.warn = originalWarn;
      window.removeEventListener('error', handleError);
    };
  }, []);

  const captureTechnicalData = useCallback((): TechnicalData => {
    const ua = navigator.userAgent;
    let browserName = 'Unknown';
    let browserVersion = 'Unknown';
    let os = 'Unknown';

    if (ua.indexOf('Chrome') > -1) {
      browserName = 'Chrome';
      const match = ua.match(/Chrome\/(\d+\.\d+)/);
      if (match) browserVersion = match[1];
    } else if (ua.indexOf('Firefox') > -1) {
      browserName = 'Firefox';
      const match = ua.match(/Firefox\/(\d+\.\d+)/);
      if (match) browserVersion = match[1];
    } else if (ua.indexOf('Safari') > -1) {
      browserName = 'Safari';
      const match = ua.match(/Version\/(\d+\.\d+)/);
      if (match) browserVersion = match[1];
    } else if (ua.indexOf('Edge') > -1) {
      browserName = 'Edge';
      const match = ua.match(/Edge\/(\d+\.\d+)/);
      if (match) browserVersion = match[1];
    }

    if (ua.indexOf('Windows') > -1) os = 'Windows';
    else if (ua.indexOf('Mac') > -1) os = 'macOS';
    else if (ua.indexOf('Linux') > -1) os = 'Linux';
    else if (ua.indexOf('Android') > -1) os = 'Android';
    else if (ua.indexOf('iOS') > -1) os = 'iOS';

    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua);

    return {
      url: window.location.href,
      pageTitle: document.title,
      userAgent: ua,
      browserName,
      browserVersion,
      os,
      screenResolution: `${window.screen.width}x${window.screen.height}`,
      viewportSize: `${window.innerWidth}x${window.innerHeight}`,
      devicePixelRatio: window.devicePixelRatio,
      isMobile,
      timestamp: new Date().toISOString(),
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      locale: navigator.language,
      consoleLogs: [...consoleLogsRef.current],
      networkErrors: [...networkErrorsRef.current]
    };
  }, []);

  const submitErrorReport = useCallback(async (report: ErrorReport) => {
    if (!user) {
      toast({
        title: 'Erro',
        description: 'Você precisa estar logado para reportar erros',
        variant: 'destructive'
      });
      return null;
    }

    setIsSubmitting(true);

    try {
      const technicalData = captureTechnicalData();

      let screenshotUrl = null;
      if (report.screenshot) {
        const fileExt = report.screenshot.name.split('.').pop();
        const fileName = `${user.id}/${Date.now()}.${fileExt}`;
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('error-screenshots')
          .upload(fileName, report.screenshot, {
            cacheControl: '3600',
            upsert: false
          });

        if (uploadError) {
          console.error('Error uploading screenshot:', uploadError);
          toast({
            title: 'Aviso',
            description: 'Não foi possível fazer upload da imagem, mas o reporte será enviado',
            variant: 'default'
          });
        } else {
          const { data: publicUrlData } = supabase.storage
            .from('error-screenshots')
            .getPublicUrl(uploadData.path);
          screenshotUrl = publicUrlData.publicUrl;
        }
      }

      const { data, error } = await supabase
        .from('error_reports')
        .insert({
          what_trying_to_do: report.whatTryingToDo,
          what_happened: report.whatHappened,
          steps_to_reproduce: report.stepsToReproduce || null,
          urgency: report.urgency,
          technical_data: technicalData as any,
          screenshot_url: screenshotUrl,
          screenshot_annotations: report.screenshotAnnotations || null
        } as any)
        .select('report_number')
        .single();

      if (error) {
        console.error('Error submitting report:', error);
        throw error;
      }

      return data.report_number;
    } catch (error) {
      console.error('Error in submitErrorReport:', error);
      toast({
        title: 'Erro ao enviar reporte',
        description: 'Tente novamente em alguns instantes',
        variant: 'destructive'
      });
      return null;
    } finally {
      setIsSubmitting(false);
    }
  }, [user, activeTeam, captureTechnicalData]);

  return {
    submitErrorReport,
    isSubmitting,
    captureTechnicalData
  };
};
