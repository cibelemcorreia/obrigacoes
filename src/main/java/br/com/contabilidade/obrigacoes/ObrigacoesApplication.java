package br.com.contabilidade.obrigacoes;

import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class ObrigacoesApplication implements CommandLineRunner {

    public static void main(String[] args) {
        SpringApplication.run(ObrigacoesApplication.class, args);
    }

    @Override
    public void run(String... args) {
        System.out.println("Sistema de Controle de Obrigações Acessórias iniciado com sucesso!");
    }
}
