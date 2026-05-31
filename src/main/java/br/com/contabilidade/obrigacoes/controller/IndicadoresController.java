package br.com.contabilidade.obrigacoes.controller;

import br.com.contabilidade.obrigacoes.dto.IndicadoresEntregaResponse;
import br.com.contabilidade.obrigacoes.service.IndicadoresService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/indicadores")
public class IndicadoresController {

    private final IndicadoresService service;

    public IndicadoresController(IndicadoresService service) {
        this.service = service;
    }

    @GetMapping("/entregas")
    public IndicadoresEntregaResponse entregas(
            @RequestParam(required = false) Long empresaId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate competencia,
            @RequestParam(required = false) String departamento,
            @RequestParam(required = false) Integer diasProximos
    ) {
        return service.indicadoresEntregas(empresaId, competencia, departamento, diasProximos);
    }
}

