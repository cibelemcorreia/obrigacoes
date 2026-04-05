package br.com.contabilidade.obrigacoes.controller;

import br.com.contabilidade.obrigacoes.dto.EmpresaObrigacaoRequest;
import br.com.contabilidade.obrigacoes.dto.EmpresaObrigacaoResponse;
import br.com.contabilidade.obrigacoes.service.EmpresaObrigacaoService;
import jakarta.validation.Valid;
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

import java.util.List;

@RestController
@RequestMapping("/api/empresa-obrigacoes")
public class EmpresaObrigacaoController {

    private final EmpresaObrigacaoService service;

    public EmpresaObrigacaoController(EmpresaObrigacaoService service) {
        this.service = service;
    }

    @GetMapping
    public List<EmpresaObrigacaoResponse> listar(@RequestParam(required = false) Long empresaId) {
        return service.listar(empresaId);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public EmpresaObrigacaoResponse salvar(@Valid @RequestBody EmpresaObrigacaoRequest request) {
        return service.salvar(request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void excluir(@PathVariable Long id) {
        service.excluir(id);
    }
}
