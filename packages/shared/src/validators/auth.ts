import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().min(1, 'O e-mail é obrigatório').email('E-mail inválido'),
  password: z.string().min(6, 'A senha deve ter pelo menos 6 caracteres')
});

export const clientRegisterSchema = z.object({
  email: z.string().min(1, 'O e-mail é obrigatório').email('E-mail inválido'),
  password: z.string().min(6, 'A senha deve ter pelo menos 6 caracteres'),
  fullName: z.string().min(3, 'O nome deve ter pelo menos 3 caracteres'),
  phone: z.string().min(10, 'Telefone inválido (mínimo 10 dígitos)'),
  city: z.string().min(2, 'Informe a cidade'),
  bairro: z.string().min(2, 'Informe o bairro')
});

export const professionalRegisterSchema = clientRegisterSchema.extend({
  bio: z.string().min(10, 'A biografia deve ter pelo menos 10 caracteres'),
  cpfCnpj: z.string().min(11, 'CPF ou CNPJ inválido (mínimo 11 caracteres)'),
  category: z.string().min(1, 'Selecione uma categoria')
});

export type LoginInput = z.infer<typeof loginSchema>;
export type ClientRegisterInput = z.infer<typeof clientRegisterSchema>;
export type ProfessionalRegisterInput = z.infer<typeof professionalRegisterSchema>;
