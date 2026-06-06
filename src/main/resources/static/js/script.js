document.addEventListener("DOMContentLoaded", () => {
    const formObrigacao = document.getElementById("form-obrigacao");
    const tabelaObrigacoes = document.getElementById("tabela-obrigacoes");
    const contadorObrigacoes = document.getElementById("contador-obrigacoes");
    const obrigacaoIdInput = document.getElementById("obrigacaoId");
    const nomeInput = document.getElementById("nome");
    const departamentoInput = document.getElementById("departamento");
    const periodicidadeInput = document.getElementById("periodicidade");
    const tipoPrazoInput = document.getElementById("tipoPrazo");
    const diaLimiteInput = document.getElementById("diaLimite");
    const numeroDiaUtilInput = document.getElementById("numeroDiaUtil");
    const mesLimiteInput = document.getElementById("mesLimite");
    const campoDiaLimite = document.getElementById("campo-dia-limite");
    const campoDiaUtil = document.getElementById("campo-dia-util");
    const submitObrigacaoButton = document.getElementById("btn-submit");
    const cancelarObrigacaoButton = document.getElementById("btn-cancelar-edicao");
    const painelObrigacao = document.getElementById("painel-obrigacao");

    const formEmpresa = document.getElementById("form-empresa");
    const tabelaEmpresas = document.getElementById("tabela-empresas");
    const contadorEmpresas = document.getElementById("contador-empresas");
    const empresaIdInput = document.getElementById("empresaId");
    const empresaNomeInput = document.getElementById("empresaNome");
    const empresaCnpjInput = document.getElementById("empresaCnpj");
    const submitEmpresaButton = document.getElementById("btn-submit-empresa");
    const cancelarEmpresaButton = document.getElementById("btn-cancelar-empresa");
    const painelEmpresa = document.getElementById("painel-empresa");

    const formVinculo = document.getElementById("form-vinculo");
    const tabelaVinculos = document.getElementById("tabela-vinculos");
    const contadorVinculos = document.getElementById("contador-vinculos");
    const vinculoEmpresaSelect = document.getElementById("vinculoEmpresaId");
    const vinculoObrigacaoSelect = document.getElementById("vinculoObrigacaoId");
    const filtroEmpresaVinculo = document.getElementById("filtroEmpresaVinculo");
    const painelVinculo = document.getElementById("painel-vinculo");

    const tabelaEntregas = document.getElementById("tabela-entregas");
    const contadorEntregas = document.getElementById("contador-entregas");
    const filtroEmpresaEntrega = document.getElementById("filtroEmpresaEntrega");
    const filtroCompetenciaEntrega = document.getElementById("filtroCompetenciaEntrega");
    const filtroDepartamentoEntrega = document.getElementById("filtroDepartamentoEntrega");
    const filtroStatusEntrega = document.getElementById("filtroStatusEntrega");
    const aplicarFiltrosEntregaButton = document.getElementById("btn-aplicar-filtros-entrega");
    const limparFiltrosEntregaButton = document.getElementById("btn-limpar-filtros-entrega");

    if (!formObrigacao || !tabelaObrigacoes || !obrigacaoIdInput || !nomeInput
        || !departamentoInput || !periodicidadeInput || !tipoPrazoInput || !diaLimiteInput
        || !numeroDiaUtilInput || !mesLimiteInput || !campoDiaLimite || !campoDiaUtil
        || !submitObrigacaoButton || !cancelarObrigacaoButton || !formEmpresa || !tabelaEmpresas
        || !empresaIdInput || !empresaNomeInput || !empresaCnpjInput
        || !submitEmpresaButton || !cancelarEmpresaButton || !formVinculo || !tabelaVinculos
        || !vinculoEmpresaSelect || !vinculoObrigacaoSelect || !filtroEmpresaVinculo
        || !tabelaEntregas || !filtroEmpresaEntrega || !filtroCompetenciaEntrega
        || !filtroDepartamentoEntrega || !filtroStatusEntrega || !aplicarFiltrosEntregaButton || !limparFiltrosEntregaButton
        || !painelObrigacao || !painelEmpresa || !painelVinculo) {
        return;
    }

    function atualizarTextoDetalhes(detailsElement) {
        if (!detailsElement) {
            return;
        }

        const meta = detailsElement.querySelector(".details-meta");
        if (!meta) {
            return;
        }

        meta.textContent = detailsElement.open ? "Clique para recolher" : "Clique para expandir";
    }

    const DETAILS_PANEL_STATE_PREFIX = "obrigacoes.detailsPanel.open.";

    function obterStorageKeyPainel(detailsElement) {
        const id = String(detailsElement?.id ?? "").trim();
        if (!id) {
            return null;
        }
        return `${DETAILS_PANEL_STATE_PREFIX}${id}`;
    }

    const paineisDetalhes = Array.from(document.querySelectorAll("details.details-panel"));
    paineisDetalhes.forEach((painel) => {
        try {
            const storageKey = obterStorageKeyPainel(painel);
            if (storageKey) {
                const valor = window.localStorage.getItem(storageKey);
                if (valor === "1") {
                    painel.open = true;
                } else if (valor === "0") {
                    painel.open = false;
                }
            }
        } catch {
            // ignore
        }

        atualizarTextoDetalhes(painel);
        painel.addEventListener("toggle", () => {
            atualizarTextoDetalhes(painel);

            try {
                const storageKey = obterStorageKeyPainel(painel);
                if (storageKey) {
                    window.localStorage.setItem(storageKey, painel.open ? "1" : "0");
                }
            } catch {
                // ignore
            }
        });
    });

    let obrigacoesCache = [];
    let empresasCache = [];
    let vinculosCache = [];
    let entregasCache = [];
    let diasProximosVencimento = 10;

    const appTopbar = document.querySelector(".app-topbar");
    const menuToggleButton = document.getElementById("btn-menu");
    const homeButton = document.getElementById("app-home");
    const navLinks = Array.from(document.querySelectorAll("[data-nav-page]"));
    const appPages = Array.from(document.querySelectorAll(".app-page[data-page]"));

    function selecionarPagina(pageId) {
        const alvo = appPages.find((page) => page.dataset.page === pageId) ?? appPages[0];
        if (!alvo) {
            return;
        }

        appPages.forEach((page) => page.toggleAttribute("hidden", page !== alvo));
        navLinks.forEach((link) => link.classList.toggle("is-active", link.dataset.navPage === alvo.dataset.page));

        if (appTopbar) {
            appTopbar.classList.remove("is-menu-open");
        }
        if (menuToggleButton) {
            menuToggleButton.setAttribute("aria-expanded", "false");
        }

        const hashDesejado = `#${alvo.dataset.page}`;
        if (window.location.hash !== hashDesejado) {
            window.location.hash = hashDesejado;
        }
    }

    function obterPaginaDaUrl() {
        const raw = String(window.location.hash || "").replace(/^#/, "").trim();
        return raw || "cadastros";
    }

    if (menuToggleButton && appTopbar) {
        menuToggleButton.addEventListener("click", () => {
            const aberto = appTopbar.classList.toggle("is-menu-open");
            menuToggleButton.setAttribute("aria-expanded", aberto ? "true" : "false");
        });
    }

    if (homeButton) {
        homeButton.addEventListener("click", () => {
            selecionarPagina("cadastros");
            window.scrollTo({ top: 0, behavior: "smooth" });
        });
    }

    navLinks.forEach((link) => {
        link.addEventListener("click", () => {
            selecionarPagina(link.dataset.navPage);
        });
    });

    window.addEventListener("hashchange", () => {
        selecionarPagina(obterPaginaDaUrl());
    });

    selecionarPagina(obterPaginaDaUrl());

    function escapeHtml(value) {
        return String(value ?? "")
            .replaceAll("&", "&amp;")
            .replaceAll("<", "&lt;")
            .replaceAll(">", "&gt;")
            .replaceAll("\"", "&quot;")
            .replaceAll("'", "&#39;");
    }

    function atualizarContador(elemento, total) {
        if (!elemento) {
            return;
        }
        const sufixo = total === 1 ? "registro" : "registros";
        elemento.textContent = `${total} ${sufixo}`;
    }

    function formatarNumero(valor) {
        const numero = Number(valor);
        if (Number.isNaN(numero)) {
            return "0";
        }
        return new Intl.NumberFormat("pt-BR").format(numero);
    }

    function obterDataHojeIso() {
        const hoje = new Date();
        const ano = hoje.getFullYear();
        const mes = String(hoje.getMonth() + 1).padStart(2, "0");
        const dia = String(hoje.getDate()).padStart(2, "0");
        return `${ano}-${mes}-${dia}`;
    }

    function formatarDataIsoParaBr(valor) {
        if (!valor || !/^\d{4}-\d{2}-\d{2}$/.test(valor)) {
            return "";
        }

        const [ano, mes, dia] = valor.split("-");
        return `${dia}-${mes}-${ano}`;
    }

    function converterDataBrParaIso(valor) {
        const data = String(valor ?? "").trim();
        const somenteDigitos = data.replaceAll(/\D/g, "");
        if (!/^\d{8}$/.test(somenteDigitos)) {
            return null;
        }

        const dia = somenteDigitos.slice(0, 2);
        const mes = somenteDigitos.slice(2, 4);
        const ano = somenteDigitos.slice(4, 8);
        const iso = `${ano}-${mes}-${dia}`;
        const parsed = new Date(`${iso}T00:00:00`);
        if (Number.isNaN(parsed.getTime())) {
            return null;
        }

        return iso;
    }

    function solicitarDataEntrega(valorPadrao) {
        const padraoIso = valorPadrao || obterDataHojeIso();
        const padraoBr = formatarDataIsoParaBr(padraoIso) || "";
        const resposta = window.prompt("Informe a data da entrega (DDMMAAAA ou DD/MM/AAAA):", padraoBr);
        if (resposta === null) {
            return null;
        }

        const iso = converterDataBrParaIso(resposta);
        if (!iso) {
            alert("Data inválida. Use DDMMAAAA (ex.: 01052026) ou DD/MM/AAAA.");
            return solicitarDataEntrega(padraoIso);
        }

        return iso;
    }

    function converterMesParaCompetencia(valor) {
        if (!valor || !/^\d{4}-\d{2}$/.test(valor)) {
            return null;
        }

        return `${valor}-01`;
    }

    function converterCompetenciaParaMes(valor) {
        if (!valor || !/^\d{4}-\d{2}-\d{2}$/.test(valor)) {
            return "";
        }

        return valor.slice(0, 7);
    }

    function converterAnoParaCompetencia(valor) {
        const ano = String(valor || "").trim();
        if (!/^\d{4}$/.test(ano)) {
            return null;
        }

        return `${ano}-01-01`;
    }

    function converterCompetenciaParaAno(valor) {
        if (!valor || !/^\d{4}-\d{2}-\d{2}$/.test(valor)) {
            return "";
        }

        return valor.slice(0, 4);
    }

    async function apiFetch(url, options = {}) {
        let response;
        try {
            response = await fetch(url, options);
        } catch (error) {
            throw new Error("Não foi possível conectar com a API. Confirme se a aplicação está rodando na porta 8080.");
        }

        if (response.status === 204) {
            return null;
        }

        const body = await response.json().catch(() => null);
        if (!response.ok) {
            const mensagens = body?.erros || body?.mensagens || ["Erro ao processar a requisição"];
            throw new Error(mensagens.join(", "));
        }

        return body;
    }

    function ehMensal(valor) {
        return (valor || "").trim().toUpperCase() === "MENSAL";
    }

    function ehDiaUtil() {
        return (tipoPrazoInput.value || "").trim().toUpperCase() === "DIA_UTIL";
    }

    function ehUltimoDiaUtil() {
        return (tipoPrazoInput.value || "").trim().toUpperCase() === "ULTIMO_DIA_UTIL";
    }

    function atualizarMesLimite() {
        const exigeMes = ehUltimoDiaUtil() || !ehMensal(periodicidadeInput.value);
        mesLimiteInput.disabled = !exigeMes;
        mesLimiteInput.required = exigeMes;

        if (!exigeMes) {
            mesLimiteInput.value = "";
        }
    }

    function atualizarTipoPrazo() {
        const usaDiaUtil = ehDiaUtil();
        const usaUltimoDiaUtil = ehUltimoDiaUtil();

        periodicidadeInput.disabled = usaUltimoDiaUtil;
        if (usaUltimoDiaUtil) {
            periodicidadeInput.value = "ANUAL";
        }

        diaLimiteInput.disabled = usaDiaUtil || usaUltimoDiaUtil;
        diaLimiteInput.required = !usaDiaUtil && !usaUltimoDiaUtil;
        campoDiaLimite.classList.toggle("hidden", usaDiaUtil || usaUltimoDiaUtil);
        if (diaLimiteInput.disabled) {
            diaLimiteInput.value = "";
        }

        numeroDiaUtilInput.disabled = !usaDiaUtil;
        numeroDiaUtilInput.required = usaDiaUtil;
        campoDiaUtil.classList.toggle("hidden", !usaDiaUtil);
        if (numeroDiaUtilInput.disabled) {
            numeroDiaUtilInput.value = "";
        }

        atualizarMesLimite();
    }

    function formatarData(data) {
        return new Intl.DateTimeFormat("pt-BR").format(data);
    }

    function formatarDataIso(dataIso) {
        if (!dataIso) {
            return "-";
        }

        const data = new Date(`${dataIso}T00:00:00`);
        return Number.isNaN(data.getTime()) ? dataIso : formatarData(data);
    }

    function formatarCompetencia(competencia) {
        if (!competencia) {
            return "-";
        }

        const [ano, mes] = competencia.split("-");
        if (!ano || !mes) {
            return competencia;
        }

        return `${mes}/${ano}`;
    }

    function obterObrigacaoPorId(obrigacaoId) {
        return obrigacoesCache.find((item) => item.id === obrigacaoId) ?? null;
    }

    function obterVinculoPorId(vinculoId) {
        return vinculosCache.find((item) => item.id === vinculoId) ?? null;
    }

    function obterPeriodicidadeDaObrigacao(obrigacaoId) {
        return obterObrigacaoPorId(obrigacaoId)?.periodicidade ?? null;
    }

    function ehPeriodicidadeAnual(periodicidade) {
        return (periodicidade || "").trim().toUpperCase() === "ANUAL";
    }

    function ehEntregaAnualPorVinculoId(vinculoId) {
        const vinculo = obterVinculoPorId(vinculoId);
        return vinculo ? ehPeriodicidadeAnual(obterPeriodicidadeDaObrigacao(vinculo.obrigacaoId)) : false;
    }

    function formatarCompetenciaEntrega(entrega) {
        if (ehPeriodicidadeAnual(obterPeriodicidadeDaObrigacao(entrega.obrigacaoId))) {
            return converterCompetenciaParaAno(entrega.competencia) || "-";
        }

        return formatarCompetencia(entrega.competencia);
    }

    function ehDiaUtilCalendario(data) {
        const diaSemana = data.getDay();
        return diaSemana !== 0 && diaSemana !== 6;
    }

    function obterUltimoDiaUtil(ano, mesIndex) {
        const data = new Date(ano, mesIndex + 1, 0);
        while (!ehDiaUtilCalendario(data)) {
            data.setDate(data.getDate() - 1);
        }
        return data;
    }

    function obterDiaUtilDoMes(ano, mesIndex, numeroDiaUtil) {
        if (!Number.isInteger(numeroDiaUtil) || numeroDiaUtil < 1) {
            return null;
        }

        const ultimoDiaMes = new Date(ano, mesIndex + 1, 0).getDate();
        let contadorDiasUteis = 0;

        for (let dia = 1; dia <= ultimoDiaMes; dia += 1) {
            const data = new Date(ano, mesIndex, dia);
            if (!ehDiaUtilCalendario(data)) {
                continue;
            }

            contadorDiasUteis += 1;
            if (contadorDiasUteis === numeroDiaUtil) {
                return data;
            }
        }

        return null;
    }

    function ajustarParaDiaUtilAnterior(data) {
        while (!ehDiaUtilCalendario(data)) {
            data.setDate(data.getDate() - 1);
        }
        return data;
    }

    function obterDiaFixoComAntecipacao(ano, mesIndex, diaLimite) {
        if (!Number.isInteger(diaLimite) || diaLimite < 1) {
            return null;
        }

        const ultimoDiaMes = new Date(ano, mesIndex + 1, 0).getDate();
        return ajustarParaDiaUtilAnterior(new Date(ano, mesIndex, Math.min(diaLimite, ultimoDiaMes)));
    }

    function calcularVencimento(ano, mes, tipoPrazo, obrigacao) {
        if (tipoPrazo === "ULTIMO_DIA_UTIL") {
            return obterUltimoDiaUtil(ano, mes);
        }

        if (tipoPrazo === "DIA_UTIL") {
            return obterDiaUtilDoMes(ano, mes, Number(obrigacao.numeroDiaUtil));
        }

        return obterDiaFixoComAntecipacao(ano, mes, Number(obrigacao.diaLimite));
    }

    function obterProximoVencimento(obrigacao) {
        const hoje = new Date();
        hoje.setHours(0, 0, 0, 0);

        const periodicidade = (obrigacao.periodicidade || "").trim().toUpperCase();
        const tipoPrazo = (obrigacao.tipoPrazo || "").trim().toUpperCase();

        if (periodicidade === "ANUAL") {
            const mes = Number(obrigacao.mesLimite) - 1;
            if (!Number.isInteger(mes) || mes < 0 || mes > 11) {
                return null;
            }

            let ano = hoje.getFullYear();
            let vencimento = calcularVencimento(ano, mes, tipoPrazo, obrigacao);
            if (vencimento && vencimento < hoje) {
                vencimento = calcularVencimento(ano + 1, mes, tipoPrazo, obrigacao);
            }
            return vencimento;
        }

        let ano = hoje.getFullYear();
        let mes = hoje.getMonth();
        let vencimento = calcularVencimento(ano, mes, tipoPrazo, obrigacao);

        if (vencimento && vencimento < hoje) {
            mes += 1;
            if (mes > 11) {
                mes = 0;
                ano += 1;
            }
            vencimento = calcularVencimento(ano, mes, tipoPrazo, obrigacao);
        }

        return vencimento;
    }

    function formatarDepartamento(departamento) {
        const valor = (departamento || "").trim().toUpperCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        if (valor === "CONTABIL") {
            return "Contábil";
        }
        if (valor === "FISCAL") {
            return "Fiscal";
        }
        if (valor === "PESSOAL") {
            return "Pessoal";
        }
        return departamento || "-";
    }

    function formatarPeriodicidade(periodicidade) {
        const valor = (periodicidade || "").trim().toUpperCase();
        if (valor === "MENSAL") {
            return "Mensal";
        }
        if (valor === "ANUAL") {
            return "Anual";
        }
        return periodicidade || "-";
    }

    function formatarStatusEntrega(status) {
        return (status || "").trim().toUpperCase() === "ENTREGUE" ? "Entregue" : "Pendente";
    }

    function entregaEstaVencida(entrega) {
        if ((entrega.status || "").trim().toUpperCase() === "ENTREGUE" || !entrega.dataVencimento) {
            return false;
        }

        return entrega.dataVencimento < obterDataHojeIso();
    }

    function entregaEstaProximaDoVencimento(entrega) {
        if ((entrega.status || "").trim().toUpperCase() === "ENTREGUE" || !entrega.dataVencimento) {
            return false;
        }

        const hojeIso = obterDataHojeIso();
        const limite = new Date(`${hojeIso}T00:00:00`);
        limite.setDate(limite.getDate() + diasProximosVencimento);

        const ano = limite.getFullYear();
        const mes = String(limite.getMonth() + 1).padStart(2, "0");
        const dia = String(limite.getDate()).padStart(2, "0");
        const limiteIso = `${ano}-${mes}-${dia}`;

        return entrega.dataVencimento >= hojeIso && entrega.dataVencimento <= limiteIso;
    }

    function formatarPrazo(obrigacao) {
        if ((obrigacao.tipoPrazo || "").toUpperCase() === "ULTIMO_DIA_UTIL") {
            return "Último dia útil";
        }

        if ((obrigacao.tipoPrazo || "").toUpperCase() === "DIA_UTIL" && obrigacao.numeroDiaUtil != null) {
            return `${obrigacao.numeroDiaUtil}º dia útil`;
        }

        if (obrigacao.diaLimite != null) {
            return `Dia ${obrigacao.diaLimite}`;
        }

        return "-";
    }

    function formatarMesLimite(obrigacao) {
        return obrigacao.mesLimite == null ? "-" : `${obrigacao.mesLimite}`;
    }

    function formatarCnpj(cnpj) {
        const digitos = String(cnpj || "").replace(/\D/g, "");
        if (digitos.length !== 14) {
            return cnpj || "-";
        }

        return digitos.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, "$1.$2.$3/$4-$5");
    }

    function formatarCnpjParcial(cnpj) {
        const digitos = String(cnpj || "").replace(/\D/g, "").slice(0, 14);

        if (digitos.length <= 2) {
            return digitos;
        }

        if (digitos.length <= 5) {
            return digitos.replace(/^(\d{2})(\d+)/, "$1.$2");
        }

        if (digitos.length <= 8) {
            return digitos.replace(/^(\d{2})(\d{3})(\d+)/, "$1.$2.$3");
        }

        if (digitos.length <= 12) {
            return digitos.replace(/^(\d{2})(\d{3})(\d{3})(\d+)/, "$1.$2.$3/$4");
        }

        return digitos.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{1,2})$/, "$1.$2.$3/$4-$5");
    }

    function obterCnpjSomenteDigitos() {
        return String(empresaCnpjInput.value || "").replace(/\D/g, "").slice(0, 14);
    }

    function renderEstadoVazio(colspan, mensagem) {
        return `<tr><td colspan="${colspan}" class="empty-state">${escapeHtml(mensagem)}</td></tr>`;
    }

    function renderResumoCelula(titulo, linhas = []) {
        const detalhes = linhas
            .filter((linha) => linha != null && linha !== "" && linha !== "-")
            .map((linha) => `<span class="cell-meta">${escapeHtml(linha)}</span>`)
            .join("");

        return `
            <div class="cell-stack">
                <strong class="cell-title">${escapeHtml(titulo || "-")}</strong>
                ${detalhes}
            </div>
        `;
    }

    function preencherSelect(elemento, itens, config) {
        const valorAtual = elemento.value;
        const options = itens.map((item) => {
            const value = config.getValue(item);
            const label = config.getLabel(item);
            return `<option value="${escapeHtml(value)}">${escapeHtml(label)}</option>`;
        });

        if (config.includeBlank) {
            options.unshift(`<option value="">${escapeHtml(config.blankLabel)}</option>`);
        }

        elemento.innerHTML = options.join("");
        if (valorAtual && itens.some((item) => String(config.getValue(item)) === valorAtual)) {
            elemento.value = valorAtual;
        }
    }

    function abrirPainel(painel) {
        painel.open = true;
    }

    function limparFormularioObrigacao() {
        formObrigacao.reset();
        obrigacaoIdInput.value = "";
        submitObrigacaoButton.textContent = "Salvar";
        cancelarObrigacaoButton.classList.add("hidden");
        atualizarTipoPrazo();
    }

    function preencherFormularioObrigacao(obrigacao) {
        obrigacaoIdInput.value = obrigacao.id ?? "";
        nomeInput.value = obrigacao.nome ?? "";
        departamentoInput.value = obrigacao.departamento ?? "FISCAL";
        periodicidadeInput.value = obrigacao.periodicidade ?? "MENSAL";
        tipoPrazoInput.value = obrigacao.tipoPrazo ?? "DIA_FIXO";
        diaLimiteInput.value = obrigacao.diaLimite ?? "";
        numeroDiaUtilInput.value = obrigacao.numeroDiaUtil ?? "";
        mesLimiteInput.value = obrigacao.mesLimite ?? "";
        submitObrigacaoButton.textContent = "Atualizar";
        cancelarObrigacaoButton.classList.remove("hidden");
        atualizarTipoPrazo();
    }

    function limparFormularioEmpresa() {
        formEmpresa.reset();
        empresaIdInput.value = "";
        submitEmpresaButton.textContent = "Salvar empresa";
        cancelarEmpresaButton.classList.add("hidden");
    }

    function preencherFormularioEmpresa(empresa) {
        empresaIdInput.value = empresa.id ?? "";
        empresaNomeInput.value = empresa.nome ?? "";
        empresaCnpjInput.value = formatarCnpj(empresa.cnpj);
        submitEmpresaButton.textContent = "Atualizar empresa";
        cancelarEmpresaButton.classList.remove("hidden");
    }

    function atualizarSelectEmpresas() {
        preencherSelect(vinculoEmpresaSelect, empresasCache, {
            getValue: (item) => item.id,
            getLabel: (item) => item.nome
        });

        preencherSelect(filtroEmpresaVinculo, empresasCache, {
            getValue: (item) => item.id,
            getLabel: (item) => item.nome,
            includeBlank: true,
            blankLabel: "Todas as empresas"
        });

        preencherSelect(filtroEmpresaEntrega, empresasCache, {
            getValue: (item) => item.id,
            getLabel: (item) => item.nome,
            includeBlank: true,
            blankLabel: "Todas as empresas"
        });
    }

    function atualizarSelectObrigacoes() {
        preencherSelect(vinculoObrigacaoSelect, obrigacoesCache, {
            getValue: (item) => item.id,
            getLabel: (item) => item.nome ?? "-"
        });
    }

    async function carregarObrigacoes() {
        obrigacoesCache = await apiFetch("/api/obrigacoes");
        tabelaObrigacoes.innerHTML = obrigacoesCache.length === 0
            ? renderEstadoVazio(6, "Nenhuma obrigação cadastrada.")
            : obrigacoesCache.map((obrigacao) => {
                const prazo = formatarPrazo(obrigacao);
                const mes = formatarMesLimite(obrigacao);

                return `
                    <tr>
                        <td>${escapeHtml(obrigacao.nome ?? "-")}</td>
                        <td>${escapeHtml(formatarDepartamento(obrigacao.departamento))}</td>
                        <td>${escapeHtml(formatarPeriodicidade(obrigacao.periodicidade))}</td>
                        <td>${escapeHtml(prazo || "-")}</td>
                        <td>${escapeHtml(mes || "-")}</td>
                        <td>
                            <div class="table-actions">
                                <button type="button" class="table-action-btn" data-editar-obrigacao="${escapeHtml(obrigacao.id)}">Editar</button>
                                <button type="button" class="table-action-btn danger" data-excluir-obrigacao="${escapeHtml(obrigacao.id)}">Excluir</button>
                            </div>
                        </td>
                    </tr>
                `;
            }).join("");
        atualizarContador(contadorObrigacoes, obrigacoesCache.length);
        atualizarSelectObrigacoes();
    }

    async function carregarEmpresas() {
        empresasCache = await apiFetch("/api/empresas");
        tabelaEmpresas.innerHTML = empresasCache.length === 0
            ? renderEstadoVazio(3, "Nenhuma empresa cadastrada.")
            : empresasCache.map((empresa) => `
                <tr>
                    <td>${escapeHtml(empresa.nome ?? "-")}</td>
                    <td>${escapeHtml(formatarCnpj(empresa.cnpj))}</td>
                    <td>
                        <div class="table-actions">
                            <button type="button" class="table-action-btn" data-editar-empresa="${escapeHtml(empresa.id)}">Editar</button>
                            <button type="button" class="table-action-btn danger" data-excluir-empresa="${escapeHtml(empresa.id)}">Excluir</button>
                        </div>
                    </td>
                </tr>
            `).join("");
        atualizarContador(contadorEmpresas, empresasCache.length);
        atualizarSelectEmpresas();
    }

    async function carregarVinculos() {
        const query = filtroEmpresaVinculo.value ? `?empresaId=${encodeURIComponent(filtroEmpresaVinculo.value)}` : "";
        const vinculos = await apiFetch(`/api/empresa-obrigacoes${query}`);
        vinculosCache = await apiFetch("/api/empresa-obrigacoes");
        tabelaVinculos.innerHTML = vinculos.length === 0
            ? renderEstadoVazio(4, "Nenhum vínculo cadastrado.")
            : (() => {
                const vinculosOrdenados = [...vinculos].sort((a, b) => {
                    const empresaA = String(a.empresaNome ?? "");
                    const empresaB = String(b.empresaNome ?? "");
                    const nomeCompare = empresaA.localeCompare(empresaB, "pt-BR", { sensitivity: "base" });
                    if (nomeCompare !== 0) {
                        return nomeCompare;
                    }

                    const idA = Number(a.empresaId ?? 0);
                    const idB = Number(b.empresaId ?? 0);
                    if (idA !== idB) {
                        return idA - idB;
                    }

                    return Number(a.id ?? 0) - Number(b.id ?? 0);
                });

                const grupos = new Map();
                for (const vinculo of vinculosOrdenados) {
                    const empresaId = String(vinculo.empresaId ?? "");
                    if (!grupos.has(empresaId)) {
                        grupos.set(empresaId, []);
                    }
                    grupos.get(empresaId).push(vinculo);
                }

                const rows = [];
                for (const itens of grupos.values()) {
                    const primeiro = itens[0];
                    const extras = itens.slice(1);

                    const grupoId = String(primeiro.empresaId ?? "");
                    const temExtras = extras.length > 0;
                    const toggle = temExtras
                        ? `<button type="button" class="vinculo-toggle" data-toggle-vinculos="${escapeHtml(grupoId)}" aria-label="Mostrar mais vínculos">+</button>`
                        : "";

                    const cellObrigacao = `
                        <div class="vinculo-obrigacao-cell">
                            <span class="vinculo-obrigacao-name">${escapeHtml(primeiro.obrigacaoNome ?? "-")}</span>
                            ${toggle}
                        </div>
                    `;

                    rows.push(`
                        <tr>
                            <td>${escapeHtml(primeiro.empresaNome ?? "-")}</td>
                            <td>${escapeHtml(formatarCnpj(primeiro.empresaCnpj))}</td>
                            <td>${cellObrigacao}</td>
                            <td>
                                <div class="table-actions">
                                    <button type="button" class="table-action-btn danger" data-excluir-vinculo="${escapeHtml(primeiro.id)}">Excluir</button>
                                </div>
                            </td>
                        </tr>
                    `);

                    extras.forEach((vinculo) => {
                        rows.push(`
                            <tr class="vinculo-child hidden" data-vinculo-grupo="${escapeHtml(grupoId)}">
                                <td></td>
                                <td></td>
                                <td>${escapeHtml(vinculo.obrigacaoNome ?? "-")}</td>
                                <td>
                                    <div class="table-actions">
                                        <button type="button" class="table-action-btn danger" data-excluir-vinculo="${escapeHtml(vinculo.id)}">Excluir</button>
                                    </div>
                                </td>
                            </tr>
                        `);
                    });
                }

                return rows.join("");
            })();
        atualizarContador(contadorVinculos, vinculos.length);
    }

    async function carregarEntregas() {
        await carregarIndicadoresEntregas();

        const params = new URLSearchParams();

        if (filtroEmpresaEntrega.value) {
            params.set("empresaId", filtroEmpresaEntrega.value);
        }

        const competencia = converterMesParaCompetencia(filtroCompetenciaEntrega.value);
        if (competencia) {
            params.set("competencia", competencia);
        }

        if (filtroDepartamentoEntrega.value) {
            params.set("departamento", filtroDepartamentoEntrega.value);
        }

        if (filtroStatusEntrega.value) {
            params.set("status", filtroStatusEntrega.value);
        }

        const query = params.toString() ? `?${params.toString()}` : "";
        entregasCache = await apiFetch(`/api/controles-entrega${query}`);

        tabelaEntregas.innerHTML = entregasCache.length === 0
            ? renderEstadoVazio(8, "Nenhum controle de entrega cadastrado.")
            : entregasCache.map((entrega) => {
                const entregue = (entrega.status || "").toUpperCase() === "ENTREGUE";
                const vencida = entregaEstaVencida(entrega);
                const proximaDoVencimento = entregaEstaProximaDoVencimento(entrega);
                const rowClass = entregue
                    ? "row-delivered"
                    : vencida
                        ? "row-overdue"
                        : proximaDoVencimento
                            ? "row-near-due"
                            : "row-pending";
                const chipClass = entregue ? "is-delivered" : "is-pending";
                const statusTexto = formatarStatusEntrega(entrega.status);
                const marcadorVencida = vencida
                    ? `<span class="due-badge overdue" title="Prazo vencido" aria-label="Prazo vencido">×</span>`
                    : "";
                const marcadorProxima = proximaDoVencimento
                    ? `<span class="due-badge near" title="Próxima do vencimento" aria-label="Próxima do vencimento">!</span>`
                    : "";
                const actions = entregue
                    ? `<button type="button" class="table-action-btn secondary" data-desfazer-entrega="${escapeHtml(entrega.id)}">Desfazer entrega</button>`
                    : `<button type="button" class="table-action-btn" data-marcar-entregue="${escapeHtml(entrega.id)}">Marcar entregue</button>`;

                return `
                    <tr class="${rowClass}">
                        <td>${escapeHtml(entrega.empresaNome ?? "-")}</td>
                        <td>${escapeHtml(formatarCnpj(entrega.empresaCnpj))}</td>
                        <td>${escapeHtml(entrega.obrigacaoNome ?? "-")}</td>
                        <td>${escapeHtml(formatarDepartamento(entrega.departamento))}</td>
                        <td>${escapeHtml(formatarCompetenciaEntrega(entrega))}</td>
                        <td>
                            <div class="delivery-status">
                                <span class="status-chip ${chipClass}">${escapeHtml(statusTexto)}</span>
                                ${marcadorVencida}
                                ${marcadorProxima}
                            </div>
                        </td>
                        <td>${escapeHtml(formatarDataIso(entrega.dataEntrega))}</td>
                        <td>
                            <div class="table-actions">
                                ${actions}
                            </div>
                        </td>
                    </tr>
                `;
            }).join("");
        atualizarContador(contadorEntregas, entregasCache.length);
    }

    async function carregarIndicadoresEntregas() {
        const kpiTotal = document.getElementById("kpi-total");
        const kpiPendentes = document.getElementById("kpi-pendentes");
        const kpiEntregues = document.getElementById("kpi-entregues");
        const kpiVencidas = document.getElementById("kpi-vencidas");
        const kpiProximas = document.getElementById("kpi-proximas");
        const kpiJanela = document.getElementById("kpi-janela");

        if (!kpiTotal || !kpiPendentes || !kpiEntregues || !kpiVencidas || !kpiProximas || !kpiJanela) {
            return;
        }

        const params = new URLSearchParams();

        if (filtroEmpresaEntrega.value) {
            params.set("empresaId", filtroEmpresaEntrega.value);
        }

        const competencia = converterMesParaCompetencia(filtroCompetenciaEntrega.value);
        if (competencia) {
            params.set("competencia", competencia);
        }

        if (filtroDepartamentoEntrega.value) {
            params.set("departamento", filtroDepartamentoEntrega.value);
        }

        const query = params.toString() ? `?${params.toString()}` : "";
        const indicadores = await apiFetch(`/api/indicadores/entregas${query}`);

        kpiTotal.textContent = formatarNumero(indicadores.total);
        kpiPendentes.textContent = formatarNumero(indicadores.pendentes);
        kpiEntregues.textContent = formatarNumero(indicadores.entregues);
        kpiVencidas.textContent = formatarNumero(indicadores.vencidas);
        kpiProximas.textContent = formatarNumero(indicadores.proximasDoVencimento);

        const cardPendentes = kpiPendentes.closest(".kpi-card");
        const cardEntregues = kpiEntregues.closest(".kpi-card");
        const cardVencidas = kpiVencidas.closest(".kpi-card");
        const cardProximas = kpiProximas.closest(".kpi-card");
        cardPendentes?.classList.toggle("has-items", Number(indicadores.pendentes) > 0);
        cardEntregues?.classList.toggle("has-items", Number(indicadores.entregues) > 0);
        cardVencidas?.classList.toggle("has-alert", Number(indicadores.vencidas) > 0);
        cardProximas?.classList.toggle("has-items", Number(indicadores.proximasDoVencimento) > 0);

        const dias = Number(indicadores.diasProximos);
        if (!Number.isNaN(dias)) {
            diasProximosVencimento = dias;
        }
        kpiJanela.textContent = Number.isNaN(dias) ? "" : `Janela: hoje + ${dias} dias`;
    }

    formObrigacao.addEventListener("submit", async (event) => {
        event.preventDefault();
        atualizarTipoPrazo();

        const usaDiaUtil = ehDiaUtil();
        const usaUltimoDiaUtil = ehUltimoDiaUtil();
        const diaLimite = Number.parseInt(diaLimiteInput.value, 10);
        const numeroDiaUtil = Number.parseInt(numeroDiaUtilInput.value, 10);
        const mesLimite = mesLimiteInput.disabled ? null : Number.parseInt(mesLimiteInput.value, 10);

        if ((!usaDiaUtil && !usaUltimoDiaUtil && Number.isNaN(diaLimite))
            || (usaDiaUtil && Number.isNaN(numeroDiaUtil))
            || (!mesLimiteInput.disabled && Number.isNaN(mesLimite))) {
            return;
        }

        const payload = {
            nome: nomeInput.value.trim(),
            departamento: departamentoInput.value,
            periodicidade: periodicidadeInput.value,
            tipoPrazo: tipoPrazoInput.value,
            diaLimite: usaDiaUtil || usaUltimoDiaUtil ? null : diaLimite,
            numeroDiaUtil: usaDiaUtil ? numeroDiaUtil : null,
            mesLimite
        };

        const id = Number.parseInt(obrigacaoIdInput.value, 10);
        const editando = !Number.isNaN(id) && id > 0;

        try {
            await apiFetch(editando ? `/api/obrigacoes/${id}` : "/api/obrigacoes", {
                method: editando ? "PUT" : "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });
            limparFormularioObrigacao();
            await carregarObrigacoes();
            await carregarVinculos();
            await carregarEntregas();
        } catch (error) {
            alert(error.message);
        }
    });

    formEmpresa.addEventListener("submit", async (event) => {
        event.preventDefault();

        const payload = {
            nome: empresaNomeInput.value.trim(),
            cnpj: obterCnpjSomenteDigitos()
        };

        const id = Number.parseInt(empresaIdInput.value, 10);
        const editando = !Number.isNaN(id) && id > 0;

        try {
            await apiFetch(editando ? `/api/empresas/${id}` : "/api/empresas", {
                method: editando ? "PUT" : "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });
            limparFormularioEmpresa();
            await carregarEmpresas();
            await carregarVinculos();
            await carregarEntregas();
        } catch (error) {
            alert(error.message);
        }
    });

    formVinculo.addEventListener("submit", async (event) => {
        event.preventDefault();

        try {
            await apiFetch("/api/empresa-obrigacoes", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    empresaId: Number.parseInt(vinculoEmpresaSelect.value, 10),
                    obrigacaoId: Number.parseInt(vinculoObrigacaoSelect.value, 10)
                })
            });
            await carregarVinculos();
            await carregarEntregas();
        } catch (error) {
            alert(error.message);
        }
    });

    periodicidadeInput.addEventListener("change", atualizarMesLimite);
    tipoPrazoInput.addEventListener("change", atualizarTipoPrazo);
    empresaCnpjInput.addEventListener("input", () => {
        empresaCnpjInput.value = formatarCnpjParcial(empresaCnpjInput.value);
    });
    cancelarObrigacaoButton.addEventListener("click", limparFormularioObrigacao);
    cancelarEmpresaButton.addEventListener("click", limparFormularioEmpresa);
    filtroEmpresaVinculo.addEventListener("change", () => {
        carregarVinculos().catch((error) => alert(error.message));
    });
    aplicarFiltrosEntregaButton.addEventListener("click", () => {
        carregarEntregas().catch((error) => alert(error.message));
    });
    limparFiltrosEntregaButton.addEventListener("click", () => {
        filtroEmpresaEntrega.value = "";
        filtroCompetenciaEntrega.value = "";
        filtroDepartamentoEntrega.value = "";
        filtroStatusEntrega.value = "";
        carregarEntregas().catch((error) => alert(error.message));
    });

    tabelaObrigacoes.addEventListener("click", async (event) => {
        const editarButton = event.target.closest("[data-editar-obrigacao]");
        const excluirButton = event.target.closest("[data-excluir-obrigacao]");

        if (editarButton) {
            const id = Number.parseInt(editarButton.dataset.editarObrigacao, 10);
            const obrigacao = obrigacoesCache.find((item) => item.id === id);
            if (obrigacao) {
                preencherFormularioObrigacao(obrigacao);
                formObrigacao.scrollIntoView({ behavior: "smooth", block: "start" });
            }
            return;
        }

        if (!excluirButton) {
            return;
        }

        const id = Number.parseInt(excluirButton.dataset.excluirObrigacao, 10);
        const obrigacao = obrigacoesCache.find((item) => item.id === id);
        if (!window.confirm(`Deseja realmente excluir a obrigação "${obrigacao?.nome ?? ""}"?`)) {
            return;
        }

        try {
            await apiFetch(`/api/obrigacoes/${id}`, { method: "DELETE" });
            if (Number.parseInt(obrigacaoIdInput.value, 10) === id) {
                limparFormularioObrigacao();
            }
            await carregarObrigacoes();
            await carregarVinculos();
            await carregarEntregas();
        } catch (error) {
            alert(error.message);
        }
    });

    tabelaEmpresas.addEventListener("click", async (event) => {
        const editarButton = event.target.closest("[data-editar-empresa]");
        const excluirButton = event.target.closest("[data-excluir-empresa]");

        if (editarButton) {
            const id = Number.parseInt(editarButton.dataset.editarEmpresa, 10);
            const empresa = empresasCache.find((item) => item.id === id);
            if (empresa) {
                preencherFormularioEmpresa(empresa);
                formEmpresa.scrollIntoView({ behavior: "smooth", block: "start" });
            }
            return;
        }

        if (!excluirButton) {
            return;
        }

        const id = Number.parseInt(excluirButton.dataset.excluirEmpresa, 10);
        const empresa = empresasCache.find((item) => item.id === id);
        if (!window.confirm(`Deseja realmente excluir a empresa "${empresa?.nome ?? ""}"?`)) {
            return;
        }

        try {
            await apiFetch(`/api/empresas/${id}`, { method: "DELETE" });
            if (Number.parseInt(empresaIdInput.value, 10) === id) {
                limparFormularioEmpresa();
            }
            await carregarEmpresas();
            await carregarVinculos();
            await carregarEntregas();
        } catch (error) {
            alert(error.message);
        }
    });

    tabelaVinculos.addEventListener("click", async (event) => {
        const toggleButton = event.target.closest("[data-toggle-vinculos]");
        const excluirButton = event.target.closest("[data-excluir-vinculo]");

        if (toggleButton) {
            const grupo = toggleButton.dataset.toggleVinculos;
            if (!grupo) {
                return;
            }

            const linhas = tabelaVinculos.querySelectorAll(`[data-vinculo-grupo="${CSS.escape(grupo)}"]`);
            const algumaAberta = Array.from(linhas).some((linha) => !linha.classList.contains("hidden"));
            linhas.forEach((linha) => linha.classList.toggle("hidden", algumaAberta));
            toggleButton.textContent = algumaAberta ? "+" : "−";
            toggleButton.setAttribute("aria-label", algumaAberta ? "Mostrar mais vínculos" : "Ocultar vínculos");
            return;
        }

        if (!excluirButton) {
            return;
        }

        const id = Number.parseInt(excluirButton.dataset.excluirVinculo, 10);
        if (!window.confirm("Deseja realmente excluir este vínculo?")) {
            return;
        }

        try {
            await apiFetch(`/api/empresa-obrigacoes/${id}`, { method: "DELETE" });
            await carregarVinculos();
            await carregarEntregas();
        } catch (error) {
            alert(error.message);
        }
    });

    tabelaEntregas.addEventListener("click", async (event) => {
        const marcarEntregueButton = event.target.closest("[data-marcar-entregue]");
        const desfazerEntregaButton = event.target.closest("[data-desfazer-entrega]");
        const actionButton = marcarEntregueButton || desfazerEntregaButton;
        if (!actionButton) return;

        const id = marcarEntregueButton
            ? Number.parseInt(marcarEntregueButton.dataset.marcarEntregue, 10)
            : Number.parseInt(desfazerEntregaButton.dataset.desfazerEntrega, 10);
        const entrega = entregasCache.find((item) => item.id === id);
        if (!entrega) {
            return;
        }

        const desfazendo = Boolean(desfazerEntregaButton);
        const mensagemConfirmacao = desfazendo
            ? "Desfazer entrega e marcar como pendente?"
            : "Marcar esta obrigação como entregue?";
        if (!window.confirm(mensagemConfirmacao)) return;

        const dataEntregaSelecionada = desfazendo ? null : solicitarDataEntrega(obterDataHojeIso());
        if (!desfazendo && !dataEntregaSelecionada) {
            return;
        }

        try {
            await apiFetch("/api/controles-entrega", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    empresaObrigacaoId: entrega.empresaObrigacaoId,
                    competencia: entrega.competencia,
                    status: desfazendo ? "PENDENTE" : "ENTREGUE",
                    dataEntrega: dataEntregaSelecionada
                })
            });
            await carregarEntregas();
        } catch (error) {
            alert(error.message);
        }
    });

    limparFormularioObrigacao();
    limparFormularioEmpresa();

    Promise.all([
        carregarObrigacoes(),
        carregarEmpresas()
    ])
        .then(async () => {
            await carregarVinculos();
            await carregarEntregas();
        })
        .catch((error) => {
            alert(error.message);
        });
});
