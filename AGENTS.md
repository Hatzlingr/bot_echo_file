# AI Coding Agent Instructions

## 1. Role

You are the coding agent responsible for implementing and maintaining
this project.

The project is a small personal WhatsApp file echo bot.

Read `SPEC.md` before making implementation decisions.

Use `TASKS.md` as the source of truth for current implementation
progress.

------------------------------------------------------------------------

## 2. Core Rule

Build the smallest system that satisfies the specification.

Do not turn a simple file echo bot into an enterprise application.

Avoid unnecessary:

-   Frameworks
-   Dependencies
-   Abstractions
-   Services
-   Databases
-   APIs
-   Infrastructure

------------------------------------------------------------------------

## 3. Development Workflow

Work incrementally.

Follow this order:

``` text
Phase 1
  ↓
Phase 2
  ↓
Phase 3
  ↓
Phase 4
  ↓
Phase 5
  ↓
Phase 6
  ↓
Phase 7
  ↓
Phase 8
```

Do not implement future phases prematurely unless required by the
current phase.

After completing a task:

1.  Verify the implementation.
2.  Run the relevant build/test command.
3.  Update `TASKS.md`.
4.  Continue to the next task only when the current task is working.

------------------------------------------------------------------------

## 4. Documentation Priority

When deciding how the system should behave, use this priority:

1.  `SPEC.md`
2.  `TASKS.md`
3.  `AGENTS.md`
4.  Existing source code
5.  General assumptions

Do not silently contradict the specification.

If the specification is ambiguous, choose the simplest behavior
consistent with the project goal.

------------------------------------------------------------------------

## 5. Baileys Rules

Use the currently installed/relevant Baileys API.

Do not blindly copy outdated code from old tutorials.

Before implementing a Baileys feature:

-   Check the installed version.
-   Verify the API pattern.
-   Use the appropriate current API.
-   Avoid deprecated APIs when a supported alternative exists.

Do not invent function names or parameters.

------------------------------------------------------------------------

## 6. Code Quality

Use TypeScript.

Prefer:

-   Small focused functions.
-   Explicit types where useful.
-   `async/await`.
-   Proper error handling.
-   Clear naming.
-   Minimal module boundaries.

Avoid:

-   Huge files.
-   Deep abstraction layers.
-   Global mutable state unless necessary.
-   Unused dependencies.
-   Dead code.
-   Commenting obvious code excessively.

------------------------------------------------------------------------

## 7. Error Handling

Never allow one malformed message or failed media operation to crash the
entire bot.

Use appropriate error boundaries around message processing.

For temporary files:

``` text
try
  download
  process
  send
finally
  cleanup
```

Cleanup must be attempted even when processing fails.

------------------------------------------------------------------------

## 8. Security

Never:

-   Hardcode credentials.
-   Commit authentication state.
-   Commit `.env`.
-   Print authentication credentials.
-   Print file contents.
-   Store received files permanently without explicit requirement.

Ensure:

``` text
auth/
temp/
.env
node_modules/
dist/
```

remain ignored by Git.

------------------------------------------------------------------------

## 9. Self-Message Protection

The bot must never respond to its own outgoing message.

Always verify message origin before processing.

The following loop must never occur:

``` text
User
 ↓
File
 ↓
Bot
 ↓
File
 ↓
Bot
 ↓
File
 ↓
...
```

------------------------------------------------------------------------

## 10. Sender Handling

Never hardcode a destination number.

The destination must be derived from the incoming message sender.

Do not introduce a fixed:

``` text
TARGET_NUMBER
```

unless the specification is explicitly changed.

------------------------------------------------------------------------

## 11. Temporary Files

Temporary files must be deleted after processing.

Use safe cleanup behavior.

Do not assume a file exists before deleting it.

Cleanup errors should be logged without crashing the bot.

------------------------------------------------------------------------

## 12. Dependencies

Before adding a dependency, ask:

> Is this dependency actually necessary?

Prefer existing Node.js/TypeScript capabilities when they are
sufficient.

Do not add libraries simply for convenience if the same operation is
trivial without them.

------------------------------------------------------------------------

## 13. Testing

After meaningful code changes:

1.  Run TypeScript/build checks.
2.  Run relevant tests if available.
3.  Perform the smallest practical manual test.
4.  Confirm expected behavior.
5.  Update `TASKS.md`.

Minimum end-to-end test:

``` text
Send PDF
   ↓
Bot receives PDF
   ↓
Bot identifies sender
   ↓
Bot downloads PDF
   ↓
Bot sends PDF back
   ↓
User receives PDF
   ↓
Temporary file deleted
```

------------------------------------------------------------------------

## 14. Debugging

When an error is reported:

1.  Read the complete error.
2.  Identify the actual failing component.
3.  Check the installed dependency/API version.
4.  Make the smallest necessary change.
5.  Re-run the relevant test.
6.  Do not rewrite unrelated code.

Do not respond to an error by replacing the entire architecture.

------------------------------------------------------------------------

## 15. Change Management

Before modifying architecture:

-   Check whether the existing implementation already satisfies the
    requirement.
-   Prefer a local fix.
-   Avoid unnecessary refactoring.

If a significant architectural change is genuinely required, explain:

-   Why it is necessary.
-   What it changes.
-   What existing behavior could be affected.

------------------------------------------------------------------------

## 16. Scope Control

The current project does NOT require:

-   Database
-   Redis
-   Frontend
-   Web dashboard
-   REST API
-   AI
-   Cloud storage
-   Docker
-   VPS deployment
-   Payment
-   Analytics
-   Admin panel
-   Complex user management

Do not implement these unless the specification is explicitly updated.

------------------------------------------------------------------------

## 17. Deployment

The initial target is local development.

Supported environments:

-   Windows
-   WSL
-   Linux

Do not spend implementation effort on VPS deployment until local
functionality is complete.

Future deployment should reuse the same application code as much as
possible.

------------------------------------------------------------------------

## 18. Task Completion

When a task is complete:

-   Mark the corresponding checkbox in `TASKS.md`.
-   Do not mark tasks complete without verification.
-   Keep the task list accurate.

Example:

``` md
- [x] Initialize Node.js project.
- [x] Configure TypeScript.
- [ ] Implement WhatsApp authentication.
```

------------------------------------------------------------------------

## 19. Final Acceptance Test

Before declaring the initial version complete, verify:

-   [ ] Authentication works.
-   [ ] Authentication persists.
-   [ ] Bot receives messages.
-   [ ] Sender is identified correctly.
-   [ ] Text messages are ignored.
-   [ ] Media is detected.
-   [ ] Media is downloaded.
-   [ ] Media is sent back to the sender.
-   [ ] Returned file is valid.
-   [ ] Temporary files are deleted.
-   [ ] Self-message loops are impossible.
-   [ ] Connection failures are handled.
-   [ ] Individual processing failures do not crash the bot.
-   [ ] Sensitive files are ignored by Git.

Only then consider the initial implementation complete.
