# Say Suppose prompts

Every prompt the channel sends to a model is a file here, so films reuse what has worked
(spec: docs/superpowers/specs/2026-11-27-say-suppose-film-kit-design.md, "Prompts and skills").
`sources/` keeps the owner's master prompts verbatim; never edit them.

## Layout of a prompt file

    # <name>
    Model: <model and settings, e.g. "Higgsfield gpt_image_2_6, quality high, 2K, 16:9" or "Claude (this session)">
    Used by: <skill or stage that runs it>
    Source: <owner master prompt, pilot job id, or spec section it came from>

    ## Inputs
    - {{blank_name}}: what to put there

    ## Prompt
    The text sent to the model, with {{blank_name}} blanks.

    ## Checklist
    What the model checks and fixes before it answers (W12), and what the agent checks after.

## Rules

- A prompt is self-contained (W8): it never says "same as before"; characters are re-described in full every time.
- Paid models (GPT Image 2.6, Luc, ElevenLabs Music) run only after the owner's OK, with tool, model and cost stated.
- Change a prompt in its own commit, with the reason, so films can be traced to the prompt that made them.
- `core/engines/suppose/tests/test_prompts.py` checks the layout.
