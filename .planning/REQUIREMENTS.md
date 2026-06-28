# Requirements: Solução Já

**Defined:** 2026-06-28
**Core Value:** Conectar clientes a profissionais de confiança mais próximos na Grande Vitória/ES de forma rápida, segura e transparente ("Chamou, resolveu.").

## v1 Requirements

Requirements for initial release (MVP). Each maps to roadmap phases.

### Autenticação & Usuários (AUTH)
- [ ] **AUTH-01**: Cliente pode se cadastrar e logar com e-mail/senha.
- [ ] **AUTH-02**: Profissional pode se cadastrar e logar com e-mail/senha.
- [ ] **AUTH-03**: Usuário administrador pode logar com e-mail/senha.
- [ ] **AUTH-04**: O sistema valida e-mail e telefone do usuário durante o cadastro.
- [ ] **AUTH-05**: Controle de permissões baseado em papéis (client, professional, admin) gerenciado via cookies e middleware.

### Perfis de Usuário (PROF)
- [ ] **PROF-01**: Cliente pode visualizar e editar seu perfil básico (Nome, foto, cidade/bairro).
- [ ] **PROF-02**: Profissional pode criar perfil público com bio, foto, cidade e bairros atendidos.
- [ ] **PROF-03**: Profissional define se atende em domicílio, espaço próprio ou ambos.
- [ ] **PROF-04**: Profissional pode gerenciar catálogo de serviços (Nome, descrição, categoria, preço fixo/estimado e duração).
- [ ] **PROF-05**: Profissional pode fazer upload de até 10 fotos no portfólio de trabalhos.
- [ ] **PROF-06**: Profissional pode configurar sua agenda semanal de horários disponíveis.
- [ ] **PROF-07**: Exibir selo de "Profissional Verificado" nos perfis aprovados pelo administrador.

### Busca & Descoberta (SCH)
- [ ] **SCH-01**: Tela inicial exibe categorias principais, profissionais em destaque e profissionais próximos.
- [ ] **SCH-02**: Cliente pode buscar profissionais por categoria, cidade e bairro da Grande Vitória/ES.
- [ ] **SCH-03**: Cliente pode filtrar busca por distância aproximada, média de avaliação, preço e disponibilidade.
- [ ] **SCH-04**: Ordenar resultados da busca por proximidade geográfica usando geolocalização.
- [ ] **SCH-05**: Botão "Preciso Agora" lista profissionais disponíveis no mesmo dia na categoria selecionada.

### Agendamento & Reservas (BOOK)
- [ ] **BOOK-01**: Cliente pode solicitar agendamento de serviço selecionando data e hora disponível na agenda do profissional.
- [ ] **BOOK-02**: Profissional recebe solicitações de agendamento em tempo real e pode aceitar ou recusar.
- [ ] **BOOK-03**: Profissional pode configurar exigência de sinal/reserva (Sem sinal, 30%, 50% ou valor fixo).
- [ ] **BOOK-04**: Gerenciamento de status de agendamento: solicitado → aguardando confirmação → aguardando sinal → confirmado → em atendimento → concluído → cancelado/expirado.
- [ ] **BOOK-05**: Integração com Mercado Pago para pagamento do sinal via Pix com confirmação automática.

### Avaliações & Denúncias (REV)
- [ ] **REV-01**: Cliente pode avaliar profissional (1-5 estrelas + comentário) após conclusão do atendimento.
- [ ] **REV-02**: Profissional pode avaliar cliente (1-5 estrelas + comentário) após conclusão do atendimento.
- [ ] **REV-03**: Perfil exibe média de estrelas e número total de avaliações verificadas.
- [ ] **REV-04**: Usuários podem denunciar perfis ou condutas inadequadas.

### Comunicação (COMM)
- [ ] **COMM-01**: Perfil do profissional exibe botão "Chamar no WhatsApp" que abre conversa com mensagem pré-configurada sobre o serviço.
- [ ] **COMM-02**: Envio de notificações automáticas via WhatsApp Cloud API para atualizações de agendamento (confirmação, lembrete e cobrança de sinal).

### Área Administrativa (ADM)
- [ ] **ADM-01**: Painel administrativo separado para aprovação ou reprovação manual de profissionais com base nos documentos enviados.
- [ ] **ADM-02**: Administrador pode gerenciar categorias de serviços (criar, editar, ordenar).
- [ ] **ADM-03**: Administrador pode visualizar denúncias, bloquear/suspender usuários e moderar avaliações.
- [ ] **ADM-04**: Administrador pode destacar profissionais selecionados na página inicial.
- [ ] **ADM-05**: Administrador visualiza métricas gerais do app (usuários ativos, agendamentos, volume de sinal pago).

### Monetização & Planos (MON)
- [ ] **MON-01**: Profissional pode assinar planos direto no painel (Gratuito, Profissional, Destaque) com liberação automática de recursos.

---

## v2 Requirements

Deferred to future release. Tracked but not in current roadmap.

- **NOTF-01**: Notificações push no PWA para navegadores suportados.
- **CHAT-01**: Chat interno no aplicativo para mensagens em tempo real.
- **MON-02**: Cobrança de taxa/comissão sobre o valor total do agendamento direto na plataforma.
- **GEO-01**: Visualização de profissionais em um mapa interativo com pins.
- **DISC-01**: Sistema de cupons e descontos promocionais.

---

## Out of Scope

Explicitly excluded. Documented to prevent scope creep.

| Feature | Reason |
|---------|--------|
| Aplicativo Nativo (iOS/Android) | PWA atende plenamente ao MVP com menor custo e maior agilidade. |
| Pagamento total do serviço no app | MVP foca apenas em cobrança de sinal para reduzir fricção regulatória de Split de pagamento completo. |
| Idioma adicional (Inglês) | O app é restrito regionalmente à Grande Vitória/ES. |
| Tradução automática por IA | Custos de infraestrutura e baixa relevância regional. |

---

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| AUTH-01 | Phase 1 | Pending |
| AUTH-02 | Phase 1 | Pending |
| AUTH-03 | Phase 1 | Pending |
| AUTH-04 | Phase 1 | Pending |
| AUTH-05 | Phase 1 | Pending |
| PROF-01 | Phase 2 | Pending |
| PROF-02 | Phase 2 | Pending |
| PROF-03 | Phase 2 | Pending |
| PROF-04 | Phase 2 | Pending |
| PROF-05 | Phase 2 | Pending |
| PROF-06 | Phase 4 | Pending |
| PROF-07 | Phase 3 | Pending |
| SCH-01  | Phase 3 | Pending |
| SCH-02  | Phase 3 | Pending |
| SCH-03  | Phase 3 | Pending |
| SCH-04  | Phase 3 | Pending |
| SCH-05  | Phase 3 | Pending |
| BOOK-01 | Phase 4 | Pending |
| BOOK-02 | Phase 4 | Pending |
| BOOK-03 | Phase 4 | Pending |
| BOOK-04 | Phase 4 | Pending |
| BOOK-05 | Phase 5 | Pending |
| REV-01  | Phase 6 | Pending |
| REV-02  | Phase 6 | Pending |
| REV-03  | Phase 6 | Pending |
| REV-04  | Phase 6 | Pending |
| COMM-01 | Phase 4 | Pending |
| COMM-02 | Phase 6 | Pending |
| ADM-01  | Phase 6 | Pending |
| ADM-02  | Phase 6 | Pending |
| ADM-03  | Phase 6 | Pending |
| ADM-04  | Phase 6 | Pending |
| ADM-05  | Phase 6 | Pending |
| MON-01  | Phase 7 | Pending |

**Coverage:**
- v1 requirements: 34 total
- Mapped to phases: 34
- Unmapped: 0 ✓

---
*Requirements defined: 2026-06-28*
*Last updated: 2026-06-28 after initial definition*
