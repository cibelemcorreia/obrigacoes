package br.com.contabilidade.obrigacoes.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import jakarta.validation.constraints.NotNull;

@Entity
@Table(
        name = "empresa_obrigacao",
        uniqueConstraints = @UniqueConstraint(name = "uk_empresa_obrigacao", columnNames = {"empresa_id", "obrigacao_id"})
)
public class EmpresaObrigacao {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull(message = "A empresa é obrigatória")
    @ManyToOne(optional = false)
    @JoinColumn(name = "empresa_id", nullable = false)
    private Empresa empresa;

    @NotNull(message = "A obrigação é obrigatória")
    @ManyToOne(optional = false)
    @JoinColumn(name = "obrigacao_id", nullable = false)
    private ObrigacaoAcessoria obrigacao;

    public EmpresaObrigacao() {
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Empresa getEmpresa() {
        return empresa;
    }

    public void setEmpresa(Empresa empresa) {
        this.empresa = empresa;
    }

    public ObrigacaoAcessoria getObrigacao() {
        return obrigacao;
    }

    public void setObrigacao(ObrigacaoAcessoria obrigacao) {
        this.obrigacao = obrigacao;
    }
}
