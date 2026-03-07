package br.com.contabilidade.obrigacoes.repository;

import br.com.contabilidade.obrigacoes.entity.ObrigacaoAcessoria;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ObrigacaoAcessoriaRepository 
        extends JpaRepository<ObrigacaoAcessoria, Long> {
}
