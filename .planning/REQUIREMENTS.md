# Requirements: Solução Já

**Defined:** 2026-06-28
**Last updated:** 2026-07-10
**Core Value:** Conectar clientes a profissionais de confiança mais próximos na Grande Vitória/ES de forma rápida, segura e transparente ("Chamou, resolveu.").

## v1 Requirements

Requirements for initial release (MVP). Each maps to roadmap phases.

### Autenticação & Usuários (AUTH)
- [x] **AUTH-01**: Cliente pode se cadastrar e logar com e-mail/senha.
- [x] **AUTH-02**: Profissional pode se cadastrar e logar com e-mail/senha.
- [x] **AUTH-03**: Usuário administrador pode logar com e-mail/senha.
- [x] **AUTH-04**: O sistema valida e-mail e telefone do usuário durante o cadastro.
- [x] **AUTH-05**: Controle de permissões baseado em papéis (client, professional, admin) gerenciado via cookies e middleware.

### Perfis de Usuário (PROF)
- [x] **PROF-01**: Cliente pode visualizar e editar seu perfil básico (Nome, foto, cidade/bairro).
- [x] **PROF-02**: Profissional pode criar perfil público com bio, foto, cidade e bairros atendidos.
- [x] **PROF-03**: Profissional define se atende em domicílio, espaço próprio ou ambos.
- [x] **PROF-04**: Profissional pode gerenciar catálogo de serviços (Nome, descrição, categoria, preço fixo/estimado e duração).
- [x] **PROF-05**: Profissional pode fazer upload de até 10 fotos no portfólio de trabalhos.
- [x] **PROF-06**: Profissional pode configurar sua agenda semanal de horários disponíveis.
- [x] **PROF-07**: Exibir selo de "Profissional Verificado" nos perfis aprovados pelo administrador.

### Busca & Descoberta (SCH)
- [x] **SCH-01**: Tela inicial exibe categorias principais, profissionais em destaque e profissionais próximos.
- [x] **SCH-02**: Cliente pode buscar profissionais por categoria, cidade e bairro da Grande Vitória/ES.
- [x] **SCH-03**: Cliente pode filtrar busca por distância aproximada, média de avaliação, preço e disponibilidade.
- [x] **SCH-04**: Ordenar resultados da busca por proximidade geográfica usando geolocalização.
- [x] **SCH-05**: Botão "Preciso Agora" lista profissionais disponíveis no mesmo dia na categoria selecionada.

### Agendamento & Reservas (BOOK)
- [x] **BOOK-01**: Cliente pode solicitar agendamento de serviço selecionando data e hora disponível na agenda do profissional.
- [x] **BOOK-02**: Profissional recebe solicitações de agendamento em tempo real e pode aceitar ou recusar.
- [x] **BOOK-03**: Profissional pode configurar exigência de sinal/reserva (Sem sinal, 30%, 50% ou valor fixo).
- [x] **BOOK-04**: Gerenciamento de status de agendamento: solicitado → aguardando confirmação → aguardando sinal → confirmado → em atendimento → concluído → cancelado/expirado.
- [x] **BOOK-05**: Integração com Mercado Pago para pagamento do sinal via Pix com confirmação automática.

### Avaliações & Denúncias (REV)
- [x] **REV-01**: Cliente pode avaliar profissional (1-5 estrelas + comentário) após conclusão do atendimento.
- [x] **REV-02**: Profissional pode avaliar cliente (1-5 estrelas + comentário) após conclusão do atendimento.
- [x] **REV-03**: Perfil exibe média de estrelas e número total de avaliações verificadas.
- [x] **REV-04**: Usuários podem denunciar perfis ou condutas inadequadas.

### Comunicação (COMM)
- [x] **COMM-01**: Perfil do profissional exibe botão "Chamar no WhatsApp" que abre conversa com mensagem pré-configurada sobre o serviço.
- [x] **COMM-02**: Envio de notificações automáticas via WhatsApp Cloud API para atualizações de agendamento (confirmação, lembrete e cobrança de sinal).

### Área Administrativa (ADM)
- [x] **ADM-01**: Painel administrativo separado para aprovação ou reprovação manual de profissionais com base nos documentos enviados.
- [x] **ADM-02**: Administrador pode gerenciar categorias de serviços (criar, editar, ordenar).
- [x] **ADM-03**: Administrador pode visualizar denúncias, bloquear/suspender usuários e moderar avaliações.
- [x] **ADM-04**: Administrador pode destacar profissionais selecionados na página inicial.
- [x] **ADM-05**: Administrador visualiza métricas gerais do app (usuários ativos, agendamentos, volume de sinal pago).

### Monetização & Planos (MON)
- [x] **MON-01**: Profissional pode assinar planos direto no painel (Gratuito, Profissional, Destaque) com liberação automática de recursos.

---

## v2 Requirements

Deferred to future release. Tracked but not in current roadmap.

- **NOTF-01**: Notificações push no PWA para navegadores suportados.
- **CHAT-01**: Chat interno no aplicativo para mensagens em tempo real.
- **MON-02**: Cobrança de taxa/comissão sobre o valor total do agendamento direto na plataforma.
- **GEO-01**: Visualização de profissionais em um mapa interativo com pins.
- **DISC-01**: Sistema de cupons e descontos promocionais.

---

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| AUTH-01 | Phase 1 | Complete |
| AUTH-02 | Phase 1 | Complete |
| AUTH-03 | Phase 1 | Complete |
| AUTH-04 | Phase 1 | Complete |
| AUTH-05 | Phase 1 | Complete |
| PROF-01 | Phase 2 | Complete |
| PROF-02 | Phase 2 | Complete |
| PROF-03 | Phase 2 | Complete |
| PROF-04 | Phase 2 | Complete |
| PROF-05 | Phase 2 | Complete |
| PROF-06 | Phase 4 | Complete |
| PROF-07 | Phase 3 | Complete |
| SCH-01  | Phase 3 | Complete |
| SCH-02  | Phase 3 | Complete |
| SCH-03  | Phase 3 | Complete |
| SCH-04  | Phase 3 | Complete |
| SCH-05  | Phase 3 | Complete |
| BOOK-01 | Phase 4 | Complete |
| BOOK-02 | Phase 4 | Complete |
| BOOK-03 | Phase 4 | Complete |
| BOOK-04 | Phase 4 | Complete |
| BOOK-05 | Phase 5 | Complete |
| REV-01  | Phase 6 | Complete |
| REV-02  | Phase 6 | Complete |
| REV-03  | Phase 6 | Complete |
| REV-04  | Phase 6 | Complete |
| COMM-01 | Phase 4 | Complete |
| COMM-02 | Phase 6 | Complete |
| ADM-01  | Phase 6 | Complete |
| ADM-02  | Phase 6 | Complete |
| ADM-03  | Phase 6 | Complete |
| ADM-04  | Phase 6 | Complete |
| ADM-05  | Phase 6 | Complete |
| MON-01  | Phase 7 | Complete |

**Coverage:**
- v1 requirements: 34 total
- Mapped to phases: 34
- Unmapped: 0 ✓
- Status: 34/34 Complete ✓

---
*Requirements defined: 2026-06-28*
*Last updated: 2026-07-10 after validation*
