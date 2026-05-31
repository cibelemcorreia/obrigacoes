package br.com.contabilidade.obrigacoes.service;

import br.com.contabilidade.obrigacoes.entity.ObrigacaoAcessoria;
import br.com.contabilidade.obrigacoes.entity.Periodicidade;
import br.com.contabilidade.obrigacoes.entity.TipoPrazo;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.YearMonth;

final class PrazoEntregaCalculator {

    private PrazoEntregaCalculator() {
    }

    static LocalDate calcularVencimento(ObrigacaoAcessoria obrigacao, LocalDate competencia) {
        if (obrigacao == null || competencia == null) {
            return null;
        }

        YearMonth mesVencimento = calcularMesVencimento(obrigacao, competencia);
        if (mesVencimento == null) {
            return null;
        }

        TipoPrazo tipoPrazo = obrigacao.getTipoPrazo();
        if (tipoPrazo == null) {
            return null;
        }

        return switch (tipoPrazo) {
            case DIA_FIXO -> calcularDiaFixo(mesVencimento, obrigacao.getDiaLimite());
            case DIA_UTIL -> calcularDiaUtil(mesVencimento, obrigacao.getNumeroDiaUtil());
            case ULTIMO_DIA_UTIL -> calcularUltimoDiaUtil(mesVencimento);
        };
    }

    private static YearMonth calcularMesVencimento(ObrigacaoAcessoria obrigacao, LocalDate competencia) {
        Periodicidade periodicidade = obrigacao.getPeriodicidade();
        if (periodicidade == null) {
            return null;
        }

        if (periodicidade == Periodicidade.MENSAL) {
            LocalDate referencia = competencia.withDayOfMonth(1).plusMonths(1);
            return YearMonth.from(referencia);
        }

        Integer mesLimite = obrigacao.getMesLimite();
        if (mesLimite == null) {
            return null;
        }

        int anoVencimento = competencia.plusYears(1).getYear();
        return YearMonth.of(anoVencimento, mesLimite);
    }

    private static LocalDate calcularDiaFixo(YearMonth mes, Integer diaLimite) {
        if (diaLimite == null) {
            return null;
        }

        int dia = Math.min(diaLimite, mes.lengthOfMonth());
        return mes.atDay(dia);
    }

    private static LocalDate calcularDiaUtil(YearMonth mes, Integer numeroDiaUtil) {
        if (numeroDiaUtil == null || numeroDiaUtil < 1) {
            return null;
        }

        int contador = 0;
        for (int dia = 1; dia <= mes.lengthOfMonth(); dia++) {
            LocalDate data = mes.atDay(dia);
            if (ehDiaUtil(data)) {
                contador++;
                if (contador == numeroDiaUtil) {
                    return data;
                }
            }
        }

        return calcularUltimoDiaUtil(mes);
    }

    private static LocalDate calcularUltimoDiaUtil(YearMonth mes) {
        LocalDate data = mes.atEndOfMonth();
        while (!ehDiaUtil(data)) {
            data = data.minusDays(1);
        }
        return data;
    }

    private static boolean ehDiaUtil(LocalDate data) {
        DayOfWeek diaSemana = data.getDayOfWeek();
        return diaSemana != DayOfWeek.SATURDAY && diaSemana != DayOfWeek.SUNDAY;
    }
}

