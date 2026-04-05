package br.com.contabilidade.obrigacoes.service;

import br.com.contabilidade.obrigacoes.entity.Empresa;
import br.com.contabilidade.obrigacoes.exception.NotFoundException;
import br.com.contabilidade.obrigacoes.repository.EmpresaObrigacaoRepository;
import br.com.contabilidade.obrigacoes.repository.EmpresaRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class EmpresaService {

    private final EmpresaRepository repository;
    private final EmpresaObrigacaoRepository empresaObrigacaoRepository;

    public EmpresaService(EmpresaRepository repository,
                          EmpresaObrigacaoRepository empresaObrigacaoRepository) {
        this.repository = repository;
        this.empresaObrigacaoRepository = empresaObrigacaoRepository;
    }

    public List<Empresa> listarTodas() {
        return repository.findAllByOrderByNomeAsc();
    }

    public Empresa buscarPorId(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new NotFoundException("Empresa não encontrada para o id informado"));
    }

    public Empresa salvar(Empresa empresa) {
        normalizarEmpresa(empresa);

        if (repository.existsByCnpj(empresa.getCnpj())) {
            throw new IllegalArgumentException("Já existe uma empresa cadastrada com esse CNPJ");
        }

        return repository.save(empresa);
    }

    public Empresa atualizar(Long id, Empresa empresa) {
        if (!repository.existsById(id)) {
            throw new NotFoundException("Empresa não encontrada para o id informado");
        }

        normalizarEmpresa(empresa);

        if (repository.existsByCnpjAndIdNot(empresa.getCnpj(), id)) {
            throw new IllegalArgumentException("Já existe uma empresa cadastrada com esse CNPJ");
        }

        empresa.setId(id);
        return repository.save(empresa);
    }

    public void excluir(Long id) {
        if (!repository.existsById(id)) {
            throw new NotFoundException("Empresa não encontrada para o id informado");
        }

        if (empresaObrigacaoRepository.existsByEmpresaId(id)) {
            throw new IllegalArgumentException("Não é possível excluir uma empresa com obrigações vinculadas");
        }

        repository.deleteById(id);
    }

    private void normalizarEmpresa(Empresa empresa) {
        if (empresa.getNome() != null) {
            empresa.setNome(empresa.getNome().trim());
        }

        if (empresa.getCnpj() != null) {
            empresa.setCnpj(empresa.getCnpj().replaceAll("\\D", ""));
        }
    }
}
