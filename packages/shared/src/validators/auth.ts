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

export const clientProfileSchema = z.object({
  fullName: z.string().min(3, 'O nome deve ter pelo menos 3 caracteres'),
  phone: z.string().min(10, 'Telefone inválido (mínimo 10 dígitos)'),
  city: z.string().min(2, 'Informe a cidade'),
  bairro: z.string().min(2, 'Informe o bairro')
});

export const professionalProfileSchema = clientProfileSchema.extend({
  bio: z.string().min(10, 'A biografia deve ter pelo menos 10 caracteres'),
  cpfCnpj: z.string().min(11, 'CPF ou CNPJ inválido (mínimo 11 caracteres)'),
  attendanceType: z.enum(['home', 'salon', 'both']),
  serviceAreaRadiusKm: z.number().min(1, 'O raio mínimo é de 1 km').max(100, 'O raio máximo é de 100 km'),
  isAvailableNow: z.boolean(),
  depositPolicy: z.enum(['no_deposit', 'fixed_amount', 'percentage']).default('no_deposit'),
  depositFixedAmount: z.number().min(0, 'O valor não pode ser negativo').default(0)
});

export const serviceSchema = z.object({
  name: z.string().min(3, 'O nome do serviço deve ter pelo menos 3 caracteres'),
  description: z.string().optional().nullable(),
  price: z.number().min(0, 'O preço não pode ser negativo'),
  durationMinutes: z.number().min(5, 'A duração mínima é de 5 minutos'),
  categoryId: z.string().uuid('Selecione uma categoria válida')
});

export type ClientProfileInput = z.infer<typeof clientProfileSchema>;
export type ProfessionalProfileInput = z.infer<typeof professionalProfileSchema>;
export type ServiceInput = z.infer<typeof serviceSchema>;

