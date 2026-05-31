package br.com.contabilidade.obrigacoes.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;

@Entity
@Table(
        name = "controle_entrega",
        uniqueConstraints = @UniqueConstraint(
                name = "uk_controle_entrega_vinculo_competencia",
                columnNames = {"empresa_obrigacao_id", "competencia"}
        )
)
public class ControleEntrega {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull(message = "O vínculo da empresa com a obrigação é obrigatório")
    @ManyToOne(optional = false)
    @JoinColumn(name = "empresa_obrigacao_id", nullable = false)
    private EmpresaObrigacao empresaObrigacao;

    @NotNull(message = "A competência é obrigatória")
    private LocalDate competencia;

    @NotNull(message = "O status da entrega é obrigatório")
    @Enumerated(EnumType.STRING)
    private StatusEntrega status;

    private LocalDate dataEntrega;

    private LocalDate dataVencimento;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public EmpresaObrigacao getEmpresaObrigacao() {
        return empresaObrigacao;
    }

    public void setEmpresaObrigacao(EmpresaObrigacao empresaObrigacao) {
        this.empresaObrigacao = empresaObrigacao;
    }

    public LocalDate getCompetencia() {
        return competencia;
    }

    public void setCompetencia(LocalDate competencia) {
        this.competencia = competencia;
    }

    public StatusEntrega getStatus() {
        return status;
    }

    public void setStatus(StatusEntrega status) {
        this.status = status;
    }

    public LocalDate getDataEntrega() {
        return dataEntrega;
    }

    public void setDataEntrega(LocalDate dataEntrega) {
        this.dataEntrega = dataEntrega;
    }

    public LocalDate getDataVencimento() {
        return dataVencimento;
    }

    public void setDataVencimento(LocalDate dataVencimento) {
        this.dataVencimento = dataVencimento;
    }
}
