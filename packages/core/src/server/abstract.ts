import type { RouteResolver } from '../router'

export interface RouterServerCommonConfig<AuthorizerInput> {
  authorizer: (input: AuthorizerInput) => boolean | Promise<boolean>
}

export interface RouterServer<
  // 无法满足的协变
  // https://stackoverflow.com/questions/67738449/generic-function-parameter-with-unknown-args
  ConfigType, // extends RouterServerCommonConfig<unknown>
> {
  createServer(
    resolveRoute: RouteResolver,
    config: Partial<ConfigType>,
  ): RouterServerInstance
}

export interface RouterServerInstance {
  stop(): void
}
