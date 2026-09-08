import { getProjects, getProjectById } from "./lib/synthetic/fixtures/dataset";

function runVerification() {
  console.log("=== RISKLENS ENGINE VERIFICATION RUN ===");
  const projects = getProjects();
  console.log(`Total Synthetic Projects Indexed: ${projects.length}`);

  // Test 1: Baseline Clean Project
  const clean = getProjectById("PRJ-2023-088");
  if (!clean) throw new Error("PRJ-2023-088 not found");
  console.log(`\nTest 1 (Clean Project PRJ-2023-088): Score = ${clean.riskScore.compositeScore} (Expected < 25)`);
  if (clean.riskScore.compositeScore >= 25) {
    throw new Error(`Clean project scored too high: ${clean.riskScore.compositeScore}`);
  }
  console.log("✓ Test 1 Passed.");

  // Test 2: Hero Anomaly Project
  const hero = getProjectById("HERO-MPLADS-001");
  if (!hero) throw new Error("HERO-MPLADS-001 not found");
  console.log(`\nTest 2 (Hero Project HERO-MPLADS-001): Score = ${hero.riskScore.compositeScore} (Expected >= 70)`);
  console.log(`Summary: ${hero.riskScore.whyFlaggedSummary}`);
  hero.riskScore.breakdown.forEach((b) => {
    console.log(`  - [${b.isTriggered ? "FLAG" : "OK"}] ${b.label}: ${b.points}/${b.maxPoints} pts | Reason: ${b.reason}`);
  });

  if (hero.riskScore.compositeScore < 70) {
    throw new Error(`Hero anomaly project scored too low: ${hero.riskScore.compositeScore}`);
  }
  console.log("✓ Test 2 Passed.");

  // Test 3: Verify Zero Forbidden Words
  const allText = JSON.stringify(projects);
  const forbidden = ["fraud", "corrupt", "cheat", "scam"];
  for (const word of forbidden) {
    if (new RegExp(`\\b${word}\\b`, "i").test(allText)) {
      throw new Error(`Forbidden word '${word}' found in dataset output!`);
    }
  }
  console.log("\n✓ Test 3 Passed: Neutral regulatory vocabulary verified (no forbidden words).");

  console.log("\n=== ALL UNIT VERIFICATION CHECKS PASSED ===");
}

runVerification();
