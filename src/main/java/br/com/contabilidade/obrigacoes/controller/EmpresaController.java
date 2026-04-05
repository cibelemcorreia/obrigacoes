package br.com.contabilidade.obrigacoes.controller;

import br.com.contabilidade.obrigacoes.entity.Empresa;
import br.com.contabilidade.obrigacoes.service.EmpresaService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/empresas")
public class EmpresaController {

    private final EmpresaService service;

    public EmpresaController(EmpresaService service) {
        this.service = service;
    }

    @GetMapping
    public List<Empresa> listar() {
        return service.listarTodas();
    }

    @GetMapping("/{id}")
    public Empresa buscarPorId(@PathVariable Long id) {
        return service.buscarPorId(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Empresa salvar(@Valid @RequestBody Empresa empresa) {
        return service.salvar(empresa);
    }

    @PutMapping("/{id}")
    public Empresa atualizar(@PathVariable Long id, @Valid @RequestBody Empresa empresa) {
        return service.atualizar(id, empresa);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void excluir(@PathVariable Long id) {
        service.excluir(id);
    }
}
