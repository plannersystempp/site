// Validation utilities for security
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePassword = (password: string): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (password.length < 8) {
    errors.push('Senha deve ter pelo menos 8 caracteres');
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Senha deve conter pelo menos uma letra maiúscula');
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Senha deve conter pelo menos uma letra minúscula');
  }
  
  if (!/[0-9]/.test(password)) {
    errors.push('Senha deve conter pelo menos um número');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

export const sanitizeInput = (input: string): string => {
  // Enhanced XSS protection and dangerous character removal
  return input
    .trim()
    .replace(/[<>&"']/g, '') // Remove XSS vectors
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/data:/gi, '') // Remove data: protocol
    .replace(/vbscript:/gi, '') // Remove vbscript: protocol
    .replace(/on\w+\s*=/gi, ''); // Remove event handlers
};

export const sanitizeHtml = (input: string): string => {
  // HTML encode dangerous characters for display
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
};

export const validateName = (name: string): boolean => {
  const sanitized = sanitizeInput(name);
  return sanitized.length >= 2 && sanitized.length <= 100;
};

export interface PersonnelNameValidationResult {
  isValid: boolean;
  message?: string;
  suggestedName?: string;
}

export const validateUniquePersonnelName = (
  name: string, 
  existingPersonnel: Array<{ name: string }>, 
  currentPersonnelId?: string
): PersonnelNameValidationResult => {
  const trimmedName = sanitizeInput(name.trim());
  
  if (!trimmedName) {
    return { isValid: false, message: 'Nome é obrigatório' };
  }
  
  if (!validateName(trimmedName)) {
    return { isValid: false, message: 'Nome deve ter entre 2 e 100 caracteres' };
  }
  
  // Check for duplicates (case insensitive)
  const duplicate = existingPersonnel.find(p => 
    p.name.toLowerCase().trim() === trimmedName.toLowerCase() && 
    // If editing, exclude the current personnel from duplicate check
    (!currentPersonnelId || p.name !== name)
  );
  
  if (duplicate) {
    // Generate suggestions
    const suggestions = [
      `${trimmedName} (Técnico)`,
      `${trimmedName} (Coordenador)`,
      `${trimmedName} (Freelancer)`,
      `${trimmedName} (2)`,
      `${trimmedName} Jr.`,
      `${trimmedName} Sr.`
    ];
    
    // Find first suggestion that doesn't exist
    const suggestedName = suggestions.find(suggestion => 
      !existingPersonnel.some(p => 
        p.name.toLowerCase().trim() === suggestion.toLowerCase()
      )
    ) || `${trimmedName} (${Math.floor(Math.random() * 100)})`;
    
    return {
      isValid: false,
      message: `Já existe uma pessoa cadastrada com o nome "${duplicate.name}"`,
      suggestedName
    };
  }
  
  return { isValid: true };
};