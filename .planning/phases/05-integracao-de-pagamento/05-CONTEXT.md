# Phase 5 Context: Integração de Pagamento

## User Decisions
- **Pix como principal**: Geração direta de Pix copia-e-cola e QR code.
- **Simulador de webhook local**: Para contornar limites de localhost em webhooks reais, uma Server Action simula notificações aprovadas de pagamento permitindo testar transições de status com um clique.

## Requirements Addressed
- **BOOK-03**: Exigência de sinal/reserva configurável.
- **BOOK-05**: Pagamento de sinal por Pix e confirmação de agendamento.
