package br.com.contabilidade.obrigacoes.repository;

import br.com.contabilidade.obrigacoes.entity.Empresa;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EmpresaRepository extends JpaRepository<Empresa, Long> {

    List<Empresa> findAllByOrderByNomeAsc();

    boolean existsByCnpj(String cnpj);

    boolean existsByCnpjAndIdNot(String cnpj, Long id);
}
