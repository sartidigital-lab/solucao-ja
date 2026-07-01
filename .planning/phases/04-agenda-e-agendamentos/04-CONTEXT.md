# Phase 4 Context: Agenda & Agendamentos

## User Decisions
- **Slots dinâmicos baseados em duração**: Os slots são gerados dividindo o período de expediente em intervalos de 30 minutos, selecionando apenas faixas onde o serviço completo caiba sem exceder o fim do expediente ou colidir com agendamentos anteriores.
- **Transições de status**: Transições diretas controladas pelas Server Actions de agendamento que seletivamente bloqueiam acessos por papel (cliente só pode cancelar; profissional pode aceitar/recusar/cancelar/finalizar).

## Requirements Addressed
- **BOOK-01**: Escolha de data e horário livre na agenda do profissional.
- **BOOK-02**: Confirmação/recusa de reservas em tempo real por profissionais.
- **BOOK-03**: Exigência de sinal/reserva configurável (sem sinal, percentual de 30% ou valor fixo).
- **BOOK-04**: Máquina de estados para controle de status (pendente, aguardando depósito, confirmado, finalizado, cancelado).
- **PROF-06**: Configuração de horários semanais pelo profissional.
- **COMM-01**: Atalho de WhatsApp com contexto da reserva.
