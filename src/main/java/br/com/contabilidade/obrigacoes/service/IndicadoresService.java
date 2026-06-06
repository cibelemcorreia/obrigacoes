package br.com.contabilidade.obrigacoes.service;

import br.com.contabilidade.obrigacoes.dto.IndicadoresEntregaResponse;
import br.com.contabilidade.obrigacoes.entity.ControleEntrega;
import br.com.contabilidade.obrigacoes.entity.EmpresaObrigacao;
import br.com.contabilidade.obrigacoes.entity.StatusEntrega;
import br.com.contabilidade.obrigacoes.repository.ControleEntregaRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;

@Service
public class IndicadoresService {

    private final ControleEntregaRepository controleEntregaRepository;

    public IndicadoresService(ControleEntregaRepository controleEntregaRepository) {
        this.controleEntregaRepository = controleEntregaRepository;
    }

    public IndicadoresEntregaResponse indicadoresEntregas(Long empresaId,
                                                          LocalDate competencia,
                                                          String departamento,
                                                          Integer diasProximos) {
        LocalDate competenciaNormalizada = competencia == null ? null : competencia.withDayOfMonth(1);
        String departamentoNormalizado = normalizarDepartamento(departamento);
        int dias = diasProximos == null ? 10 : Math.max(0, diasProximos);

        LocalDate hoje = LocalDate.now();
        LocalDate limiteProximos = hoje.plusDays(dias);

        long total = 0;
        long pendentes = 0;
        long entregues = 0;
        long vencidas = 0;
        long proximas = 0;

        for (ControleEntrega controle : controleEntregaRepository.findAll()) {
            if (!passaFiltros(controle, empresaId, competenciaNormalizada, departamentoNormalizado)) {
                continue;
            }

            total++;

            StatusEntrega status = controle.getStatus();
            if (status == StatusEntrega.ENTREGUE) {
                entregues++;
                continue;
            }

            pendentes++;
            LocalDate vencimento = obterVencimento(controle);
            if (vencimento == null) {
                continue;
            }

            if (vencimento.isBefore(hoje)) {
                vencidas++;
            } else if (!vencimento.isAfter(limiteProximos)) {
                proximas++;
            }
        }

        return new IndicadoresEntregaResponse(
                total,
                pendentes,
                entregues,
                vencidas,
                proximas,
                dias,
                hoje
        );
    }

    private boolean passaFiltros(ControleEntrega controle,
                                 Long empresaId,
                                 LocalDate competencia,
                                 String departamento) {
        EmpresaObrigacao empresaObrigacao = controle.getEmpresaObrigacao();
        if (empresaObrigacao == null) {
            return false;
        }

        if (empresaId != null && !empresaId.equals(empresaObrigacao.getEmpresa().getId())) {
            return false;
        }

        if (competencia != null && !competencia.equals(controle.getCompetencia())) {
            return false;
        }

        if (departamento != null
                && (empresaObrigacao.getObrigacao() == null
                || !departamento.equalsIgnoreCase(empresaObrigacao.getObrigacao().getDepartamento()))) {
            return false;
        }

        return true;
    }

    private String normalizarDepartamento(String departamento) {
        if (departamento == null || departamento.isBlank()) {
            return null;
        }
        return departamento.trim();
    }

    private LocalDate obterVencimento(ControleEntrega controle) {
        if (controle.getDataVencimento() != null) {
            return controle.getDataVencimento();
        }

        EmpresaObrigacao vinculo = controle.getEmpresaObrigacao();
        if (vinculo == null || vinculo.getObrigacao() == null) {
            return null;
        }

        return PrazoEntregaCalculator.calcularVencimento(vinculo.getObrigacao(), controle.getCompetencia());
    }
}

