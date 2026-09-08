export type QuestionType = "single" | "multiple" | "textarea";

export type QuestionBlock = "context" | "assessment" | "additional";

export type DimensionId = "D1" | "D2" | "D3" | "D4" | "D5";

export type Level = "Inicial" | "En desarrollo" | "Preparada" | "Avanzada";

export type DimensionClassification =
  | "Brecha crítica"
  | "Brecha prioritaria"
  | "Área por fortalecer"
  | "Funcional"
  | "Fortaleza consolidada";

export type QuestionOption = {
  id: string;
  label: string;
  score?: number;
  uncertainty?: boolean;
};

export type Question = {
  id: string;
  number: number;
  block: QuestionBlock;
  dimension?: DimensionId;
  text: string;
  type: QuestionType;
  required: boolean;
  scored: boolean;
  maxSelections?: number;
  options?: QuestionOption[];
};

/**
 * A recorded answer. Always carries questionId + optionId + label + score
 * together — never just the score, since different options can share the
 * same numeric score while being semantically different (spec §8).
 */
export type Answer = {
  questionId: string;
  optionId: string;
  label: string;
  score?: number;
};

export type DiagnosticInput = {
  q1: Answer[];
  q2: Answer;
  q3: Answer;
  q4: Answer;
  q5: Answer;
  q6: Answer;
  q7: Answer;
  q8: Answer;
  q9: Answer;
  q10: Answer;
  q11: Answer;
  q12: Answer;
  q13: Answer;
  q14: Answer;
  q15: Answer;
  q16?: Answer;
  q17?: string;
};

export type DimensionResult = {
  dimensionId: DimensionId;
  name: string;
  score: number;
  displayScore: number;
  classification: DimensionClassification;
  critical: boolean;
};

export type DimensionResults = Record<DimensionId, DimensionResult>;

export type StrengthItem = Pick<
  DimensionResult,
  "dimensionId" | "name" | "score" | "displayScore" | "classification"
>;

export type GapItem = DimensionResult & { isOpportunity?: boolean };

export type GapsScenario = "gaps" | "consolidation-opportunities";

export type RecommendationContext = {
  answers: DiagnosticInput;
  dimensions: DimensionResults;
};

export type RecommendationRule = {
  id: string;
  priority: number;
  category: string;
  deduplicationGroup?: string;
  condition: (context: RecommendationContext) => boolean;
  title: string;
  description: string;
};

export type Recommendation = Pick<
  RecommendationRule,
  "id" | "category" | "title" | "description"
>;

export type CTARoute =
  | "training"
  | "consulting"
  | "specialist"
  | "review"
  | "diagnostic-review";

export type CTAResult = {
  route: CTARoute;
  title: string;
  body: string;
  modifier: string | null;
  buttonLabel: string;
};

export type DiagnosticResult = {
  methodologyVersion: "1.0";
  iprs: number;
  displayIprs: number;
  calculatedLevel: Level;
  finalLevel: Level;
  whyThisLevel: string | null;
  criticalGap: boolean;
  criticalGapDimensions: DimensionId[];
  uncertainAnswers: number;
  uncertaintyRate: number;
  uncertaintyFlag: boolean;
  dimensions: DimensionResults;
  strengths: StrengthItem[];
  gaps: GapItem[];
  gapsScenario: GapsScenario;
  recommendations: Recommendation[];
  cta: CTAResult;
};
