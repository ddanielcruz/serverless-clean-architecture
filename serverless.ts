import type { AWS } from '@serverless/typescript'

import * as functions from '@/infrastructure/aws/lambda/functions'

const serverlessConfiguration: AWS = {
  service: 'serverless-clean-architecture',
  frameworkVersion: '3',
  useDotenv: true,
  plugins: [
    'serverless-esbuild',
    'serverless-offline',
    'serverless-offline-ses-v2',
    'serverless-prune-plugin',
  ],
  provider: {
    name: 'aws',
    runtime: 'nodejs20.x',
    stage: 'offline',
    region: 'us-east-1',
    apiGateway: {
      minimumCompressionSize: 1024,
      shouldStartNameWithService: true,
    },
    environment: {
      AWS_NODEJS_CONNECTION_REUSE_ENABLED: '1',
      NODE_OPTIONS: '--enable-source-maps --stack-trace-limit=1000',
      DATABASE_URL: '${env:DATABASE_URL}',
    },
  },
  functions,
  package: {
    individually: true,
  },
  custom: {
    stage: '${opt:stage, self:provider.stage}',
    esbuild: {
      bundle: true,
      minify: false,
      sourcemap: true,
      exclude: ['aws-sdk'],
      target: 'node20',
      define: { 'require.resolve': undefined },
      platform: 'node',
      concurrency: 10,
    },
    prune: {
      automatic: true,
      number: 3,
    },
    'serverless-offline': {
      host: '0.0.0.0',
    },
    'serverless-offline-ses-v2': {
      port: 8005,
    },
  },
}

module.exports = serverlessConfiguration
