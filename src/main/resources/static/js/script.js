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

    const formEmpresa = document.getElementById("form-empresa");
    const tabelaEmpresas = document.getElementById("tabela-empresas");
    const contadorEmpresas = document.getElementById("contador-empresas");
    const empresaIdInput = document.getElementById("empresaId");
    const empresaNomeInput = document.getElementById("empresaNome");
    const empresaCnpjInput = document.getElementById("empresaCnpj");
    const submitEmpresaButton = document.getElementById("btn-submit-empresa");
    const cancelarEmpresaButton = document.getElementById("btn-cancelar-empresa");

    const formVinculo = document.getElementById("form-vinculo");
    const tabelaVinculos = document.getElementById("tabela-vinculos");
    const contadorVinculos = document.getElementById("contador-vinculos");
    const vinculoEmpresaSelect = document.getElementById("vinculoEmpresaId");
    const vinculoObrigacaoSelect = document.getElementById("vinculoObrigacaoId");
    const filtroEmpresaVinculo = document.getElementById("filtroEmpresaVinculo");

    if (!formObrigacao || !tabelaObrigacoes || !contadorObrigacoes || !obrigacaoIdInput || !nomeInput
        || !departamentoInput || !periodicidadeInput || !tipoPrazoInput || !diaLimiteInput
        || !numeroDiaUtilInput || !mesLimiteInput || !campoDiaLimite || !campoDiaUtil
        || !submitObrigacaoButton || !cancelarObrigacaoButton || !formEmpresa || !tabelaEmpresas
        || !contadorEmpresas || !empresaIdInput || !empresaNomeInput || !empresaCnpjInput
        || !submitEmpresaButton || !cancelarEmpresaButton || !formVinculo || !tabelaVinculos
        || !contadorVinculos || !vinculoEmpresaSelect || !vinculoObrigacaoSelect || !filtroEmpresaVinculo) {
        return;
    }

    let obrigacoesCache = [];
    let empresasCache = [];

    function escapeHtml(value) {
        return String(value ?? "")
            .replaceAll("&", "&amp;")
            .replaceAll("<", "&lt;")
            .replaceAll(">", "&gt;")
            .replaceAll("\"", "&quot;")
            .replaceAll("'", "&#39;");
    }

    function atualizarContador(elemento, total) {
        const sufixo = total === 1 ? "registro" : "registros";
        elemento.textContent = `${total} ${sufixo}`;
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

    function formatarPrazo(obrigacao) {
        if ((obrigacao.tipoPrazo || "").toUpperCase() === "ULTIMO_DIA_UTIL") {
            const vencimento = obterProximoVencimento(obrigacao);
            return vencimento ? `Último dia útil (${formatarData(vencimento)})` : "Último dia útil";
        }

        if ((obrigacao.tipoPrazo || "").toUpperCase() === "DIA_UTIL" && obrigacao.numeroDiaUtil != null) {
            const vencimento = obterProximoVencimento(obrigacao);
            return vencimento ? `${obrigacao.numeroDiaUtil}º dia útil (${formatarData(vencimento)})` : `${obrigacao.numeroDiaUtil}º dia útil`;
        }

        if (obrigacao.diaLimite != null) {
            const vencimento = obterProximoVencimento(obrigacao);
            return vencimento ? `Dia ${obrigacao.diaLimite} (${formatarData(vencimento)})` : `Dia ${obrigacao.diaLimite}`;
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
            getLabel: (item) => `${item.nome} - ${formatarCnpj(item.cnpj)}`
        });

        preencherSelect(filtroEmpresaVinculo, empresasCache, {
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
            ? renderEstadoVazio(7, "Nenhuma obrigação cadastrada.")
            : obrigacoesCache.map((obrigacao) => `
                <tr>
                    <td>${escapeHtml(obrigacao.id ?? "-")}</td>
                    <td>${escapeHtml(obrigacao.nome ?? "-")}</td>
                    <td>${escapeHtml(formatarDepartamento(obrigacao.departamento))}</td>
                    <td>${escapeHtml(formatarPeriodicidade(obrigacao.periodicidade))}</td>
                    <td>${escapeHtml(formatarPrazo(obrigacao))}</td>
                    <td>${escapeHtml(formatarMesLimite(obrigacao))}</td>
                    <td>
                        <div class="table-actions">
                            <button type="button" class="table-action-btn" data-editar-obrigacao="${escapeHtml(obrigacao.id)}">Editar</button>
                            <button type="button" class="table-action-btn danger" data-excluir-obrigacao="${escapeHtml(obrigacao.id)}">Excluir</button>
                        </div>
                    </td>
                </tr>
            `).join("");
        atualizarContador(contadorObrigacoes, obrigacoesCache.length);
        atualizarSelectObrigacoes();
    }

    async function carregarEmpresas() {
        empresasCache = await apiFetch("/api/empresas");
        tabelaEmpresas.innerHTML = empresasCache.length === 0
            ? renderEstadoVazio(4, "Nenhuma empresa cadastrada.")
            : empresasCache.map((empresa) => `
                <tr>
                    <td>${escapeHtml(empresa.id ?? "-")}</td>
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
        tabelaVinculos.innerHTML = vinculos.length === 0
            ? renderEstadoVazio(6, "Nenhum vínculo cadastrado.")
            : vinculos.map((vinculo) => `
                <tr>
                    <td>${escapeHtml(vinculo.id ?? "-")}</td>
                    <td>${escapeHtml(vinculo.empresaNome ?? "-")}</td>
                    <td>${escapeHtml(formatarCnpj(vinculo.empresaCnpj))}</td>
                    <td>${escapeHtml(vinculo.obrigacaoNome ?? "-")}</td>
                    <td>${escapeHtml(formatarDepartamento(vinculo.departamento))}</td>
                    <td>
                        <div class="table-actions">
                            <button type="button" class="table-action-btn danger" data-excluir-vinculo="${escapeHtml(vinculo.id)}">Excluir</button>
                        </div>
                    </td>
                </tr>
            `).join("");
        atualizarContador(contadorVinculos, vinculos.length);
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
        } catch (error) {
            alert(error.message);
        }
    });

    tabelaVinculos.addEventListener("click", async (event) => {
        const excluirButton = event.target.closest("[data-excluir-vinculo]");
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
        .then(() => carregarVinculos())
        .catch((error) => {
            alert(error.message);
        });
});
