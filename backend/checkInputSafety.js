function isInputFlagged(moderationResult, threshold = 0.01) {
  const result = moderationResult?.results?.[0];

  if (!result) return { flagged: false };

  const { flagged, category_scores: scores } = result;
  const riskScore =
    scores.hate +
    scores.violence +
    scores.harassment +
    scores["sexual"] +
    scores["sexual/minors"];

  const manuallyFlagged = riskScore > threshold;

  return {
    flagged: flagged || manuallyFlagged,
    reason: flagged
      ? "Moderation API flagged"
      : manuallyFlagged
      ? `Risk score: ${riskScore.toFixed(3)}`
      : null,
    scores,
  };
}

module.exports = isInputFlagged;
