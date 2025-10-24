/**
 * Personnel validation schemas using Zod
 * Parte 6: Validações declarativas e testáveis
 */

import { z } from 'zod';
import { validateCPF, validateCNPJ } from '@/utils/validation';

// Helper para remover caracteres não numéricos
const removeNonNumeric = (value: string): string => {
  return value.replace(/\D/g, '');
};

export const personnelSchema = z.object({
  name: z.string()
    .trim()
    .min(1, "Nome é obrigatório")
    .max(100, "Nome deve ter no máximo 100 caracteres"),
  
  email: z.string()
    .email("E-mail inválido")
    .optional()
    .or(z.literal('')),
  
  phone: z.string()
    .optional(),
  
  phone_secondary: z.string()
    .optional(),
  
  type: z.enum(['fixo', 'freelancer'], {
    errorMap: () => ({ message: "Tipo deve ser 'fixo' ou 'freelancer'" })
  }),
  
  cpf: z.string()
    .min(1, "CPF é obrigatório")
    .transform(removeNonNumeric)
    .refine(validateCPF, "CPF inválido"),
  
  cnpj: z.string()
    .optional()
    .transform(val => val ? removeNonNumeric(val) : undefined)
    .refine(val => !val || validateCNPJ(val), "CNPJ inválido"),
  
  monthly_salary: z.number()
    .min(0, "Salário não pode ser negativo")
    .optional()
    .default(0),
  
  event_cache: z.number()
    .min(0, "Cachê não pode ser negativo")
    .optional()
    .default(0),
  
  overtime_rate: z.number()
    .min(0, "Valor de hora extra não pode ser negativo")
    .optional()
    .default(0),
  
  shirt_size: z.enum(['PP', 'P', 'M', 'G', 'GG', 'XG'])
    .optional()
    .or(z.literal('')),
  
  functionIds: z.array(z.string())
    .min(1, "Selecione ao menos uma função"),
  
  primaryFunctionId: z.string()
    .optional(),
  
  photo_url: z.string()
    .url("URL de foto inválida")
    .optional()
    .or(z.literal('')),
  
  pixKey: z.string()
    .optional(),
  
  // Endereço
  address_zip_code: z.string().optional(),
  address_street: z.string().optional(),
  address_number: z.string().optional(),
  address_complement: z.string().optional(),
  address_neighborhood: z.string().optional(),
  address_city: z.string().optional(),
  address_state: z.string().optional(),
}).refine(
  (data) => {
    // Se há múltiplas funções, exigir função principal
    if (data.functionIds.length > 1 && !data.primaryFunctionId) {
      return false;
    }
    return true;
  },
  {
    message: "Selecione a função principal quando houver múltiplas funções",
    path: ["primaryFunctionId"]
  }
).refine(
  (data) => {
    // A função principal deve estar entre as selecionadas
    if (data.primaryFunctionId && !data.functionIds.includes(data.primaryFunctionId)) {
      return false;
    }
    return true;
  },
  {
    message: "A função principal deve estar entre as funções selecionadas",
    path: ["primaryFunctionId"]
  }
);

export type PersonnelSchemaType = z.infer<typeof personnelSchema>;
