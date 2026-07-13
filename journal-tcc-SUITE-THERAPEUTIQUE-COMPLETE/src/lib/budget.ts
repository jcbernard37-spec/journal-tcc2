// ═══════════════════════════════════════════════════════
// BUDGET TOKENS — Suivi de la consommation IA
// ═══════════════════════════════════════════════════════

// Tarifs Haiku (en dollars par 1M tokens)
const TARIF_INPUT = 0.80 / 1_000_000;
const TARIF_OUTPUT = 4.00 / 1_000_000;

export interface TokenUsage {
  input_tokens: number;
  output_tokens: number;
}

export interface BudgetState {
  creditInitial: number; // en dollars
  tokensConsommes: number;
  coutTotal: number;
  creditRestant: number;
  derniereMAJ: string;
}

// Récupère ou initialise le budget
export function getBudget(): BudgetState {
  const stored = localStorage.getItem('tcc_budget');
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      return getDefaultBudget();
    }
  }
  return getDefaultBudget();
}

function getDefaultBudget(): BudgetState {
  return {
    creditInitial: 5, // Par défaut 5$ (crédit initial Anthropic)
    tokensConsommes: 0,
    coutTotal: 0,
    creditRestant: 5,
    derniereMAJ: new Date().toISOString(),
  };
}

// Enregistre le budget
export function saveBudget(budget: BudgetState): void {
  localStorage.setItem('tcc_budget', JSON.stringify(budget));
}

// Ajoute une consommation de tokens
export function enregistrerTokens(usage: TokenUsage): void {
  const budget = getBudget();
  const cout = (usage.input_tokens * TARIF_INPUT) + (usage.output_tokens * TARIF_OUTPUT);
  
  budget.tokensConsommes += usage.input_tokens + usage.output_tokens;
  budget.coutTotal += cout;
  budget.creditRestant = Math.max(0, budget.creditInitial - budget.coutTotal);
  budget.derniereMAJ = new Date().toISOString();
  
  saveBudget(budget);
}

// Met à jour le crédit initial
export function setCreditInitial(montant: number): void {
  const budget = getBudget();
  budget.creditInitial = Math.max(0, montant);
  budget.creditRestant = Math.max(0, budget.creditInitial - budget.coutTotal);
  budget.derniereMAJ = new Date().toISOString();
  saveBudget(budget);
}

// Formate pour affichage
export function formatBudget(budget: BudgetState): {
  creditInitialFormatted: string;
  coutTotalFormatted: string;
  creditRestantFormatted: string;
  pourcentageUtilise: number;
} {
  return {
    creditInitialFormatted: `$${budget.creditInitial.toFixed(2)}`,
    coutTotalFormatted: `$${budget.coutTotal.toFixed(4)}`,
    creditRestantFormatted: `$${budget.creditRestant.toFixed(4)}`,
    pourcentageUtilise: budget.creditInitial > 0 ? (budget.coutTotal / budget.creditInitial) * 100 : 0,
  };
}
