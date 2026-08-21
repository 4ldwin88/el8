# Adaptive Question Bank → Supabase Schema Map

The existing `el8_checkin_question_bank` already supports part of the adaptive model, but it is currently check-in-oriented. The extracted intelligence bank should not be inserted blindly until the schema can represent its semantics without hiding important metadata inside unrelated fields.

## Existing direct mappings

| Adaptive field | Current Supabase field | Notes |
| --- | --- | --- |
| `id` | `question_key` | Direct stable identifier |
| version | `version` | Add explicit version to source modules before persistence |
| question class | `question_kind` | Current values include normal/cause/trajectory; should broaden beyond check-ins |
| `prompt` | `prompt_template` | Direct |
| `response_type` | `response_type` | Add support for dynamic dimension choices |
| `options` | `options` | Direct for fixed options |
| primary dimension | `primary_dimensions` | Use zero/one/many dimensions rather than forcing one |
| signal + secondary dimensions | `signal_map` | Can hold signal metadata temporarily |
| trigger/dependency logic | `followup_rules` / `schedule_rule` | Needs clearer separation between eligibility and temporal scheduling |
| safety relevance | `safety_rules` | Direct conceptually |
| `information_value` | `information_value` | Direct |
| `burden` | `burden_cost` | Direct |
| `cooldown_days` | `suppress_if_recent_days` | Close match |
| cadence | `cadence_days` | Only when a question is actually cadence-based |

## Important gaps

The current table has no first-class fields for:

- actionability
- dependencies / prerequisite evidence
- staleness horizon
- dynamic option source (for example candidate tied dimensions)
- question domain/purpose (`assessment`, `adaptive_clarification`, `deepening`, `system_friction`, etc.)
- source module / provenance
- explicit eligibility triggers separate from temporal schedule

These should be added deliberately before the extracted bank becomes canonical database content.

## Selection score concept

Do not reduce selection to `information_value - burden` alone. A candidate question should be ranked from factors such as:

`priority = uncertainty_need × information_value × actionability × freshness_need × trigger_fit - burden_penalty - redundancy_penalty - friction_penalty`

Safety can override the ordinary burden ceiling. Member success alone must not create an expansion bonus.

The exact weights remain experimental and should be validated with Member Zero before being treated as canonical.

## Migration rule

Legacy deepening pages remain operational until:

1. their useful questions exist in the canonical bank;
2. the database schema can represent the required metadata;
3. the selector can choose questions deterministically;
4. answers can be persisted with provenance;
5. central intelligence can consume the resulting evidence;
6. Member Zero QA confirms no loss of useful behavior.
