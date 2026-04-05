package br.com.contabilidade.obrigacoes.service;

import br.com.contabilidade.obrigacoes.dto.EmpresaObrigacaoRequest;
import br.com.contabilidade.obrigacoes.dto.EmpresaObrigacaoResponse;
import br.com.contabilidade.obrigacoes.entity.Empresa;
import br.com.contabilidade.obrigacoes.entity.EmpresaObrigacao;
import br.com.contabilidade.obrigacoes.entity.ObrigacaoAcessoria;
import br.com.contabilidade.obrigacoes.exception.NotFoundException;
import br.com.contabilidade.obrigacoes.repository.EmpresaObrigacaoRepository;
import br.com.contabilidade.obrigacoes.repository.EmpresaRepository;
import br.com.contabilidade.obrigacoes.repository.ObrigacaoAcessoriaRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class EmpresaObrigacaoService {

    private final EmpresaObrigacaoRepository repository;
    private final EmpresaRepository empresaRepository;
    private final ObrigacaoAcessoriaRepository obrigacaoRepository;

    public EmpresaObrigacaoService(EmpresaObrigacaoRepository repository,
                                   EmpresaRepository empresaRepository,
                                   ObrigacaoAcessoriaRepository obrigacaoRepository) {
        this.repository = repository;
        this.empresaRepository = empresaRepository;
        this.obrigacaoRepository = obrigacaoRepository;
    }

    public List<EmpresaObrigacaoResponse> listar(Long empresaId) {
        List<EmpresaObrigacao> vinculos = empresaId == null
                ? repository.findAllByOrderByEmpresaNomeAscObrigacaoNomeAsc()
                : repository.findAllByEmpresaIdOrderByObrigacaoNomeAsc(empresaId);

        return vinculos.stream()
                .map(this::toResponse)
                .toList();
    }

    public EmpresaObrigacaoResponse salvar(EmpresaObrigacaoRequest request) {
        if (repository.existsByEmpresaIdAndObrigacaoId(request.empresaId(), request.obrigacaoId())) {
            throw new IllegalArgumentException("Essa obrigação já está vinculada à empresa informada");
        }

        Empresa empresa = empresaRepository.findById(request.empresaId())
                .orElseThrow(() -> new NotFoundException("Empresa não encontrada para o id informado"));

        ObrigacaoAcessoria obrigacao = obrigacaoRepository.findById(request.obrigacaoId())
                .orElseThrow(() -> new NotFoundException("Obrigação não encontrada para o id informado"));

        EmpresaObrigacao empresaObrigacao = new EmpresaObrigacao();
        empresaObrigacao.setEmpresa(empresa);
        empresaObrigacao.setObrigacao(obrigacao);

        return toResponse(repository.save(empresaObrigacao));
    }

    public void excluir(Long id) {
        if (!repository.existsById(id)) {
            throw new NotFoundException("Vínculo não encontrado para o id informado");
        }

        repository.deleteById(id);
    }

    private EmpresaObrigacaoResponse toResponse(EmpresaObrigacao empresaObrigacao) {
        return new EmpresaObrigacaoResponse(
                empresaObrigacao.getId(),
                empresaObrigacao.getEmpresa().getId(),
                empresaObrigacao.getEmpresa().getNome(),
                empresaObrigacao.getEmpresa().getCnpj(),
                empresaObrigacao.getObrigacao().getId(),
                empresaObrigacao.getObrigacao().getNome(),
                empresaObrigacao.getObrigacao().getDepartamento()
        );
    }
}
