const test = require("node:test");
const assert = require("node:assert/strict");
const { prepareResumeForScreening, validateScreening } = require("../privacy");

test("redacts direct identifiers before external screening", () => {
  const prepared = prepareResumeForScreening("Name: Ada Lovelace\nada@example.com\n+1 (415) 555-0199\nReact engineer");
  assert.equal(prepared.includes("Ada Lovelace"), false);
  assert.equal(prepared.includes("ada@example.com"), false);
  assert.equal(prepared.includes("555-0199"), false);
  assert.match(prepared, /React engineer/);
});

test("rejects empty resume input", () => {
  assert.throws(() => prepareResumeForScreening("   "), /required/);
});

test("normalizes valid model screening output", () => {
  assert.deepEqual(validateScreening({ score: 81.4, skills: ["React", "Node"], experience_years: 4.26 }), {
    score: 81,
    skills: ["React", "Node"],
    experience_years: 4.3,
  });
});
