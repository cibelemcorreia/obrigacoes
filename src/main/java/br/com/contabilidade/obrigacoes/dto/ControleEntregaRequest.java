package br.com.contabilidade.obrigacoes.dto;

import br.com.contabilidade.obrigacoes.entity.StatusEntrega;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;

public record ControleEntregaRequest(
        @NotNull(message = "O id do vínculo é obrigatório")
        Long empresaObrigacaoId,
        @NotNull(message = "A competência é obrigatória")
        LocalDate competencia,
        @NotNull(message = "O status da entrega é obrigatório")
        StatusEntrega status,
        LocalDate dataEntrega
) {
}
