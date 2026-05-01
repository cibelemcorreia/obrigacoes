package br.com.contabilidade.obrigacoes.repository;

import br.com.contabilidade.obrigacoes.entity.ControleEntrega;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface ControleEntregaRepository extends JpaRepository<ControleEntrega, Long> {

    List<ControleEntrega> findAllByOrderByCompetenciaDescEmpresaObrigacaoEmpresaNomeAscEmpresaObrigacaoObrigacaoNomeAsc();

    Optional<ControleEntrega> findByEmpresaObrigacaoIdAndCompetencia(Long empresaObrigacaoId, LocalDate competencia);

    void deleteAllByEmpresaObrigacaoId(Long empresaObrigacaoId);
}
