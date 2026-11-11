import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';
import ts from 'typescript';

// Minimal localStorage + window polyfill for running client modules in Node
const store = new Map();
const events = [];
globalThis.localStorage = {
  getItem: (k) => (store.has(k) ? store.get(k) : null),
  setItem: (k, v) => store.set(k, String(v)),
  removeItem: (k) => store.delete(k),
  clear: () => store.clear(),
};
globalThis.window = {
  addEventListener: () => {},
  removeEventListener: () => {},
  dispatchEvent: (ev) => events.push(ev.type),
};
if (!globalThis.Event) {
  globalThis.Event = class Event {
    constructor(type) {
      this.type = type;
    }
  };
}

// Tiny TypeScript loader using already-installed typescript package
const nodeRequire = createRequire(import.meta.url);
const modCache = new Map();
function loadTs(relPath) {
  const fullPath = path.resolve('d:/Eng', relPath);
  if (modCache.has(fullPath)) return modCache.get(fullPath).exports;

  const source = fs.readFileSync(fullPath, 'utf8');
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, esModuleInterop: true },
  });
  const mod = { exports: {} };
  modCache.set(fullPath, mod);

  const localReq = (spec) => {
    if (!spec.startsWith('.')) return nodeRequire(spec);
    const resolved = path.resolve(path.dirname(fullPath), `${spec}.ts`);
    return loadTs(path.relative('d:/Eng', resolved));
  };

  new Function('exports', 'require', 'module', outputText)(mod.exports, localReq, mod);
  return mod.exports;
}

const auth = loadTs('src/lib/auth.ts');
const storage = loadTs('src/lib/storage.ts');
const qbank = loadTs('src/data/questionBank.ts');

async function main() {
  // 0. Ensure user registration is completely removed and unauthenticated state stays empty
  assert.equal('registerAccount' in auth, false, 'registerAccount must not exist');
  assert.equal(auth.getActiveUserId(), null, 'No user logged in initially');
  assert.equal(storage.getStoredUserVocab().length, 0, 'Unauthenticated workspace must have no words');

  // 1. Wrong password must be rejected
  const badLogin = await auth.loginAccount('demo', 'wrongpass');
  assert.equal(badLogin.ok, false);
  assert.equal(auth.getActiveUserId(), null);

  // 2. Sample account `demo` loads seeded 50 words (20 MASTERED) & unlocks Test 50
  const demoLogin = await auth.loginAccount('demo', '123456');
  assert.equal(demoLogin.ok, true);
  const demoVocab = storage.getStoredUserVocab();
  assert.equal(demoVocab.length, 50, 'Demo account seeded with 50 words');
  const demoMastered = demoVocab.filter((w) => w.status === 'MASTERED').length;
  assert.equal(demoMastered, 20, 'Demo account has 20 MASTERED words');
  const demoTestGen = qbank.generate50QuestionTest(demoVocab);
  assert.equal(demoTestGen.isEligible, true, 'Demo account must unlock 50-question test');
  assert.equal(demoTestGen.questions.length, 50);
  assert.ok(demoTestGen.questions.every((q) => q.isFromMastered), 'All 50 questions must come from MASTERED words');

  // 3. Profile update persists for active user
  const updatedProfile = auth.updateActiveUserProfile({ preferredStudyMode: 'writing', dailyGoalReviews: 30 });
  assert.equal(updatedProfile?.preferredStudyMode, 'writing');
  assert.equal(auth.getActiveUserProfile()?.dailyGoalReviews, 30);

  // 4. Switch to sample account `hocvien` -> isolated empty deck & test locked
  const studentLogin = await auth.loginAccount('hocvien', '123456');
  assert.equal(studentLogin.ok, true);
  assert.equal(storage.getStoredUserVocab().length, 0, 'Student account starts isolated and empty');
  assert.equal(qbank.generate50QuestionTest(storage.getStoredUserVocab()).isEligible, false);

  // 5. Mastery rule (>=4 attempts & >65%) in isolated student deck
  storage.addWordToBank({
    id: 'resilient',
    word: 'resilient',
    ipa: '/riˈzɪl.jənt/',
    pos: 'adjective',
    definitions: [{ definition: 'Recovering fast', vietnameseMeaning: 'Kiên cường', example: 'They stayed resilient.' }],
    collocations: ['stay resilient'],
  });
  storage.recordQuizAttemptsBatch([
    { wordId: 'resilient', isCorrect: true },
    { wordId: 'resilient', isCorrect: true },
    { wordId: 'resilient', isCorrect: true },
    { wordId: 'resilient', isCorrect: false },
  ]);
  assert.equal(storage.getStoredUserVocab()[0].status, 'MASTERED', '3/4 (75%) must be MASTERED');

  // Flashcard review updates SRS interval without mutating quiz accuracy counts
  const beforeFc = storage.getStoredUserVocab()[0];
  const afterFc = storage.recordWordReview('resilient', 'EASY');
  assert.equal(afterFc.timesCorrect, beforeFc.timesCorrect, 'Flashcard must not inflate quiz correct count');
  assert.ok(afterFc.repetitions >= 1 && afterFc.intervalDays >= 1, 'Flashcard updates SRS schedule');

  // 6. Extra empty accounts hocvien1..hocvien3 start isolated and empty
  for (const n of [1, 2, 3]) {
    const loginRes = await auth.loginAccount(`hocvien${n}`, '123456');
    assert.equal(loginRes.ok, true, `hocvien${n} should log in`);
    assert.equal(storage.getStoredUserVocab().length, 0, `hocvien${n} starts empty`);
  }

  // 7. Logout hides data again
  auth.logoutAccount();
  assert.equal(auth.getActiveUserId(), null);
  assert.equal(storage.getStoredUserVocab().length, 0, 'After logout no vocab is exposed');

  console.log('verify-core passed:', {
    verifiedStudents: ['hocvien', 'hocvien1', 'hocvien2', 'hocvien3'],
    demoWords: demoVocab.length,
    demoMasteredWords: demoTestGen.masteredWordsCount,
    demoGeneratedQuestions: demoTestGen.questions.length,
  });
}

main();

