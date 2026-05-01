package br.com.contabilidade.obrigacoes.service;

import br.com.contabilidade.obrigacoes.dto.ControleEntregaRequest;
import br.com.contabilidade.obrigacoes.dto.ControleEntregaResponse;
import br.com.contabilidade.obrigacoes.entity.ControleEntrega;
import br.com.contabilidade.obrigacoes.entity.EmpresaObrigacao;
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
        LocalDate competenciaNormalizada = normalizarCompetencia(competencia);
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

    public ControleEntregaResponse salvar(ControleEntregaRequest request) {
        EmpresaObrigacao empresaObrigacao = empresaObrigacaoRepository.findById(request.empresaObrigacaoId())
                .orElseThrow(() -> new NotFoundException("Vínculo não encontrado para o id informado"));

        LocalDate competencia = normalizarCompetencia(request.competencia());
        ControleEntrega controle = repository.findByEmpresaObrigacaoIdAndCompetencia(empresaObrigacao.getId(), competencia)
                .orElseGet(ControleEntrega::new);

        controle.setEmpresaObrigacao(empresaObrigacao);
        controle.setCompetencia(competencia);
        controle.setStatus(request.status());
        controle.setDataEntrega(normalizarDataEntrega(request.status(), request.dataEntrega()));

        validarDatas(controle);
        return toResponse(repository.save(controle));
    }

    public void excluir(Long id) {
        if (!repository.existsById(id)) {
            throw new NotFoundException("Controle de entrega não encontrado para o id informado");
        }

        repository.deleteById(id);
    }

    private LocalDate normalizarCompetencia(LocalDate competencia) {
        return competencia == null ? null : competencia.withDayOfMonth(1);
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
