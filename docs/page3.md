# 3章 API Gateway

## 概要

- API Gatewayを用いて2章で作成したLambda関数にHTTPでアクセスできるようにします
- API Gatewayの設定もServerlessFrameworkを通してコードで管理していきます

## ゴール

- Lambda関数をAPI Gatewayを通して呼び出す設定のしかたを覚える

## API Gatewayの設定

### serverless.tsの修正

- API Gatewayの設定はserverless.tsでおこないます
- テンプレートで用意されていたhello関数にすでに設定されているのでまずはそれを見てみましょう

```ts{28-35}
import type { AWS } from '@serverless/typescript';

const serverlessConfiguration: AWS = {
  service: 'lambda-handson-ozaki25',
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
    },
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
    },
  },
};

module.exports = serverlessConfiguration;
```

- 28~35行目がAPI Gatewayの設定です
    - eventsは別のサービスから該当のLambda関数を呼び出したいときに設定するエリアです
    - httpがAPI Gatewayの設定となります
        - methodでHTTPメソッドを指定します（GET/POST等々）
        - pathでURLのパスを設定します（この例だと/hello）
        - この設定では`https://xxxxxxx/hello`にGETでアクセスするとhello関数を実行することができます
- helloworld関数にもAPI Gatewayの設定を追加してみましょう

```ts{39-46}
import type { AWS } from '@serverless/typescript';

const serverlessConfiguration: AWS = {
  service: 'lambda-handson-ozaki25',
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
    },
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
  },
};

module.exports = serverlessConfiguration;
```

- hello関数に倣って`/helloworld`にGETでアクセスするとhelloworld関数が実行されるようにしました

## AWSへデプロイ/動作確認

- 修正が完了したのでデプロイしましょう

```sh
sls deploy
```

- デプロイが完了したら出力を確認してみましょう
    - `endpoints`にどんなURLアクセスすればよいか表示されているはずです

```
Serverless: Stack update finished...
Service Information
service: lambda-handson-ozaki25
stage: dev
region: ap-northeast-1
stack: lambda-handson-ozaki25-dev
resources: 17
api keys:
  None
endpoints:
  GET - https://xxxxxxxxxx.execute-api.ap-northeast-1.amazonaws.com/dev/hello
  GET - https://xxxxxxxxxx.execute-api.ap-northeast-1.amazonaws.com/dev/helloworld
functions:
  hello: lambda-handson-ozaki25-dev-hello
  helloworld: lambda-handson-ozaki25-dev-helloworld
layers:
  None
```

- endpointsに出力されたhelloworldの方のURLにアクセスしてみましょう

```sh
curl -X GET https://xxxxxxxxxx.execute-api.ap-northeast-1.amazonaws.com/dev/helloworld
```

- うまくいけば2章と同じように以下のようなレスポンスが得られるはずです

```json
{"message":"Hello Lambda!"}
```

:::tip
- デプロイ時の出力を消してしまった場合は`sls info`を実行するとURLなどを確認することができます
:::

:::tip
- curlコマンドの代わりにREST Clientサービスを使うと可視性もよく非常に使い勝手が良いです
- [Advanced REST client](https://chrome.google.com/webstore/detail/advanced-rest-client/hgmloofddffdnphfgcellkdfbfbjeloo/details?hl=ja-JP)や[Postman](https://chrome.google.com/webstore/detail/postman/fhbjgbiflinjbdggehcddcbncdddomop?hl=ja-jp)などがあります
:::

## (応用)URLのパラメータの取得

- 上の作業では特定のURLにアクセスすれば必ず同じ処理が実行されるパターンでした
- 実際にアプリケーション開発をしていると`/users/1`などURLに値を埋め込みそれを元に処理をするケースがあります
- URLに値を埋め込むパターンを紹介します

### パスパラメータの設定

- `/users/1`といった形式でURLにアクセスしLambda関数の中で`1`の部分を取得して処理を実行します
- handler.tsに新しい関数を作成しましょう
    - 一番下に以下のコードを追加してください

```ts
// 省略
export const helloPathParameter: APIGatewayProxyHandler = async event => {
  // パスパラメータのidを取得
  const id = event.pathParameters.id;
  console.log(`Your ID is ${id}`);

  return {
    statusCode: 200,
    body: JSON.stringify({ message: `Your ID is ${id}` }),
  };
};
```

- 関数を作成したのでserverless.tsにも修正を加えます

```ts{11-21}
import type { AWS } from '@serverless/typescript';

const serverlessConfiguration: AWS = {
  // ...
  // 省略
  // ...
  functions: {
  // ...
  // 省略
  // ...
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
  },
};

module.exports = serverlessConfiguration;
```

- 一番下の方に設定を追加しました
    - pathの部分が`helloparams/{id}`となっているのがポイントです
        - 場合によっては`blogs/{blodId}/comments/{commentId}`のように複数設定することも可能です
- 修正したらデプロイしましょう

```sh
sls deploy
```

- 出力結果を確認するとURLが追加されているはずです

```
Serverless: Stack update finished...
Service Information
service: lambda-handson-ozaki25
stage: dev
region: ap-northeast-1
stack: lambda-handson-ozaki25-dev
resources: 23
api keys:
  None
endpoints:
  GET - https://xxxxxxxxxx.execute-api.ap-northeast-1.amazonaws.com/dev/hello
  GET - https://xxxxxxxxxx.execute-api.ap-northeast-1.amazonaws.com/dev/helloworld
  GET - https://xxxxxxxxxx.execute-api.ap-northeast-1.amazonaws.com/dev/helloparams/{id}
functions:
  hello: lambda-handson-ozaki25-dev-hello
  helloworld: lambda-handson-ozaki25-dev-helloworld
  helloPathParameter: lambda-handson-ozaki25-dev-helloPathParameter
layers:
  None
```

- curlやREST Clientでアクセスしてみましょう

```sh
curl -X GET https://xxxxxxxxxx.execute-api.ap-northeast-1.amazonaws.com/dev/helloparams/1234
```

- うまくいけば以下のような出力を得られるはずです

```json
{"message":"Your ID is 1234"}
```

### クエリパラメータの設定

- 続いて`/users?name=ozaki25`といった形式でURLにアクセスしLambda関数の中で`ozaki25`の部分を取得して処理を実行します
- handler.tsに新しい関数を作成しましょう
    - 一番下に以下のコードを追加してください

```ts
// 省略
export const helloQueryParameter: APIGatewayProxyHandler = async event => {
  // クエリストリングからnameの値を取得
  const name = event.queryStringParameters.name;
  console.log(`Your Name is ${name}`);

  return {
    statusCode: 200,
    body: JSON.stringify({ message: `Your Name is ${name}` }),
  };
};
```

- 関数を作成したのでserverless.tsにも修正を加えます

```ts{11-29}
import type { AWS } from '@serverless/typescript';

const serverlessConfiguration: AWS = {
  // ...
  // 省略
  // ...
  functions: {
  // ...
  // 省略
  // ...
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
};

module.exports = serverlessConfiguration;
```

- 一番下の方に設定を追加しました
    - `request/parameters/querystrings`の部分の追加されました
    - `name: true`はクエリとしてnameが必須項目であることを意味しています
- 修正したらデプロイしましょう

```sh
sls deploy
```

- 出力結果を確認するとURLが追加されているはずです

```
Serverless: Stack update finished...
Service Information
service: lambda-handson-ozaki25
stage: dev
region: ap-northeast-1
stack: lambda-handson-ozaki25-dev
resources: 27
api keys:
  None
endpoints:
  GET - https://xxxxxxxxxx.execute-api.ap-northeast-1.amazonaws.com/dev/hello
  GET - https://xxxxxxxxxx.execute-api.ap-northeast-1.amazonaws.com/dev/helloworld
  GET - https://xxxxxxxxxx.execute-api.ap-northeast-1.amazonaws.com/dev/helloparams/{id}
  GET - https://xxxxxxxxxx.execute-api.ap-northeast-1.amazonaws.com/dev/helloparams
functions:
  hello: lambda-handson-ozaki25-dev-hello
  helloworld: lambda-handson-ozaki25-dev-helloworld
  helloPathParameter: lambda-handson-ozaki25-dev-helloPathParameter
  helloQueryParameter: lambda-handson-ozaki25-dev-helloQueryParameter
layers:
  None
```

- curlやREST Clientでアクセスしてみましょう

```sh
curl -X GET https://xxxxxxxxxx.execute-api.ap-northeast-1.amazonaws.com/dev/helloparams?name=ozaki25
```

- うまくいけば以下のような出力を得られるはずです

```json
{"message":"Your Name is ozaki25"}
```
