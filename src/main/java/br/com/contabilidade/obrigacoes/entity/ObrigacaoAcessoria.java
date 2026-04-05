package br.com.contabilidade.obrigacoes.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

@Entity
@Table(name = "obrigacao_acessoria")
public class ObrigacaoAcessoria {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "O nome da obrigação é obrigatório")
    @Column(name = "nome", nullable = false, length = 100)
    private String nome;

    @NotBlank(message = "O departamento é obrigatório")
    @Column(name = "departamento", nullable = false, length = 100)
    private String departamento;

    @Enumerated(EnumType.STRING)
    @NotNull(message = "A periodicidade é obrigatória")
    @Column(name = "periodicidade", nullable = false)
    private Periodicidade periodicidade;

    @Enumerated(EnumType.STRING)
    @NotNull(message = "O tipo de prazo é obrigatório")
    @Column(name = "tipo_prazo", nullable = false)
    private TipoPrazo tipoPrazo;

    @Min(1)
    @Max(31)
    @Column(name = "dia_limite")
    private Integer diaLimite;

    @Min(1)
    @Max(23)
    @Column(name = "numero_dia_util")
    private Integer numeroDiaUtil;

    @Column(name = "mes_limite")
    private Integer mesLimite;

    public ObrigacaoAcessoria() {
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getNome() {
        return nome;
    }

    public void setNome(String nome) {
        this.nome = nome;
    }

    public String getDepartamento() {
        return departamento;
    }

    public void setDepartamento(String departamento) {
        this.departamento = departamento;
    }

    public Periodicidade getPeriodicidade() {
        return periodicidade;
    }

    public void setPeriodicidade(Periodicidade periodicidade) {
        this.periodicidade = periodicidade;
    }

    public TipoPrazo getTipoPrazo() {
        return tipoPrazo;
    }

    public void setTipoPrazo(TipoPrazo tipoPrazo) {
        this.tipoPrazo = tipoPrazo;
    }

    public Integer getDiaLimite() {
        return diaLimite;
    }

    public void setDiaLimite(Integer diaLimite) {
        this.diaLimite = diaLimite;
    }

    public Integer getNumeroDiaUtil() {
        return numeroDiaUtil;
    }

    public void setNumeroDiaUtil(Integer numeroDiaUtil) {
        this.numeroDiaUtil = numeroDiaUtil;
    }

    public Integer getMesLimite() {
        return mesLimite;
    }

    public void setMesLimite(Integer mesLimite) {
        this.mesLimite = mesLimite;
    }
}
