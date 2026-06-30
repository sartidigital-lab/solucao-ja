# Phase 2 Context: Perfil Profissional & Serviços

## User Decisions
- **Bucket RLS policies**: Public reading for portfolio images, insertion/deletion restricted to owner (`auth.uid() = owner_id`).
- **Raio de atendimento e bio**: Preenchimento obrigatório no perfil para poder aparecer nos resultados de busca da Phase 3.
- **Validação síncrona do CPF/CNPJ**: Validação na Server Action via chamada à `BrasilAPI` (com fallback para aprovação manual `pending` se indisponível).

## Requirements Addressed
- **PROF-01**: Atualização de dados cadastrais do profissional.
- **PROF-02**: Catálogo de serviços prestados (CRUD).
- **PROF-03**: Cadastro de portfólio de imagens.
- **PROF-04**: Limites de imagens (máximo 10) e tamanho (máximo 5MB).
