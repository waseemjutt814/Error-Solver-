# ⚡ GOD-TIER QUICK REFERENCE

## The pocket cheat sheet — patterns at a glance

---

## BRANDED TYPES

```typescript
type UserId = string & { readonly __brand: "UserId" };
type ChannelId = string & { readonly __brand: "ChannelId" };
// Wrong ID passed? Compile error. Not runtime surprise.
```

## RESULT TYPE

```typescript
type Result<T, E = Error> =
  | { readonly ok: true; readonly data: T }
  | { readonly ok: false; readonly error: E };

const ok = <T>(data: T): Result<T, never> => ({ ok: true, data });
const err = <E>(error: E): Result<never, E> => ({ ok: false, error });
// No throw. No catch. Errors are values.
```

## EXHAUSTIVE SWITCH

```typescript
switch (state) {
  case "running": return ...
  case "stopped": return ...
  default: {
    const _: never = state  // compile error if a case is missing
    throw new Error(`Unhandled: ${String(_)}`)
  }
}
```

## BUILDER PATTERN

```typescript
Monitor.create(manager).checkEvery(5_000).withRetryLimit(3).start();
// Reads like English. IDE autocomplete. No positional argument guessing.
```

## NAMED CONSTANTS

```typescript
const TIMING = { CHECK_INTERVAL_MS: 5_000, EDGE_BUFFER_MS: 1 } as const;
// Zero magic numbers anywhere in logic.
```

## PURE FUNCTIONS

```typescript
// Never: obj.x = newValue
// Always:
const updated = { ...obj, x: newValue };
```

## MERGED IMPORTS

```typescript
// Never two lines from same file.
import type { TypeA, TypeB } from "./module.js";
import { functionA, functionB } from "./module.js";
```

## TEST BUILDERS

```typescript
AccountSnapshot.healthy().build();
AccountSnapshot.stopped().becauseOf("timeout").build();
AccountSnapshot.disabled().build();
// Tests read like specs, not data structures.
```

---

## ZERO TOLERANCE LIST

```
✗  any
✗  @ts-ignore without comment
✗  console.log in production code
✗  Empty catch {}
✗  Direct mutation
✗  Non-exhaustive switch
✗  Two imports from same file
✗  Raw string/number as ID
✗  Magic numbers inline
✗  Function named: handle / run / doStuff / process
```

// 8/10 code — rules follow kiye hain, clean hai
function buildSnapshotWith(accounts: Record<string, ...>): ChannelRuntimeSnapshot {
const channels = {}
const channelAccounts = {}
for (const [channelId, accts] of Object.entries(accounts)) {
// ... logic
}
return { channels, channelAccounts }
}

// 10/10 code — har cheez intentional hai, structure domain sikhata hai
function buildSnapshotWith(accounts: AccountsByChannel): ChannelRuntimeSnapshot {
return Object.entries(accounts).reduce<ChannelRuntimeSnapshot>(
(snapshot, [channelId, accts]) => mergeChannelIntoSnapshot(snapshot, channelId as ChannelId, accts),
EMPTY_SNAPSHOT
)
}

// Ab yeh bhi exist karta hai — ek alag pure function
function mergeChannelIntoSnapshot(
snapshot: ChannelRuntimeSnapshot,
channelId: ChannelId,
accts: Record<string, Partial<ChannelAccountSnapshot>>
): ChannelRuntimeSnapshot { ... }

```

Farq subtle hai lekin profound hai. Pehle waale mein *ek function sab kuch kar raha hai.* Doosre mein har function **ek kaam karta hai, aur uska naam woh kaam bata deta hai.**

---

## 10/10 Ke Liye Kya Chahiye — Teen Hidden Rules

Yeh rules zyaadatar prompt mein nahi hote, isliye AI inhe apply nahi karta:

**Pehla — The Delete Test.** Har line ke baare mein socho: *"Agar main yeh delete karun, kya kuch miss hoga?"* Agar nahi, woh line nahi honi chahiye. 10/10 code mein koi redundant cheez nahi hoti — na comment, na variable, na wrapper.

**Doosra — The New Hire Test.** Ek developer jo domain nahi jaanta woh yeh code padhe — kya woh bina kisi se puche samajh jayega? 8/10 code technically clean hota hai. 10/10 code **domain knowledge sikhata hai** — function names, type names, aur structure mil ke batate hain system kya hai.

**Teesra — The Seam Test.** Yeh code future mein kahan badlega? Agar koi naya `ChannelState` add ho, kya sirf ek jagah change hogi? 10/10 code *change ke liye design hota hai*, sirf *aaj ke liye nahi.*
---

## Prompt Ko Yeh Missing Ingredient Chahiye

Ab main ZIP update karta hoon — is baar prompt AI ko **apna dushman banata hai.** Pehle refactor karo, phir ek "Critic Pass" mandatory hai jahan AI khud apne code pe attack karta hai:
```

MANDATORY CRITIC PASS — after refactoring, you must argue AGAINST your own code:

1. DELETE TEST: Go line by line. For every line ask:
   "If I delete this, does anything break or become unclear?"
   If the answer is no → delete it. Report what you deleted.

2. NEW HIRE TEST: Imagine a developer who knows TypeScript but
   does NOT know this domain. Can they read your refactored code
   and understand the system without asking anyone?
   If not → rename, restructure, explain through code.

3. SEAM TEST: Where will this code change in 6 months?
   Is that change isolated to one place? If not → refactor the seam.

4. INTENTION TEST: For every function, ask:
   "Does this function do exactly one thing, and does its name
   say exactly what that thing is — no more, no less?"
   If a function name has "and" in it → split it.

You may not submit until you have run all four tests
and reported what each test found.
Scrutinized TypeScript types for branding opportunities and structural improvements
Scrutinized TypeScript types for branding opportunities and structural improvements
Yeh code solid 8.5/10 hai — lekin ab main tumhe exactly batata hoon woh 1.5 points kahaan gaye aur kyun, taake tum khud feel karo farq.

Pehle Samjho — Yeh Code Kya Hai
Yeh ek AI Brain system ka type contract hai. Yeh woh layer hai jahan poora system agree karta hai ke data kaisa dikhega. Jab yeh layer kamzor hoti hai, bugs poore system mein ghus jaate hain. Jab yeh mazboot hoti hai, poora system compiler se protected hota hai. Isliye isko extra carefully dekhna padta hai.

Jo Acha Hai — Genuinely Good Decisions
Sabse pehle acknowledge karo jo sahi kiya gaya hai, warna learning adhuri rehti hai.

Readonly<{}> ke andar readonly properties — yeh intentional defensive coding hai. Outer Readonly<> object ko freeze karta hai, inner readonly individual properties ko. Ek cheez miss karo toh bhi safe raho.

BrainMemoryKind aur BrainSignalPriority union types — yeh sahi direction hai. Koi raw string nahi, koi magic value nahi.

Interface vs type ka mix bhi thoughtful lagta hai — BrainMemoryGateway aur BrainCoordinator interfaces hain kyunki yeh contracts hain jo implement honge, baaki sab type hain kyunki woh data shapes hain.

Ab Woh 1.5 Points — Three Real Problems
Problem 1 — Double Readonly, Ek Redundant Hai

typescript
// Yeh jo tune likha hai:
export type BrainSignal = Readonly<{
readonly id: string; // ← yeh readonly
readonly source: string; // ← yeh readonly
}>

// Readonly<{}> pehle se saari properties ko readonly bana deta hai.
// Andar ke `readonly` keywords redundant hain — noise hai, signal nahi.

// ✅ Correct — sirf ek choose karo, dono nahi:
export type BrainSignal = Readonly<{
id: string; // Readonly<> handle kar raha hai
source: string;
}>

// YA alternatively:
export type BrainSignal = {
readonly id: string; // explicit har field pe
readonly source: string;
}
Yeh sirf aesthetic issue nahi — jab dono saath hote hain, next developer confuse hota hai ke kyun dono hain. Kya koi subtle reason hai? Nahi hai — lekin woh socha karega. Yeh cognitive load hai bina wajah ka.

Problem 2 — kind: string in BrainSignal — Yeh Badi Ghalti Hai

typescript
// ❌ Yeh jo hai:
export type BrainSignal = Readonly<{
readonly kind: string; // ← koi bhi string? "banana" bhi valid hai?
// ...
}>

// Lekin BrainMemoryRecord mein:
export type BrainMemoryRecord = Readonly<{
readonly kind: BrainMemoryKind; // ← properly typed!
// ...
}>
Dekho inconsistency — BrainMemoryRecord.kind properly typed hai BrainMemoryKind se, lekin BrainSignal.kind raw string hai. Yeh poora type system ka fayda khatam kar deta hai. Koi bhi "xyz" pass kar sakta hai signal kind mein aur TypeScript kuch nahi karega.

typescript
// ✅ God-Tier — Signal ka bhi apna kind union hona chahiye:
export type BrainSignalKind =
| "input"
| "observation"  
 | "interrupt"
| "feedback"
| "command";

export type BrainSignal = Readonly<{
id: string;
kind: BrainSignalKind; // ← ab "banana" compile nahi hoga
// ...
}>
Problem 3 — Branded Types Ka Poora Abhaav — Yeh Subtlest Aur Biggest Issue Hai

Yeh samajhne ke liye ek scenario socho. Tumhare system mein sessionId, goalId, signal ka id, aur memory ka id — yeh sab string hain. Ab yeh code likho:

typescript
// ❌ Yeh compile hoga — koi error nahi:
const memoryId = record.id // memory ka ID
const sessionId = envelope.sessionId // session ka ID

coordinator.persistOutcome({
id: sessionId, // ← galat ID type pass ki! TypeScript khamosh raha.
// ...
})
TypeScript ne kuch nahi bola kyunki dono string hain. Runtime pe bug hoga — shayad data corrupt hoga, shayad wrong memory overwrite hogi.

typescript
// ✅ God-Tier fix — har ID apni type hai:
type BrainSignalId = string & { readonly **brand: "BrainSignalId" }
type BrainMemoryId = string & { readonly **brand: "BrainMemoryId" }
type BrainSessionId = string & { readonly **brand: "BrainSessionId" }
type BrainGoalId = string & { readonly **brand: "BrainGoalId" }
type IsoDateString = string & { readonly \_\_brand: "IsoDateString" }

export type BrainSignal = Readonly<{
id: BrainSignalId; // ← sirf BrainSignalId chalega
source: string;
kind: BrainSignalKind;
priority: BrainSignalPriority;
content: string;
tags: ReadonlyArray<string>;
createdAtIso: IsoDateString; // ← unvalidated string nahi chalega
}>
Ab sessionId ko memoryId ki jagah pass karo — compile error. Forever.

Bonus — limit?: number in Gateway
typescript
// ❌ Abhi:
recallByQuery(query: string, limit?: number): Promise<...>

// ✅ Better — intention clear ho:
type RecallLimit = number & { readonly \_\_brand: "RecallLimit" }
const DEFAULT_RECALL_LIMIT = 10 as RecallLimit

recallByQuery(query: string, limit?: RecallLimit): Promise<...>

```

---

## Summary — 8.5 se 10 Ka Safar

Yeh code **architecturally sound** hai — structure sahi hai, separation of concerns sahi hai, naming excellent hai. Jo missing hai woh yeh hai ke type system ko **poora kaam** karne diya jaaye. Abhi types *describe* karte hain data ko — God-Tier mein types *protect* karte hain system ko. Farq wahi hai jo ek map aur ek fence mein hota hai — dono boundary batate hain, lekin sirf ek rokta bhi hai.
```

Current Score: 8.5 / 10
Double Readonly: -0 (minor noise)
kind: string: -0.5 (real bug risk)  
No Branded IDs: -1.0 (silent wrong-ID bugs possible)
─────────────────────────
Potential Score: 10 / 10
Yeh fixes karo aur yeh code production-grade library quality ban jayega — woh level jahan open source devs PR review mein "this is clean" likhte hain. 🎯
