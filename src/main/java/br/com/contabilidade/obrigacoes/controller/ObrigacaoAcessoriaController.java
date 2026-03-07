package br.com.contabilidade.obrigacoes.controller;

import br.com.contabilidade.obrigacoes.entity.ObrigacaoAcessoria;
import br.com.contabilidade.obrigacoes.service.ObrigacaoAcessoriaService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping({"/api/obrigacoes"})
public class ObrigacaoAcessoriaController {

    private final ObrigacaoAcessoriaService service;

    public ObrigacaoAcessoriaController(ObrigacaoAcessoriaService service) {
        this.service = service;
    }

    @GetMapping
    public List<ObrigacaoAcessoria> listar() {
        return service.listarTodas();
    }

    @GetMapping("/{id}")
    public ObrigacaoAcessoria buscarPorId(@PathVariable Long id) {
        return service.buscarPorId(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ObrigacaoAcessoria salvar(@Valid @RequestBody ObrigacaoAcessoria obrigacao) {
        return service.salvar(obrigacao);
    }

    @PutMapping("/{id}")
    public ObrigacaoAcessoria atualizar(@PathVariable Long id, @Valid @RequestBody ObrigacaoAcessoria obrigacao) {
        return service.atualizar(id, obrigacao);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void excluir(@PathVariable Long id) {
        service.excluir(id);
    }

}
