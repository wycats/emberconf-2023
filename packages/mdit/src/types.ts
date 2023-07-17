import type ParserBlock from "markdown-it/lib/parser_block";
import type StateBlock from "markdown-it/lib/rules_block/state_block";
export type { StateBlock };

export type RuleBlock = ParserBlock.RuleBlock;

export interface TypedBlockState<Env> extends StateBlock {
  readonly env: Env;
}

export type TypedBlockRule<Env> = (
  state: TypedBlockState<Env>,
  startLine: number,
  endLine: number,
  silent: boolean
) => boolean;
