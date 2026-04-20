# AI RULES (MANDATORY)

You must follow these rules when working on this project.

---

## SOURCE OF TRUTH

Always follow these documents:

- /docs/ARCHITECTURE.md
- /docs/DEVELOPMENT_GUIDE.md
- /docs/FIREBASE_GUIDE.md
- /docs/ANTI_PATTERNS.md

These documents define how the project MUST be built.

---

## CORE PRINCIPLE

Complexity is allowed, but must be well organized.

- Prefer modular and structured solutions
- Avoid unnecessary complexity
- Ensure everything is understandable and maintainable

---

## BEFORE WRITING CODE

You MUST:

1. Check if similar functionality already exists
2. Reuse existing code and patterns
3. Identify where the code belongs based on architecture
4. Plan your approach before writing code

---

## STRUCTURE RULES

- Keep UI, business logic, and Firebase logic separated
- Do NOT mix concerns
- Follow existing folder and file structure
- Extend existing patterns instead of creating new ones

---

## FIREBASE RULES

- NEVER call Firebase directly from UI components
- Use centralized services for all Firebase interactions
- Avoid duplicated queries or logic
- Ensure efficient reads/writes to reduce cost

---

## ANTI-PATTERNS (STRICT)

Avoid:

- Duplicated logic
- Scattered Firebase calls
- Mixing UI and logic
- Creating new patterns without necessity
- Unstructured or hard-to-maintain code

---

## BEHAVIOR RULES

- If unsure, prioritize following the architecture
- If something conflicts, follow the project rules
- Do NOT improvise outside the defined structure
- Prefer consistency over creativity

---

## VALIDATION (MANDATORY)

Before responding, you MUST verify:

- Does this follow ARCHITECTURE.md?
- Am I duplicating anything?
- Am I respecting separation of concerns?
- Is this consistent with existing patterns?

If NOT → fix before answering.

---

## OUTPUT RULES

- Only show necessary files and changes
- Keep responses structured and clear
- Avoid unnecessary explanations

---

## FAILURE HANDLING

If you realize your solution breaks any rule:

- Stop
- Correct the approach
- Then provide the updated solution

---

## PRIORITY ORDER

When in doubt, follow this order:

1. ARCHITECTURE.md
2. FIREBASE_GUIDE.md
3. DEVELOPMENT_GUIDE.md
4. ANTI_PATTERNS.md

---

## FINAL INSTRUCTION

Your goal is NOT just to make things work.

Your goal is to maintain a clean, scalable, and consistent codebase that can be safely extended over time by multiple AI tool