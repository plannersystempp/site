import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PasswordInput } from '@/components/ui/password-input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Loader2, ArrowLeft, CheckCircle, Mail } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { resetPassword } from '@/services/authService';
import { validateEmail, validatePassword, validateName, sanitizeInput } from '@/utils/validation';

export const LoginScreen: React.FC = () => {
  const { login, signup, isLoading, user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [signUpSuccess, setSignUpSuccess] = useState(false);
  
  // Novos estados para o fluxo de empresa
  const [isCreatingCompany, setIsCreatingCompany] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [companyCnpj, setCompanyCnpj] = useState('');
  const [confirmAdmin, setConfirmAdmin] = useState(false);
  const [inviteCode, setInviteCode] = useState('');
  const [signupMessage, setSignupMessage] = useState('');
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  useEffect(() => {
    if (user) {
      navigate('/app');
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation for all forms
    if (!validateEmail(email)) {
      toast({
        title: "Erro",
        description: "Por favor, informe um email válido",
        variant: "destructive"
      });
      return;
    }

    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      toast({
        title: "Senha Inválida",
        description: passwordValidation.errors.join(', '),
        variant: "destructive"
      });
      return;
    }
    
    if (isSignUp) {
      if (!validateName(name)) {
        toast({
          title: "Erro",
          description: "Nome deve ter entre 2 e 100 caracteres",
          variant: "destructive"
        });
        return;
      }

      // Validar aceite dos termos
      if (!acceptedTerms) {
        toast({
          title: "Erro",
          description: "Você deve aceitar os Termos de Uso e Política de Privacidade para continuar",
          variant: "destructive"
        });
        return;
      }

      if (isCreatingCompany) {
        // Validação para administrador criando empresa
        if (!companyName.trim() || !companyCnpj.trim() || !confirmAdmin) {
          toast({
            title: "Erro",
            description: "Por favor, preencha todos os campos e confirme que é o administrador legal",
            variant: "destructive"
          });
          return;
        }

        try {
          // Sanitize inputs
          const sanitizedName = sanitizeInput(name);
          const sanitizedCompanyName = sanitizeInput(companyName);
          const sanitizedCnpj = sanitizeInput(companyCnpj);

          // Create user account first
          const { data: userData, error: signupError } = await supabase.auth.signUp({
            email: email.trim().toLowerCase(),
            password,
            options: {
              data: { name: sanitizedName },
              emailRedirectTo: `${window.location.origin}/`
            }
          });

          if (signupError) {
            if (signupError.message?.includes('User already registered')) {
              toast({
                title: "Email já cadastrado",
                description: "Já existe uma conta com este email. Tente fazer login.",
                variant: "destructive"
              });
            } else {
              toast({
                title: "Erro no cadastro",
                description: signupError.message,
                variant: "destructive"
              });
            }
            return;
          }

          if (userData.user) {
            console.log('User created, setting up company...');
            
            // Setup company using RPC function
            const { data: companyData, error: companyError } = await supabase
              .rpc('setup_company_for_current_user', {
                p_company_name: sanitizedCompanyName,
                p_company_cnpj: sanitizedCnpj
              });

            if (companyError) {
              console.error('Error creating company:', companyError);
              toast({
                title: "Erro na criação da empresa",
                description: "Sua conta foi criada, mas houve um erro ao configurar a empresa. Entre em contato com o suporte.",
                variant: "destructive"
              });
            } else if (companyData && typeof companyData === 'object' && companyData !== null && 'success' in companyData) {
              setSignUpSuccess(true);
              toast({
                title: "Cadastro realizado!",
                description: "Sua conta e empresa foram criadas com sucesso. Verifique seu e-mail para confirmar.",
              });
            }
          }
        } catch (error: any) {
          console.error('Error in admin signup:', error);
          toast({
            title: "Erro no cadastro",
            description: error.message || "Erro inesperado durante o cadastro",
            variant: "destructive"
          });
        }
      } else {
        // Validação para coordenador solicitando acesso com código
        if (!inviteCode.trim()) {
          toast({
            title: "Erro",
            description: "Por favor, informe o código da empresa",
            variant: "destructive"
          });
          return;
        }

        try {
          // Sanitize inputs
          const sanitizedName = sanitizeInput(name);

          // Create user account first
          const { data: userData, error: signupError } = await supabase.auth.signUp({
            email: email.trim().toLowerCase(),
            password,
            options: {
              data: { name: sanitizedName },
              emailRedirectTo: `${window.location.origin}/`
            }
          });

          if (signupError) {
            if (signupError.message?.includes('User already registered')) {
              toast({
                title: "Email já cadastrado",
                description: "Já existe uma conta com este email. Tente fazer login.",
                variant: "destructive"
              });
              return;
            }
            throw signupError;
          }

          if (userData.user) {
            console.log('User created, joining team...');
            
            // Join team using RPC function
            const { data: joinData, error: joinError } = await supabase
              .rpc('join_team_by_invite_code', {
                p_invite_code: inviteCode.trim()
              });

            if (joinError) {
              console.error('Error joining team:', joinError);
              
              if (joinError.message?.includes('Invalid invite code')) {
                toast({
                  title: "Código inválido",
                  description: "O código da empresa não foi encontrado.",
                  variant: "destructive"
                });
              } else {
                toast({
                  title: "Erro na solicitação",
                  description: "Falha ao solicitar acesso à equipe. Tente novamente.",
                  variant: "destructive"
                });
              }
            } else if (joinData && typeof joinData === 'object' && joinData !== null && 'team_name' in joinData) {
              setSignUpSuccess(true);
              toast({
                title: "Solicitação enviada!",
                description: `Sua solicitação de acesso à ${(joinData as any).team_name} foi enviada para aprovação.`,
              });
            }
          }
        } catch (error: any) {
          console.error('Error in coordinator signup:', error);
          toast({
            title: "Erro no cadastro",
            description: error.message || "Erro inesperado durante o cadastro",
            variant: "destructive"
          });
        }
      }
    } else {
      // Login flow
      const { data: existingUser } = await supabase
        .from('user_profiles')
        .select('email')
        .eq('email', email.trim().toLowerCase())
        .maybeSingle();
      
      const { error } = await login(email, password);
      if (error) {
        // Verificar se o erro é de credenciais inválidas mas usuário existe
        if (error.message?.includes('Invalid login credentials')) {
          if (existingUser) {
            // Usuário existe, mas senha está incorreta
            toast({
              title: "Senha incorreta",
              description: "A senha informada está incorreta. Tente novamente ou use 'Esqueci minha senha'.",
              variant: "destructive"
            });
          } else {
            // Usuário não existe, redirecionar para signup
            setSignupMessage('Você não possui uma conta cadastrada.');
            setIsSignUp(true);
            setName(''); // Limpar nome para que o usuário preencha
            setPassword(''); // Limpar senha por segurança
            toast({
              title: "Conta não encontrada",
              description: "Você não possui uma conta cadastrada. Complete o cadastro abaixo.",
              variant: "default"
            });
          }
        } else if (error.message?.includes('Email not confirmed')) {
        toast({
          title: "Email não confirmado",
          description: "Verifique seu email e clique no link de confirmação antes de fazer login.",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Erro no login",
          description: error.message,
          variant: "destructive"
        });
      }
    }
    }
  };

  const handleForgotPassword = async () => {
    if (!forgotPasswordEmail.trim()) {
      toast({
        title: "Erro",
        description: "Por favor, insira seu email",
        variant: "destructive"
      });
      return;
    }

    try {
      const { error } = await resetPassword(forgotPasswordEmail);

      if (error) {
        if (error.message?.includes('over_email_send_rate_limit') || error.message?.includes('429')) {
          toast({
            title: "Muitas tentativas",
            description: "Por segurança, você só pode solicitar um novo link após alguns minutos. Tente novamente em breve.",
            variant: "destructive"
          });
        } else {
          throw error;
        }
        return;
      }

      toast({
        title: "Link enviado!",
        description: "Link de redefinição enviado! Verifique seu e-mail para redefinir sua senha. O link é válido por 1 hora."
      });

      setShowForgotPassword(false);
      setForgotPasswordEmail('');
    } catch (error: any) {
      console.error('Error sending reset email:', error);
      toast({
        title: "Erro",
        description: "Falha ao enviar email de redefinição",
        variant: "destructive"
      });
    }
  };

  if (signUpSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <div className="flex items-center justify-between mb-4">
              <Link to="/">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Voltar
                </Button>
              </Link>
            </div>
            <CardTitle className="text-2xl font-bold text-center">
              Cadastro Realizado!
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-6">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Aguardando Aprovação</h3>
              <p className="text-muted-foreground">
                Sua conta foi criada com sucesso! Agora você precisa aguardar a aprovação 
                do administrador para ter acesso ao sistema.
              </p>
              <p className="text-sm text-muted-foreground">
                Você será notificado por email assim que sua conta for aprovada.
              </p>
            </div>
            <div className="space-y-3">
              <Button 
                onClick={() => {
                  setSignUpSuccess(false);
                  setIsSignUp(false);
                  setEmail('');
                  setPassword('');
                  setName('');
                }}
                className="w-full"
              >
                Fazer Login
              </Button>
              <Button 
                variant="outline"
                onClick={() => navigate('/')}
                className="w-full"
              >
                Voltar ao Início
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center justify-between mb-4">
            <Link to="/">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar
              </Button>
            </Link>
          </div>
          <CardTitle className="text-2xl font-bold text-center">
            {isSignUp ? 'Criar Conta' : 'Sistema de Gestão de Eventos'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {signupMessage && (
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
              <p className="text-sm text-blue-700">{signupMessage}</p>
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignUp && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="name">Nome</Label>
                  <Input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    placeholder="Seu nome completo"
                  />
                </div>

                {/* Checkbox de decisão */}
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="createCompany"
                    checked={isCreatingCompany}
                    onCheckedChange={(checked) => setIsCreatingCompany(checked as boolean)}
                  />
                  <Label htmlFor="createCompany" className="text-sm">
                    Quero cadastrar uma nova empresa
                  </Label>
                </div>

                {/* Campos condicionais baseados na escolha */}
                {isCreatingCompany ? (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="companyName">Nome da Empresa</Label>
                      <Input
                        id="companyName"
                        type="text"
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        required
                        placeholder="Nome da sua empresa"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="companyCnpj">CNPJ</Label>
                      <Input
                        id="companyCnpj"
                        type="text"
                        value={companyCnpj}
                        onChange={(e) => setCompanyCnpj(e.target.value)}
                        required
                        placeholder="00.000.000/0000-00"
                      />
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="confirmAdmin"
                        checked={confirmAdmin}
                        onCheckedChange={(checked) => setConfirmAdmin(checked as boolean)}
                      />
                      <Label htmlFor="confirmAdmin" className="text-sm">
                        Confirmo que sou o administrador legal desta empresa
                      </Label>
                    </div>
                  </>
                ) : (
                  <div className="space-y-2">
                    <Label htmlFor="inviteCode">Código da Empresa</Label>
                    <Input
                      id="inviteCode"
                      type="text"
                      value={inviteCode}
                      onChange={(e) => setInviteCode(e.target.value)}
                      required
                      placeholder="Digite o código de convite"
                      className="uppercase"
                    />
                    <p className="text-xs text-muted-foreground">
                      Solicite o código de convite ao administrador da sua empresa
                    </p>
                  </div>
                )}
              </>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="seu@email.com"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <PasswordInput
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Sua senha"
                minLength={6}
              />
            </div>

            {/* Checkbox de aceite dos termos apenas para signup */}
            {isSignUp && (
              <div className="flex items-start space-x-2">
                <Checkbox
                  id="acceptTerms"
                  checked={acceptedTerms}
                  onCheckedChange={(checked) => setAcceptedTerms(checked as boolean)}
                />
                <Label htmlFor="acceptTerms" className="text-sm leading-tight">
                  Eu li e concordo com os{' '}
                  <a
                    href="/termos-de-uso"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    Termos de Uso
                  </a>
                  {' '}e a{' '}
                  <a
                    href="/politica-de-privacidade"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    Política de Privacidade
                  </a>
                  {' '}do PlannerSystem.
                </Label>
              </div>
            )}
            
            <Button 
              type="submit" 
              className="w-full" 
              disabled={isLoading || (isSignUp && !acceptedTerms)}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isSignUp ? 'Criando...' : 'Entrando...'}
                </>
              ) : (
                isSignUp ? 'Criar Conta' : 'Entrar'
              )}
            </Button>
            
            {!isSignUp && (
              <Dialog open={showForgotPassword} onOpenChange={setShowForgotPassword}>
                <DialogTrigger asChild>
                  <Button variant="link" className="text-sm">
                    Esqueci minha senha
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                      <Mail className="w-5 h-5" />
                      Recuperar Senha
                    </DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="forgot-email">Email</Label>
                      <Input
                        id="forgot-email"
                        type="email"
                        value={forgotPasswordEmail}
                        onChange={(e) => setForgotPasswordEmail(e.target.value)}
                        placeholder="Digite seu email"
                      />
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        onClick={() => setShowForgotPassword(false)}
                      >
                        Cancelar
                      </Button>
                      <Button onClick={handleForgotPassword}>
                        Enviar Link
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            )}
            
            <Button
              type="button"
              variant="ghost"
              className="w-full"
              onClick={() => {
                setIsSignUp(!isSignUp);
                setSignupMessage(''); // Limpar mensagem ao alternar
              }}
            >
              {isSignUp ? 'Já tem conta? Fazer login' : 'Não tem conta? Criar agora'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
