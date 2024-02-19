import type { AWS } from '@serverless/typescript'

type FunctionDefinition = Exclude<AWS['functions'], undefined>[string] & {
  protected?: boolean
  iamRoleStatementsName?: string
  iamRoleStatements?: AWS['provider']['iamRoleStatements']
}

export function defineFunction(
  definition: FunctionDefinition,
): FunctionDefinition {
  if (definition.protected) {
    definition.events = definition.events?.map((event) => {
      if ('http' in event) {
        const http = event.http as Exclude<typeof event.http, string>
        return {
          http: {
            ...http,
            authorizer: {
              name: 'authorizer',
              type: 'request',
              identitySource: 'method.request.header.Cookie',
            },
          },
        }
      }

      return event
    })
  }

  return {
    ...definition,
    protected: undefined,
  }
}
