# 4章 DynamoDB

## 概要

- Lambda関数で実行される処理の中でDynamoDBにアクセスしてみます
- DynamoDBのテーブル定義などはServerlessFrameworkを使ってコードで管理します

## ゴール

- ServerlessFrameworkを使ったDynamoDBのテーブル定義のしかたを覚える
- Lambda関数からDynamoDBにアクセスする方法を覚える

## テーブル定義の追加

- まずはserverless.tsにテーブル定義を追加します

```ts{23,25-39,94-120}
import type { AWS } from '@serverless/typescript';

const serverlessConfiguration: AWS = {
  service: 'lambda-handson-xxx',
  frameworkVersion: '2',
  custom: {
    webpack: {
      webpackConfig: './webpack.config.js',
      includeModules: true,
    },
  },
  // Add the serverless-webpack plugin
  plugins: ['serverless-webpack'],
  provider: {
    region: 'ap-northeast-1',
    name: 'aws',
    runtime: 'nodejs12.x',
    apiGateway: {
      minimumCompressionSize: 1024,
    },
    environment: {
      AWS_NODEJS_CONNECTION_REUSE_ENABLED: '1',
      DYNAMODB_TABLE: '${self:service}-${self:provider.stage}',
    },
    iamRoleStatements: [
      {
        Effect: 'Allow',
        Action: [
          'dynamodb:Query',
          'dynamodb:Scan',
          'dynamodb:GetItem',
          'dynamodb:PutItem',
          'dynamodb:UpdateItem',
          'dynamodb:DeleteItem',
        ],
        Resource:
          'arn:aws:dynamodb:${self:provider.region}:*:table/${self:provider.environment.DYNAMODB_TABLE}*',
      },
    ],
  },
  functions: {
    hello: {
      handler: 'handler.hello',
      events: [
        {
          http: {
            method: 'get',
            path: 'hello',
          },
        },
      ],
    },
    helloworld: {
      handler: 'handler.helloworld',
      events: [
        {
          http: {
            method: 'get',
            path: 'helloworld',
          },
        },
      ],
    },
    helloPathParameter: {
      handler: 'handler.helloPathParameter',
      events: [
        {
          http: {
            method: 'get',
            path: 'helloparams/{id}',
          },
        },
      ],
    },
    helloQueryParameter: {
      handler: 'handler.helloQueryParameter',
      events: [
        {
          http: {
            method: 'get',
            path: 'helloparams',
            request: {
              parameters: {
                querystrings: {
                  name: true,
                },
              },
            },
          },
        },
      ],
    },
  },
  resources: {
    Resources: {
      Todo: {
        // @ts-ignore
        Type: 'AWS::DynamoDB::Table',
        Properties: {
          TableName: '${self:provider.environment.DYNAMODB_TABLE}-todo',
          AttributeDefinitions: [
            {
              AttributeName: 'id',
              AttributeType: 'S',
            },
          ],
          KeySchema: [
            {
              AttributeName: 'id',
              KeyType: 'HASH',
            },
          ],
          ProvisionedThroughput: {
            ReadCapacityUnits: 1,
            WriteCapacityUnits: 1,
          },
        },
      },
    },
  },
};

module.exports = serverlessConfiguration;
```

- 修正できたらデプロイしてみましょう

```sh
sls deploy
```

- エラーがでなければ成功です
- AWSのWebコンソールにアクセスできる人はDynamoDBのメニューからテーブルができていることを確認してみましょう

![table](/images/4-1.png)

## LambdaからDynamoDBへのアクセス

- ライブラリの追加

## Topic3
