export { DIAGNOSTIC_VERSION } from "./constants";
export { calculateDiagnostic } from "./domain/calculate-diagnostic";
export { calculateProgress } from "./domain/calculate-progress";
export { DiagnosticValidationError } from "./domain/validate-input";

export { QUESTIONS, QUESTIONS_BY_ID } from "./config/questions";
export { DIMENSIONS, DIMENSION_IDS } from "./config/dimensions";
export { LEVEL_INTERPRETATION, LEVELS } from "./config/levels";
export { DISCLAIMER_COPY, LEAD_CAPTURE_COPY, Q16_INTERPRETATION, UNCERTAINTY_COPY } from "./config/copy";

export type {
  Answer,
  CTAResult,
  CTARoute,
  DiagnosticInput,
  DiagnosticResult,
  DimensionClassification,
  DimensionId,
  DimensionResult,
  DimensionResults,
  GapItem,
  GapsScenario,
  Level,
  Question,
  QuestionOption,
  Recommendation,
  RecommendationRule,
  StrengthItem,
} from "./types";
