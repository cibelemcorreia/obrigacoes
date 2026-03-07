document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("form-obrigacao");
    const tabela = document.getElementById("tabela-obrigacoes");
    const nomeInput = document.getElementById("nome");
    const periodicidadeInput = document.getElementById("periodicidade");
    const tipoPrazoInput = document.getElementById("tipoPrazo");
    const mesLimiteInput = document.getElementById("mesLimite");
    const diaLimiteInput = document.getElementById("diaLimite");
    const numeroDiaUtilInput = document.getElementById("numeroDiaUtil");
    const campoDiaLimite = document.getElementById("campo-dia-limite");
    const campoDiaUtil = document.getElementById("campo-dia-util");
    const contador = document.getElementById("contador-obrigacoes");
    const departamentoInput = document.getElementById("departamento");
    const obrigacaoIdInput = document.getElementById("obrigacaoId");
    const submitButton = document.getElementById("btn-submit");
    const cancelarEdicaoButton = document.getElementById("btn-cancelar-edicao");

    if (!form || !tabela || !nomeInput || !periodicidadeInput || !tipoPrazoInput || !mesLimiteInput || !diaLimiteInput || !numeroDiaUtilInput || !departamentoInput || !obrigacaoIdInput || !submitButton || !cancelarEdicaoButton) {
        return;
    }

    let obrigacoesCache = [];

    function ehMensal(valor) {
        return (valor || "").trim().toUpperCase() === "MENSAL";
    }

    function atualizarMesLimite() {
        const mensal = ehMensal(periodicidadeInput.value);
        const ultimoDiaUtil = ehUltimoDiaUtil();
        const exigeMes = ultimoDiaUtil || !mensal;

        mesLimiteInput.disabled = !exigeMes;
        mesLimiteInput.required = exigeMes;

        if (!exigeMes) {
            mesLimiteInput.value = "";
        }
    }

    function ehDiaUtil() {
        return (tipoPrazoInput.value || "").trim().toUpperCase() === "DIA_UTIL";
    }

    function ehUltimoDiaUtil() {
        return (tipoPrazoInput.value || "").trim().toUpperCase() === "ULTIMO_DIA_UTIL";
    }

    function atualizarTipoPrazo() {
        const usaDiaUtil = ehDiaUtil();
        const usaUltimoDiaUtil = ehUltimoDiaUtil();
        const usaCampoDiaUtil = usaDiaUtil;
        const usaCampoDiaLimite = !usaDiaUtil && !usaUltimoDiaUtil;

        periodicidadeInput.disabled = usaUltimoDiaUtil;
        if (usaUltimoDiaUtil) {
            periodicidadeInput.value = "ANUAL";
        }

        diaLimiteInput.disabled = !usaCampoDiaLimite;
        diaLimiteInput.required = usaCampoDiaLimite;
        campoDiaLimite.classList.toggle("hidden", !usaCampoDiaLimite);

        numeroDiaUtilInput.disabled = !usaCampoDiaUtil;
        numeroDiaUtilInput.required = usaCampoDiaUtil;
        campoDiaUtil.classList.toggle("hidden", !usaCampoDiaUtil);

        if (!usaCampoDiaLimite) {
            diaLimiteInput.value = "";
        }

        if (!usaCampoDiaUtil) {
            numeroDiaUtilInput.value = "";
        }

        atualizarMesLimite();
    }

    function atualizarContador(total) {
        if (!contador) {
            return;
        }

        const sufixo = total === 1 ? "registro" : "registros";
        contador.textContent = `${total} ${sufixo}`;
    }

    function limparFormulario() {
        form.reset();
        obrigacaoIdInput.value = "";
        submitButton.textContent = "Salvar";
        cancelarEdicaoButton.classList.add("hidden");
        atualizarTipoPrazo();
    }

    function preencherFormulario(obrigacao) {
        obrigacaoIdInput.value = obrigacao.id ?? "";
        nomeInput.value = obrigacao.nome ?? "";
        departamentoInput.value = obrigacao.departamento ?? "FISCAL";
        periodicidadeInput.value = obrigacao.periodicidade ?? "MENSAL";
        tipoPrazoInput.value = obrigacao.tipoPrazo ?? "DIA_FIXO";

        if (obrigacao.diaLimite != null) {
            diaLimiteInput.value = obrigacao.diaLimite;
        } else {
            diaLimiteInput.value = "";
        }

        if (obrigacao.numeroDiaUtil != null) {
            numeroDiaUtilInput.value = obrigacao.numeroDiaUtil;
        } else {
            numeroDiaUtilInput.value = "";
        }

        if (obrigacao.mesLimite != null) {
            mesLimiteInput.value = obrigacao.mesLimite;
        } else {
            mesLimiteInput.value = "";
        }

        submitButton.textContent = "Atualizar";
        cancelarEdicaoButton.classList.remove("hidden");
        atualizarTipoPrazo();
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
        const diaBase = Math.min(diaLimite, ultimoDiaMes);
        const data = new Date(ano, mesIndex, diaBase);
        return ajustarParaDiaUtilAnterior(data);
    }

    function obterProximoUltimoDiaUtil(obrigacao) {
        const hoje = new Date();
        hoje.setHours(0, 0, 0, 0);

        const periodicidade = (obrigacao.periodicidade || "").trim().toUpperCase();

        if (periodicidade === "ANUAL") {
            const mes = Number(obrigacao.mesLimite) - 1;
            if (!Number.isInteger(mes) || mes < 0 || mes > 11) {
                return null;
            }

            let ano = hoje.getFullYear();
            let vencimento = obterUltimoDiaUtil(ano, mes);

            if (vencimento < hoje) {
                ano += 1;
                vencimento = obterUltimoDiaUtil(ano, mes);
            }

            return vencimento;
        }

        let ano = hoje.getFullYear();
        let mes = hoje.getMonth();
        let vencimento = obterUltimoDiaUtil(ano, mes);

        if (vencimento < hoje) {
            mes += 1;
            if (mes > 11) {
                mes = 0;
                ano += 1;
            }
            vencimento = obterUltimoDiaUtil(ano, mes);
        }

        return vencimento;
    }

    function obterProximoDiaFixo(obrigacao) {
        const hoje = new Date();
        hoje.setHours(0, 0, 0, 0);

        const periodicidade = (obrigacao.periodicidade || "").trim().toUpperCase();
        const diaLimite = Number(obrigacao.diaLimite);

        if (!Number.isInteger(diaLimite) || diaLimite < 1) {
            return null;
        }

        if (periodicidade === "ANUAL") {
            const mes = Number(obrigacao.mesLimite) - 1;
            if (!Number.isInteger(mes) || mes < 0 || mes > 11) {
                return null;
            }

            let ano = hoje.getFullYear();
            let vencimento = obterDiaFixoComAntecipacao(ano, mes, diaLimite);

            if (!vencimento) {
                return null;
            }

            if (vencimento < hoje) {
                ano += 1;
                vencimento = obterDiaFixoComAntecipacao(ano, mes, diaLimite);
            }

            return vencimento;
        }

        let ano = hoje.getFullYear();
        let mes = hoje.getMonth();
        let vencimento = obterDiaFixoComAntecipacao(ano, mes, diaLimite);

        if (!vencimento) {
            return null;
        }

        if (vencimento < hoje) {
            mes += 1;
            if (mes > 11) {
                mes = 0;
                ano += 1;
            }
            vencimento = obterDiaFixoComAntecipacao(ano, mes, diaLimite);
        }

        return vencimento;
    }

    function obterProximoNesimoDiaUtil(obrigacao) {
        const hoje = new Date();
        hoje.setHours(0, 0, 0, 0);

        const periodicidade = (obrigacao.periodicidade || "").trim().toUpperCase();
        const numeroDiaUtil = Number(obrigacao.numeroDiaUtil);

        if (!Number.isInteger(numeroDiaUtil) || numeroDiaUtil < 1) {
            return null;
        }

        if (periodicidade === "ANUAL") {
            const mes = Number(obrigacao.mesLimite) - 1;
            if (!Number.isInteger(mes) || mes < 0 || mes > 11) {
                return null;
            }

            let ano = hoje.getFullYear();
            let vencimento = obterDiaUtilDoMes(ano, mes, numeroDiaUtil);

            if (!vencimento) {
                return null;
            }

            if (vencimento < hoje) {
                ano += 1;
                vencimento = obterDiaUtilDoMes(ano, mes, numeroDiaUtil);
            }

            return vencimento;
        }

        let ano = hoje.getFullYear();
        let mes = hoje.getMonth();
        let vencimento = obterDiaUtilDoMes(ano, mes, numeroDiaUtil);

        if (!vencimento) {
            return null;
        }

        if (vencimento < hoje) {
            mes += 1;
            if (mes > 11) {
                mes = 0;
                ano += 1;
            }
            vencimento = obterDiaUtilDoMes(ano, mes, numeroDiaUtil);
        }

        return vencimento;
    }

    function formatarPrazo(obrigacao) {
        if (obrigacao.tipoPrazo === "ULTIMO_DIA_UTIL") {
            const proximoVencimento = obterProximoUltimoDiaUtil(obrigacao);

            if (!proximoVencimento) {
                return "\u00DAltimo dia \u00FAtil";
            }

            return `\u00DAltimo dia \u00FAtil (${formatarData(proximoVencimento)})`;
        }

        if (obrigacao.tipoPrazo === "DIA_UTIL" && obrigacao.numeroDiaUtil != null) {
            const proximoVencimento = obterProximoNesimoDiaUtil(obrigacao);
            if (!proximoVencimento) {
                return `${obrigacao.numeroDiaUtil}\u00BA dia \u00FAtil`;
            }
            return `${obrigacao.numeroDiaUtil}\u00BA dia \u00FAtil (${formatarData(proximoVencimento)})`;
        }

        if (obrigacao.diaLimite != null) {
            const proximoVencimento = obterProximoDiaFixo(obrigacao);
            if (!proximoVencimento) {
                return `Dia ${obrigacao.diaLimite}`;
            }
            return `Dia ${obrigacao.diaLimite} (${formatarData(proximoVencimento)})`;
        }

        return "-";
    }

    function formatarDepartamento(departamento) {
        const valor = (departamento || "")
            .trim()
            .toUpperCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "");

        if (valor === "CONTABIL") {
            return "Cont\u00E1bil";
        }

        if (valor === "FISCAL") {
            return "Fiscal";
        }

        if (valor === "PESSOAL") {
            return "Pessoal";
        }

        return departamento ?? "-";
    }

    function formatarPeriodicidade(periodicidade) {
        const valor = (periodicidade || "").trim().toUpperCase();

        if (valor === "MENSAL") {
            return "Mensal";
        }

        if (valor === "ANUAL") {
            return "Anual";
        }

        return periodicidade ?? "-";
    }

    function renderLinha(obrigacao) {
        const prazo = formatarPrazo(obrigacao);

        return `
            <tr>
                <td>${obrigacao.id ?? "-"}</td>
                <td>${obrigacao.nome ?? "-"}</td>
                <td>${formatarDepartamento(obrigacao.departamento)}</td>
                <td>${formatarPeriodicidade(obrigacao.periodicidade)}</td>
                <td>${prazo}</td>
                <td>${obrigacao.mesLimite ?? "-"}</td>
                <td>
                    <div class="table-actions">
                        <button type="button" class="table-action-btn" data-editar-id="${obrigacao.id}">Editar</button>
                        <button type="button" class="table-action-btn danger" data-excluir-id="${obrigacao.id}">Excluir</button>
                    </div>
                </td>
            </tr>
        `;
    }

    function carregarObrigacoes() {
        fetch("/api/obrigacoes")
            .then((res) => res.json())
            .then((data) => {
                obrigacoesCache = Array.isArray(data) ? data : [];
                tabela.innerHTML = "";

                obrigacoesCache.forEach((obrigacao) => {
                    tabela.innerHTML += renderLinha(obrigacao);
                });

                atualizarContador(obrigacoesCache.length);
            })
            .catch((error) => {
                console.error("Erro ao listar obrigacoes", error);
                obrigacoesCache = [];
                tabela.innerHTML = "";
                atualizarContador(0);
            });
    }

    periodicidadeInput.addEventListener("change", atualizarMesLimite);
    tipoPrazoInput.addEventListener("change", atualizarTipoPrazo);
    cancelarEdicaoButton.addEventListener("click", () => {
        limparFormulario();
    });

    tabela.addEventListener("click", (event) => {
        const botaoEditar = event.target.closest("[data-editar-id]");
        const botaoExcluir = event.target.closest("[data-excluir-id]");

        if (botaoEditar) {
            const id = Number.parseInt(botaoEditar.dataset.editarId, 10);
            if (Number.isNaN(id)) {
                return;
            }

            const obrigacao = obrigacoesCache.find((item) => item.id === id);
            if (!obrigacao) {
                return;
            }

            preencherFormulario(obrigacao);
            form.scrollIntoView({ behavior: "smooth", block: "start" });
            return;
        }

        if (!botaoExcluir) {
            return;
        }

        const id = Number.parseInt(botaoExcluir.dataset.excluirId, 10);
        if (Number.isNaN(id)) {
            return;
        }

        const obrigacao = obrigacoesCache.find((item) => item.id === id);
        const nomeObrigacao = obrigacao?.nome ? ` "${obrigacao.nome}"` : "";
        const confirmou = window.confirm(`Deseja realmente excluir a obriga\u00E7\u00E3o${nomeObrigacao}?`);
        if (!confirmou) {
            return;
        }

        fetch(`/api/obrigacoes/${id}`, {
            method: "DELETE"
        })
            .then((response) => {
                if (!response.ok) {
                    return response.json().then((erro) => {
                        throw new Error((erro.erros || erro.mensagens || ["Erro ao excluir obriga\u00E7\u00E3o"]).join(", "));
                    });
                }
                if (Number.parseInt(obrigacaoIdInput.value, 10) === id) {
                    limparFormulario();
                }
                carregarObrigacoes();
            })
            .catch((error) => {
                alert(error.message);
            });
    });

    form.addEventListener("submit", (event) => {
        event.preventDefault();
        atualizarMesLimite();
        atualizarTipoPrazo();

        const diaLimite = Number.parseInt(diaLimiteInput.value, 10);
        const numeroDiaUtil = Number.parseInt(numeroDiaUtilInput.value, 10);
        const mesLimite = mesLimiteInput.disabled
            ? null
            : Number.parseInt(mesLimiteInput.value, 10);

        const usaDiaUtil = ehDiaUtil();
        const usaUltimoDiaUtil = ehUltimoDiaUtil();
        const diaLimiteFinal = usaDiaUtil || usaUltimoDiaUtil ? null : diaLimite;
        const numeroDiaUtilFinal = usaDiaUtil ? numeroDiaUtil : null;

        if ((!usaDiaUtil && !usaUltimoDiaUtil && Number.isNaN(diaLimiteFinal)) || (usaDiaUtil && Number.isNaN(numeroDiaUtilFinal)) || (!mesLimiteInput.disabled && Number.isNaN(mesLimite))) {
            return;
        }

        const novaObrigacao = {
            nome: nomeInput.value.trim(),
            departamento: departamentoInput.value,
            periodicidade: periodicidadeInput.value,
            tipoPrazo: tipoPrazoInput.value,
            diaLimite: diaLimiteFinal,
            numeroDiaUtil: numeroDiaUtilFinal,
            mesLimite
        };

        const idParaAtualizar = Number.parseInt(obrigacaoIdInput.value, 10);
        const estaEditando = !Number.isNaN(idParaAtualizar) && idParaAtualizar > 0;
        const endpoint = estaEditando ? `/api/obrigacoes/${idParaAtualizar}` : "/api/obrigacoes";
        const metodo = estaEditando ? "PUT" : "POST";
        const mensagemErroPadrao = estaEditando ? "Erro ao atualizar obriga\u00E7\u00E3o" : "Erro ao salvar obriga\u00E7\u00E3o";

        fetch(endpoint, {
            method: metodo,
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(novaObrigacao)
        })
            .then((response) => {
                if (!response.ok) {
                    return response.json().then((erro) => {
                        throw new Error((erro.erros || erro.mensagens || [mensagemErroPadrao]).join(", "));
                    });
                }
                return response.json();
            })
            .then(() => {
                limparFormulario();
                carregarObrigacoes();
            })
            .catch((error) => {
                alert(error.message);
            });
    });

    limparFormulario();
    carregarObrigacoes();
});

