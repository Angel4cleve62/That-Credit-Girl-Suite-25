type ParseOptions = { year?: number; includeScheduleC?: boolean };

export async function parseTranscriptTo1040(transcriptText: string, options?: ParseOptions) {
  const year = options?.year || detectYear(transcriptText) || new Date().getFullYear() - 1;

  // Extremely simplified mapping logic. Real logic would be more robust.
  const regexes: Record<string, RegExp> = {
    wages: /(w-?2|wages|salary)[^\d]*(\$?\s?[\d,]+\.?\d{0,2})/i,
    interest: /(1099-?int|interest)[^\d]*(\$?\s?[\d,]+\.?\d{0,2})/i,
    dividends: /(1099-?div|dividends)[^\d]*(\$?\s?[\d,]+\.?\d{0,2})/i,
    businessIncome: /(schedule\s*c|business income)[^\d]*(\$?\s?[\d,]+\.?\d{0,2})/i,
    federalTaxWithheld: /(federal tax withheld|withholding)[^\d]*(\$?\s?[\d,]+\.?\d{0,2})/i,
    agi: /(adjusted\s+gross\s+income|agi)[^\d]*(\$?\s?[\d,]+\.?\d{0,2})/i,
  };

  const matches: Record<string, number | null> = {};
  const explanations: string[] = [];

  for (const [field, re] of Object.entries(regexes)) {
    const m = transcriptText.match(re);
    const value = m ? parseCurrency(m[2]) : null;
    matches[field] = value;
    if (value != null) {
      explanations.push(`Detected ${field} as ${formatCurrency(value)} using pattern ${re.source}`);
    }
  }

  const totalIncome = sumDefined(matches.wages, matches.interest, matches.dividends, matches.businessIncome);
  const agi = (matches.agi ?? totalIncome) || 0; // fallback if AGI not directly present

  const form1040 = {
    year,
    filer: {
      name: 'Unknown',
      ssn: 'XXX-XX-XXXX',
      address: 'Unknown',
    },
    income: {
      wages: matches.wages || 0,
      taxableInterest: matches.interest || 0,
      ordinaryDividends: matches.dividends || 0,
      businessIncomeOrLoss: matches.businessIncome || 0,
      totalIncome,
    },
    adjustments: {},
    agi,
    payments: {
      federalTaxWithheld: matches.federalTaxWithheld || 0,
    },
    refund: {},
    amountYouOwe: {},
  };

  return {
    form: form1040,
    schedules: options?.includeScheduleC
      ? {
          scheduleC: {
            grossReceipts: matches.businessIncome || 0,
            expenses: 0,
            netProfit: matches.businessIncome || 0,
          },
        }
      : {},
    explanation: explanations,
    confidence: computeConfidence(matches),
  } as const;
}

function detectYear(text: string): number | null {
  const m = text.match(/20\d{2}/);
  return m ? Number(m[0]) : null;
}

function parseCurrency(raw: string): number {
  const cleaned = raw.replace(/[^\d.-]/g, '');
  const n = Number(cleaned);
  return isNaN(n) ? 0 : n;
}

function formatCurrency(n: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n);
}

function sumDefined(...values: Array<number | null | undefined>): number {
  return values.reduce((acc: number, v) => acc + (v ?? 0), 0);
}

function computeConfidence(matches: Record<string, number | null>): number {
  const fields = Object.keys(matches).length;
  const found = Object.values(matches).filter((v) => v != null).length;
  return Math.round((found / Math.max(1, fields)) * 100);
}