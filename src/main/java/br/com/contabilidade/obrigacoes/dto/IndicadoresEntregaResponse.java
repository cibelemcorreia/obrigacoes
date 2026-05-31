package br.com.contabilidade.obrigacoes.dto;

import java.time.LocalDate;

public record IndicadoresEntregaResponse(
        long total,
        long pendentes,
        long entregues,
        long vencidas,
        long proximasDoVencimento,
        int diasProximos,
        LocalDate dataReferencia
) {
}

