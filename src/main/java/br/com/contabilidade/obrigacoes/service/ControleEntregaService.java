package br.com.contabilidade.obrigacoes.service;

import br.com.contabilidade.obrigacoes.dto.ControleEntregaRequest;
import br.com.contabilidade.obrigacoes.dto.ControleEntregaResponse;
import br.com.contabilidade.obrigacoes.entity.ControleEntrega;
import br.com.contabilidade.obrigacoes.entity.EmpresaObrigacao;
import br.com.contabilidade.obrigacoes.entity.Periodicidade;
import br.com.contabilidade.obrigacoes.entity.StatusEntrega;
import br.com.contabilidade.obrigacoes.exception.NotFoundException;
import br.com.contabilidade.obrigacoes.repository.ControleEntregaRepository;
import br.com.contabilidade.obrigacoes.repository.EmpresaObrigacaoRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
public class ControleEntregaService {

    private final ControleEntregaRepository repository;
    private final EmpresaObrigacaoRepository empresaObrigacaoRepository;

    public ControleEntregaService(ControleEntregaRepository repository,
                                  EmpresaObrigacaoRepository empresaObrigacaoRepository) {
        this.repository = repository;
        this.empresaObrigacaoRepository = empresaObrigacaoRepository;
    }

    public List<ControleEntregaResponse> listar(Long empresaId,
                                                LocalDate competencia,
                                                String departamento,
                                                StatusEntrega status) {
        LocalDate competenciaNormalizada = normalizarCompetenciaFiltro(competencia);
        String departamentoNormalizado = normalizarDepartamento(departamento);
        return repository.findAllByOrderByCompetenciaDescEmpresaObrigacaoEmpresaNomeAscEmpresaObrigacaoObrigacaoNomeAsc()
                .stream()
                .filter(controle -> empresaId == null
                        || controle.getEmpresaObrigacao().getEmpresa().getId().equals(empresaId))
                .filter(controle -> competenciaNormalizada == null
                        || controle.getCompetencia().equals(competenciaNormalizada))
                .filter(controle -> departamentoNormalizado == null
                        || departamentoNormalizado.equalsIgnoreCase(controle.getEmpresaObrigacao().getObrigacao().getDepartamento()))
                .filter(controle -> status == null || controle.getStatus() == status)
                .map(this::toResponse)
                .toList();
    }

    private LocalDate normalizarCompetenciaFiltro(LocalDate competencia) {
        return competencia == null ? null : competencia.withDayOfMonth(1);
    }

    public ControleEntregaResponse salvar(ControleEntregaRequest request) {
        EmpresaObrigacao empresaObrigacao = empresaObrigacaoRepository.findById(request.empresaObrigacaoId())
                .orElseThrow(() -> new NotFoundException("Vínculo não encontrado para o id informado"));

        Periodicidade periodicidade = empresaObrigacao.getObrigacao().getPeriodicidade();
        LocalDate competencia = normalizarCompetencia(request.competencia(), periodicidade);
        ControleEntrega controle = repository.findByEmpresaObrigacaoIdAndCompetencia(empresaObrigacao.getId(), competencia)
                .orElseGet(ControleEntrega::new);

        controle.setEmpresaObrigacao(empresaObrigacao);
        controle.setCompetencia(competencia);
        controle.setStatus(request.status());
        controle.setDataEntrega(normalizarDataEntrega(request.status(), request.dataEntrega()));

        validarDatas(controle);
        ControleEntrega salvo = repository.save(controle);

        if (salvo.getStatus() == StatusEntrega.ENTREGUE) {
            garantirProximoControlePendente(empresaObrigacao, salvo.getCompetencia(), periodicidade);
        }

        return toResponse(salvo);
    }

    public void excluir(Long id) {
        if (!repository.existsById(id)) {
            throw new NotFoundException("Controle de entrega não encontrado para o id informado");
        }

        repository.deleteById(id);
    }

    private LocalDate normalizarCompetencia(LocalDate competencia, Periodicidade periodicidade) {
        if (competencia == null) {
            return null;
        }

        return periodicidade == Periodicidade.ANUAL
                ? competencia.withDayOfYear(1)
                : competencia.withDayOfMonth(1);
    }

    private String normalizarDepartamento(String departamento) {
        if (departamento == null || departamento.isBlank()) {
            return null;
        }

        return departamento.trim();
    }

    private LocalDate normalizarDataEntrega(StatusEntrega status, LocalDate dataEntrega) {
        if (status == StatusEntrega.PENDENTE) {
            return null;
        }

        return dataEntrega == null ? LocalDate.now() : dataEntrega;
    }

    private void validarDatas(ControleEntrega controle) {
        if (controle.getStatus() == StatusEntrega.ENTREGUE && controle.getDataEntrega() == null) {
            throw new IllegalArgumentException("A data de entrega deve ser informada para status entregue");
        }
    }

    private void garantirProximoControlePendente(EmpresaObrigacao empresaObrigacao,
                                                 LocalDate competenciaAtual,
                                                 Periodicidade periodicidade) {
        LocalDate proximaCompetencia = calcularProximaCompetencia(competenciaAtual, periodicidade);
        boolean jaExiste = repository.findByEmpresaObrigacaoIdAndCompetencia(empresaObrigacao.getId(), proximaCompetencia)
                .isPresent();
        if (jaExiste) {
            return;
        }

        ControleEntrega proximoControle = new ControleEntrega();
        proximoControle.setEmpresaObrigacao(empresaObrigacao);
        proximoControle.setCompetencia(proximaCompetencia);
        proximoControle.setStatus(StatusEntrega.PENDENTE);
        proximoControle.setDataEntrega(null);
        repository.save(proximoControle);
    }

    private LocalDate calcularProximaCompetencia(LocalDate competenciaAtual, Periodicidade periodicidade) {
        if (periodicidade == Periodicidade.ANUAL) {
            return competenciaAtual.plusYears(1).withDayOfYear(1);
        }

        return competenciaAtual.plusMonths(1).withDayOfMonth(1);
    }

    private ControleEntregaResponse toResponse(ControleEntrega controle) {
        EmpresaObrigacao empresaObrigacao = controle.getEmpresaObrigacao();

        return new ControleEntregaResponse(
                controle.getId(),
                empresaObrigacao.getId(),
                empresaObrigacao.getEmpresa().getId(),
                empresaObrigacao.getEmpresa().getNome(),
                empresaObrigacao.getEmpresa().getCnpj(),
                empresaObrigacao.getObrigacao().getId(),
                empresaObrigacao.getObrigacao().getNome(),
                empresaObrigacao.getObrigacao().getDepartamento(),
                controle.getCompetencia(),
                controle.getStatus(),
                controle.getDataEntrega()
        );
    }
}
