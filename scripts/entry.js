import { SSMClient, GetParametersByPathCommand } from '@aws-sdk/client-ssm'

const ssmPath = process.env.SSM_PARAMETER_PATH

if (ssmPath) {
  console.log(`Fetching configuration from SSM: ${ssmPath}`)
  await loadSsmParameters(ssmPath)
  console.log('SSM parameters loaded')
}

await import('../src/index.js')

async function loadSsmParameters(path) {
  const client = new SSMClient({})
  let nextToken

  do {
    const { Parameters, NextToken } = await client.send(
      new GetParametersByPathCommand({
        Path: path,
        WithDecryption: true,
        Recursive: false,
        NextToken: nextToken
      })
    )

    for (const { Name, Value } of Parameters ?? []) {
      process.env[Name.split('/').pop()] = Value
    }

    nextToken = NextToken
  } while (nextToken)
}
