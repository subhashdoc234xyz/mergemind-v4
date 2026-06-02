import { NextRequest, NextResponse } from 'next/server';
import { callGemini } from '@/lib/gemini';

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const { diff } = await req.json();
    if (!diff) {
      return NextResponse.json({ error: 'Diff is required' }, { status: 400 });
    }

    const additions = diff.split('\n').filter((l: string) => l.startsWith('+') && !l.startsWith('+++')).length;
    const deletions = diff.split('\n').filter((l: string) => l.startsWith('-') && !l.startsWith('---')).length;
    const changedFiles = (diff.match(/^diff --git /gm) || []).length || 1;

    const prompt = `
You are MergeMinD — a senior software engineer with 10 years of experience reviewing production code.

## CODE DIFF BEING REVIEWED
${diff}

## YOUR TASK
Analyze the code diff carefully. Find real, specific problems.

Respond with ONLY a valid JSON object — no markdown fences, no explanation outside the JSON:

{
  "summary": "2-3 sentence overall assessment of code quality and main concerns",
  "healthScore": 7,
  "issues": [
    {
      "severity": "CRITICAL",
      "title": "Plain text password storage",
      "file": "auth/login.js",
      "explanation": "Passwords stored as plain strings. A database breach exposes every user account immediately.",
      "fix": "const hashed = await bcrypt.hash(password, 10);",
      "comment": "**[CRITICAL] Plain text password storage**\\n\\n**Problem:** Passwords are stored as plain strings. A database breach exposes every user account immediately.\\n\\n**Fix:**\\n\`\`\`js\\nconst hashed = await bcrypt.hash(password, 10);\\n\`\`\`\\n\\n*Reviewed by MergeMinD — Gemini 2.5 Flash*"
    }
  ]
}

Severity rules:
- CRITICAL: security holes (XSS, SQLi, auth bypass, plain text secrets), data loss bugs, broken logic that fails in production
- WARNING: missing error handling, unhandled edge cases, missing input validation, N+1 queries, performance issues
- SUGGESTION: naming improvements, refactoring, style consistency with rest of codebase

Rules:
- Maximum 8 issues
- Always include corrected code in the fix field
- Never be vague — reference the exact file and what goes wrong
`;

    const rawText = await callGemini(prompt);
    const jsonMatch = rawText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Gemini did not return valid JSON');
    }
    const review = JSON.parse(jsonMatch[0]);

    return NextResponse.json({
      summary: review.summary,
      healthScore: review.healthScore,
      issues: review.issues,
      commentsPosted: 0,
      prData: {
        title: 'Raw Diff Review',
        author: 'Local User',
        changedFiles,
        additions,
        deletions,
        baseBranch: 'local',
        headBranch: 'workspace',
      }
    });

  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('MergeMinD raw diff review error:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
