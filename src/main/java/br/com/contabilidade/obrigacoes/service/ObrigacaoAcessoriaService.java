package br.com.contabilidade.obrigacoes.service;

import br.com.contabilidade.obrigacoes.entity.ObrigacaoAcessoria;
import br.com.contabilidade.obrigacoes.entity.Periodicidade;
import br.com.contabilidade.obrigacoes.entity.TipoPrazo;
import br.com.contabilidade.obrigacoes.exception.NotFoundException;
import br.com.contabilidade.obrigacoes.repository.ObrigacaoAcessoriaRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ObrigacaoAcessoriaService {

    private final ObrigacaoAcessoriaRepository repository;

    public ObrigacaoAcessoriaService(ObrigacaoAcessoriaRepository repository) {
        this.repository = repository;
    }

    public List<ObrigacaoAcessoria> listarTodas() {
        return repository.findAll();
    }

    public ObrigacaoAcessoria buscarPorId(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new NotFoundException("Obrigação não encontrada para o id informado"));
    }

    public ObrigacaoAcessoria salvar(ObrigacaoAcessoria obrigacao) {
        validarObrigacao(obrigacao);
        return repository.save(obrigacao);
    }

    public ObrigacaoAcessoria atualizar(Long id, ObrigacaoAcessoria obrigacao) {
        if (!repository.existsById(id)) {
            throw new NotFoundException("Obrigação não encontrada para o id informado");
        }

        obrigacao.setId(id);
        validarObrigacao(obrigacao);
        return repository.save(obrigacao);
    }

    public void excluir(Long id) {
        if (!repository.existsById(id)) {
            throw new NotFoundException("Obrigação não encontrada para o id informado");
        }

        repository.deleteById(id);
    }

    private void validarObrigacao(ObrigacaoAcessoria obrigacao) {
        if (obrigacao.getDepartamento() != null) {
            obrigacao.setDepartamento(obrigacao.getDepartamento().trim());
        }

        if (obrigacao.getTipoPrazo() == TipoPrazo.ULTIMO_DIA_UTIL) {
            obrigacao.setDiaLimite(null);
            obrigacao.setNumeroDiaUtil(null);
            obrigacao.setPeriodicidade(Periodicidade.ANUAL);

            if (obrigacao.getMesLimite() == null || obrigacao.getMesLimite() < 1 || obrigacao.getMesLimite() > 12) {
                throw new IllegalArgumentException("Mês limite deve estar entre 1 e 12 para tipo ULTIMO_DIA_UTIL");
            }
            return;
        }

        if (obrigacao.getTipoPrazo() == TipoPrazo.DIA_FIXO) {
            if (obrigacao.getDiaLimite() == null || obrigacao.getDiaLimite() < 1 || obrigacao.getDiaLimite() > 31) {
                throw new IllegalArgumentException("Dia limite deve estar entre 1 e 31 para tipo DIA_FIXO");
            }
            obrigacao.setNumeroDiaUtil(null);
        } else if (obrigacao.getTipoPrazo() == TipoPrazo.DIA_UTIL) {
            if (obrigacao.getNumeroDiaUtil() == null || obrigacao.getNumeroDiaUtil() < 1
                    || obrigacao.getNumeroDiaUtil() > 23) {
                throw new IllegalArgumentException("Número do dia útil deve estar entre 1 e 23 para tipo DIA_UTIL");
            }
            obrigacao.setDiaLimite(null);
        }

        if (obrigacao.getPeriodicidade() == Periodicidade.MENSAL) {
            obrigacao.setMesLimite(null);
            return;
        }

        if (obrigacao.getMesLimite() == null || obrigacao.getMesLimite() < 1 || obrigacao.getMesLimite() > 12) {
            throw new IllegalArgumentException("Mês limite deve estar entre 1 e 12 para periodicidade ANUAL");
        }
    }
}
