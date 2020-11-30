# 4章 DynamoDB

## 概要

- Lambda関数で実行される処理の中でDynamoDBにアクセスしてみます
- DynamoDBのテーブル定義などはServerlessFrameworkを使ってコードで管理します
- 2章3章で学んだことと組み合わせてTodoListのCRUD操作をするAPIを作成してみます

## ゴール

- ServerlessFrameworkを使ったDynamoDBのテーブル定義のしかたを覚える
- Lambda関数からDynamoDBにアクセスする方法を覚える

## テーブル定義の追加

- まずはserverless.tsにテーブル定義を追加します

```ts{23-24,26-40,43-69}
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
      TODO_TABLE: '${self:provider.environment.DYNAMODB_TABLE}-todo',
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
  // 省略
  resources: {
    Resources: {
      Todo: {
        // @ts-ignore
        Type: 'AWS::DynamoDB::Table',
        Properties: {
          TableName: '${self:provider.environment.TODO_TABLE}',
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

- 23~24行目は環境変数としてDynamoDBのテーブル名を定義しています
    - この値はLambda関数からのアクセスできますしserverless.ts内からもアクセスできます
- 26~40行目Lambdaを実行するIAMにDynamoDBへのアクセス権を付与しています
    - LambdaからDynamoDBにアクセスするためこれが必要です
- 43~69行目でTODOテーブルのテーブル定義をしています
    - DynamoDBはスキーマレスなDBなのでパーティションキーのみ設定しています
- 修正できたらデプロイしてみましょう

```sh
sls deploy
```

- エラーがでなければ成功です
- AWSのWebコンソールにアクセスできる人はDynamoDBのメニューからテーブルができていることを確認してみましょう

![table](/images/4-1.png)

## LambdaからDynamoDBへのアクセス

- DynamoDBにアクセスするためにライブラリを追加します

```sh
yarn add aws-sdk
```

- 後続の処理で使う一意なIDを生成するライブラリも入れておきます

```sh
yarn add uuid
yarn add -D @types/uuid
```

- handler.tsにDBにアクセスする処理を追加していきます

```ts{3,5,7-10,12-18,20-26}
import { APIGatewayProxyHandler } from 'aws-lambda';
import 'source-map-support/register';
import { DynamoDB } from 'aws-sdk';

const dynamo = new DynamoDB.DocumentClient();

const findAllTodo = () => {
  const params = { TableName: process.env.TODO_TABLE };
  return dynamo.scan(params).promise();
};

const putTodo = ({ id, text }) => {
  const params = {
    TableName: process.env.TODO_TABLE,
    Item: { id, text },
  };
  return dynamo.put(params).promise();
};

const removeTodo = ({ id }) => {
  const params = {
    TableName: process.env.TODO_TABLE,
    Key: { id },
  };
  return dynamo.delete(params).promise();
};

// ...
// 省略
// ...
```

- 3行目でDynamoDBにアクセスするためのライブラリをimportしています
- 5行目でDynamoDBクライアントを初期化しています
- 7~10行目でTodoテーブルから全量取得する関数を定義しています
    - `dynamo.scan`使っています
- 12~18行目でTodoテーブルにデータを追加更新する関数を定義しています
    - `dynamo.put`使っています
- 20~26行目でTodoテーブルからデータを削除する関数を定義しています
    - `dynamo.delete`使っています

:::tip
- 今回はscan,put,deleteを使いましたがこれ以外にもget,query,updateも存在します
:::

- 次にこれらの処理を呼び出すLambda関数をそれぞれ作っていきます
    - handler.tsを修正します

```ts{4,12-19,21-30,32-41,43-51}
import { APIGatewayProxyHandler } from 'aws-lambda';
import 'source-map-support/register';
import { DynamoDB } from 'aws-sdk';
import { v4 as uuid } from 'uuid';

const dynamo = new DynamoDB.DocumentClient();

// ...
// 省略
// ...

export const getTodos: APIGatewayProxyHandler = async () => {
  const result = await findAllTodo();
  console.log(result);
  return {
    statusCode: 200,
    body: JSON.stringify({ result }),
  };
};

export const createTodo: APIGatewayProxyHandler = async event => {
  const id = uuid();
  const text = JSON.parse(event.body).text;
  const result = await putTodo({ id, text });
  console.log(result);
  return {
    statusCode: 201,
    body: JSON.stringify({ result }),
  };
};

export const updateTodo: APIGatewayProxyHandler = async event => {
  const id = event.pathParameters.id;
  const text = JSON.parse(event.body).text;
  const result = await putTodo({ id, text });
  console.log(result);
  return {
    statusCode: 200,
    body: JSON.stringify({ result }),
  };
};

export const deleteTodo: APIGatewayProxyHandler = async event => {
  const id = event.pathParameters.id;
  const result = await removeTodo({ id });
  console.log(result);
  return {
    statusCode: 204,
    body: null,
  };
};
```

- 4行目でuuidのライブラリをimportしています
- 12~19行目で`findAllTodo()`を呼び出してTodo全量を返却する関数を定義しています
- 21~30行目で`putTodo()`を呼び出して新規Todoを作成する関数を定義しています
- 32~41行目で`putTodo()`を呼び出してTodoを更新する関数を定義しています
- 43~51行目で`removeTodo()`を呼び出してTodoを削除する関数を定義しています
- Lambda関数を作成したのでserverless.tsも修正します

```ts{43-86}
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
      TODO_TABLE: '${self:service}-${self:provider.stage}-todo',
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
    getTodos: {
      handler: 'handler.getTodos',
      events: [
        {
          http: {
            method: 'get',
            path: 'todos',
          },
        },
      ],
    },
    createTodo: {
      handler: 'handler.createTodo',
      events: [
        {
          http: {
            method: 'post',
            path: 'todos',
          },
        },
      ],
    },
    updateTodo: {
      handler: 'handler.updateTodo',
      events: [
        {
          http: {
            method: 'put',
            path: 'todos/{id}',
          },
        },
      ],
    },
    deleteTodo: {
      handler: 'handler.deleteTodo',
      events: [
        {
          http: {
            method: 'delete',
            path: 'todos/{id}',
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
          TableName: '${self:provider.environment.TODO_TABLE}',
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

- 新しく作った4つのLambda関数に対応する定義を追加しました

|関数名      |HTTPメソッド|パス        |
|:----------|:----------|:----------|
|getTodos   |GET        |/todos     |
|createTodos|POST       |/todos     |
|updateTodos|PUT        |/todos/{id}|
|deleteTodos|DELETE     |/todos/{id}|

## AWSへデプロイ/動作確認

### デプロイ

- コードの修正が完了したのでデプロイしましょう

```sh
sls deploy
```

- うまくいけば以下のような出力を得られるはずです

```
Serverless: Stack update finished...
Service Information
service: lambda-handson-ozaki25
stage: dev
region: ap-northeast-1
stack: lambda-handson-ozaki25-dev
resources: 28
api keys:
  None
endpoints:
  GET - https://xxxxxxxxxx.execute-api.ap-northeast-1.amazonaws.com/dev/todos
  POST - https://xxxxxxxxxx.execute-api.ap-northeast-1.amazonaws.com/dev/todos
  PUT - https://xxxxxxxxxx.execute-api.ap-northeast-1.amazonaws.com/dev/todos/{id}
  DELETE - https://xxxxxxxxxx.execute-api.ap-northeast-1.amazonaws.com/dev/todos/{id}
functions:
  getTodos: lambda-handson-ozaki25-dev-getTodos
  createTodo: lambda-handson-ozaki25-dev-createTodo
  updateTodo: lambda-handson-ozaki25-dev-updateTodo
  deleteTodo: lambda-handson-ozaki25-dev-deleteTodo
layers:
  None
```

### 動作確認

- Restクライアントでアクセスして動作確認してみましょう
- Createした後にGetするなどいろいろ叩いて試してみてください
- UpdateとDeleteを叩くために必要なIDの値はGetでデータを取得して確認してください

#### getTodos

- HTTPメソッドはGETでURLは/todosです

![get](/images/4-2.png)

#### createTodo

- HTTPメソッドはPOSTでURLは/todosです
- bodyにtextというキー名で値を設定するとTODOの内容として登録されます

![post](/images/4-3.png)

#### updateTodo

- HTTPメソッドはPUTでURLは/todos/{id}です
    - {id}の部分に入れる値はgetTodosを実行することで確認してください
- bodyにtextというキー名で値を設定するとその値で更新されます

![put](/images/4-4.png)

#### deleteTodo

- HTTPメソッドはDELETEでURLは/todos/{id}です
    - {id}の部分に入れる値はgetTodosを実行することで確認してください

![delete](/images/4-5.png)

