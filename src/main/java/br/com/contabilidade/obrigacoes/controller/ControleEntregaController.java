package br.com.contabilidade.obrigacoes.controller;

import br.com.contabilidade.obrigacoes.dto.ControleEntregaRequest;
import br.com.contabilidade.obrigacoes.dto.ControleEntregaResponse;
import br.com.contabilidade.obrigacoes.entity.StatusEntrega;
import br.com.contabilidade.obrigacoes.service.ControleEntregaService;
import jakarta.validation.Valid;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/controles-entrega")
public class ControleEntregaController {

    private final ControleEntregaService service;

    public ControleEntregaController(ControleEntregaService service) {
        this.service = service;
    }

    @GetMapping
    public List<ControleEntregaResponse> listar(
            @RequestParam(required = false) Long empresaId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate competencia,
            @RequestParam(required = false) String departamento,
            @RequestParam(required = false) StatusEntrega status
    ) {
        return service.listar(empresaId, competencia, departamento, status);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ControleEntregaResponse salvar(@Valid @RequestBody ControleEntregaRequest request) {
        return service.salvar(request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void excluir(@PathVariable Long id) {
        service.excluir(id);
    }
}
