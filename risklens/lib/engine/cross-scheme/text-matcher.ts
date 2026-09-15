import { NormalizedProject, MatchSignal } from "@/lib/types";
import { normalizeCategoryToStandard } from "../schemes/scheme-registry";

export interface TextMatchResult {
  textScorePct: number;
  categoryScorePct: number;
  entityScorePct: number;
  isSameEntity: boolean;
  descriptionSignal: MatchSignal;
  categorySignal: MatchSignal;
  entitySignal: MatchSignal;
}

/**
 * Normalizes entity strings by removing legal suffixes, punctuation, and standardizing common acronyms
 */
export function normalizeEntityString(raw: string | undefined): string {
  if (!raw) return "";
  let clean = raw.toLowerCase().trim();
  clean = clean.replace(/[^a-z0-9\s]/g, " ");
  
  // Standardize common entity acronyms
  clean = clean.replace(/\bpvt\b|\bprivate\b/g, "pvt");
  clean = clean.replace(/\bltd\b|\blimited\b/g, "ltd");
  clean = clean.replace(/\bcorp\b|\bcorporation\b/g, "corp");
  clean = clean.replace(/\binfra\b|\binfrastructure\b/g, "infra");
  clean = clean.replace(/\bpwd\b|\bpublic works department\b/g, "pwd");
  clean = clean.replace(/\bdept\b|\bdepartment\b/g, "dept");
  clean = clean.replace(/\bconst\b|\bconstruction\b/g, "construction");
  clean = clean.replace(/\bengg\b|\bengineering\b/g, "engineering");
  clean = clean.replace(/\s+/g, " ").trim();
  
  return clean;
}

/**
 * Calculates token-level Jaccard word similarity with 2-gram overlap
 */
export function calculateNormalizedTextSimilarity(textA: string, textB: string): number {
  if (!textA || !textB) return 0;
  
  const tokensA = textA
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, "")
    .split(/\s+/)
    .filter((w) => w.length > 2);
  const tokensB = textB
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, "")
    .split(/\s+/)
    .filter((w) => w.length > 2);

  if (tokensA.length === 0 || tokensB.length === 0) return 0;

  const setA = new Set(tokensA);
  const setB = new Set(tokensB);

  let intersection = 0;
  setA.forEach((word) => {
    if (setB.has(word)) intersection++;
  });

  const union = setA.size + setB.size - intersection;
  if (union === 0) return 0;

  const jaccard = (intersection / union) * 100;
  return Math.round(jaccard);
}

/**
 * Compares descriptions, categories, and entities of two normalized projects
 */
export function evaluateTextAndEntities(
  projectA: NormalizedProject,
  projectB: NormalizedProject
): TextMatchResult {
  // 1. Description & Title Similarity
  const titleSim = calculateNormalizedTextSimilarity(projectA.title, projectB.title);
  const descSim = calculateNormalizedTextSimilarity(projectA.description, projectB.description);
  const combinedTextScore = Math.round(titleSim * 0.6 + descSim * 0.4);

  const textStatus: "MATCH" | "PARTIAL" | "UNAVAILABLE" | "DIFFERENT" =
    combinedTextScore > 70 ? "MATCH" : combinedTextScore > 35 ? "PARTIAL" : "DIFFERENT";

  const descriptionSignal: MatchSignal = {
    signalType: "DESCRIPTION_SIMILARITY",
    scorePct: combinedTextScore,
    weight: 0.15,
    weightedPoints: (combinedTextScore * 0.15),
    status: textStatus,
    explanation: `Title token overlap: ${titleSim}%, Description overlap: ${descSim}%.`,
  };

  // 2. Category Similarity
  const normCatA = normalizeCategoryToStandard(projectA.category);
  const normCatB = normalizeCategoryToStandard(projectB.category);
  const isSameCategory = normCatA === normCatB;
  const categoryScore = isSameCategory ? 100 : 25;

  const categorySignal: MatchSignal = {
    signalType: "CATEGORY_SIMILARITY",
    scorePct: categoryScore,
    weight: 0.10,
    weightedPoints: (categoryScore * 0.10),
    status: isSameCategory ? "MATCH" : "DIFFERENT",
    explanation: isSameCategory
      ? `Identical standardized category: ${normCatA}`
      : `Distinct categories: ${projectA.category} vs ${projectB.category}`,
  };

  // 3. Entity Normalization (Contractor & Implementing Agency)
  const normContA = normalizeEntityString(projectA.contractor);
  const normContB = normalizeEntityString(projectB.contractor);
  const normAgencyA = normalizeEntityString(projectA.implementingAgency);
  const normAgencyB = normalizeEntityString(projectB.implementingAgency);

  let entityScore = 0;
  let isSameEntity = false;
  let entityExplanation = "No shared contractor or implementing agency detected.";

  if (normContA && normContB && normContA === normContB) {
    entityScore = 95;
    isSameEntity = true;
    entityExplanation = `Common executing contractor: '${projectA.contractor}' (normalized match).`;
  } else if (normContA && normContB && calculateNormalizedTextSimilarity(normContA, normContB) > 75) {
    entityScore = 80;
    isSameEntity = true;
    entityExplanation = `Probable common contractor variant: '${projectA.contractor}' vs '${projectB.contractor}'.`;
  } else if (normAgencyA && normAgencyB && (normAgencyA === normAgencyB || calculateNormalizedTextSimilarity(normAgencyA, normAgencyB) > 70)) {
    entityScore = 60;
    entityExplanation = `Common implementing administrative agency: '${projectA.implementingAgency}'.`;
  }

  const entitySignal: MatchSignal = {
    signalType: "ENTITY_RELATIONSHIP",
    scorePct: entityScore,
    weight: 0.10,
    weightedPoints: (entityScore * 0.10),
    status: entityScore > 75 ? "MATCH" : entityScore > 40 ? "PARTIAL" : "DIFFERENT",
    explanation: entityExplanation,
  };

  return {
    textScorePct: combinedTextScore,
    categoryScorePct: categoryScore,
    entityScorePct: entityScore,
    isSameEntity,
    descriptionSignal,
    categorySignal,
    entitySignal,
  };
}
