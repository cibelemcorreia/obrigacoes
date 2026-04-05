package br.com.contabilidade.obrigacoes.dto;

import jakarta.validation.constraints.NotNull;

public record EmpresaObrigacaoRequest(
        @NotNull(message = "O id da empresa é obrigatório")
        Long empresaId,
        @NotNull(message = "O id da obrigação é obrigatório")
        Long obrigacaoId
) {
}
