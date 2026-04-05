package br.com.contabilidade.obrigacoes.dto;

public record EmpresaObrigacaoResponse(
        Long id,
        Long empresaId,
        String empresaNome,
        String empresaCnpj,
        Long obrigacaoId,
        String obrigacaoNome,
        String departamento
) {
}
