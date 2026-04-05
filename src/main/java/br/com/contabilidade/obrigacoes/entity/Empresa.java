package br.com.contabilidade.obrigacoes.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

@Entity
@Table(name = "empresa")
public class Empresa {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "O nome da empresa é obrigatório")
    @Column(name = "nome", nullable = false, length = 150)
    private String nome;

    @NotBlank(message = "O CNPJ é obrigatório")
    @Pattern(regexp = "\\d{14}", message = "O CNPJ deve conter 14 dígitos numéricos")
    @Column(name = "cnpj", nullable = false, unique = true, length = 14)
    private String cnpj;

    public Empresa() {
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

    public String getCnpj() {
        return cnpj;
    }

    public void setCnpj(String cnpj) {
        this.cnpj = cnpj;
    }
}
