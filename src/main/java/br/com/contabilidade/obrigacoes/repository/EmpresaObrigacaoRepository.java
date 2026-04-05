package br.com.contabilidade.obrigacoes.repository;

import br.com.contabilidade.obrigacoes.entity.EmpresaObrigacao;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EmpresaObrigacaoRepository extends JpaRepository<EmpresaObrigacao, Long> {

    List<EmpresaObrigacao> findAllByOrderByEmpresaNomeAscObrigacaoNomeAsc();

    List<EmpresaObrigacao> findAllByEmpresaIdOrderByObrigacaoNomeAsc(Long empresaId);

    boolean existsByEmpresaIdAndObrigacaoId(Long empresaId, Long obrigacaoId);

    boolean existsByEmpresaId(Long empresaId);

    boolean existsByObrigacaoId(Long obrigacaoId);
}
