package br.com.contabilidade.obrigacoes.dto;

import br.com.contabilidade.obrigacoes.entity.StatusEntrega;

import java.time.LocalDate;

public record ControleEntregaResponse(
        Long id,
        Long empresaObrigacaoId,
        Long empresaId,
        String empresaNome,
        String empresaCnpj,
        Long obrigacaoId,
        String obrigacaoNome,
        String departamento,
        LocalDate competencia,
        StatusEntrega status,
        LocalDate dataEntrega,
        LocalDate dataVencimento
) {
}
