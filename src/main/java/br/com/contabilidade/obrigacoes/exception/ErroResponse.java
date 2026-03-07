package br.com.contabilidade.obrigacoes.exception;

import java.time.LocalDateTime;
import java.util.List;

public class ErroResponse {

    private LocalDateTime timestamp;
    private int status;
    private List<String> erros;

    public ErroResponse(int status, List<String> erros) {
        this.timestamp = LocalDateTime.now();
        this.status = status;
        this.erros = erros;
    }

    public LocalDateTime getTimestamp() {
        return timestamp;
    }

    public int getStatus() {
        return status;
    }

    public List<String> getErros() {
        return erros;
    }
}
