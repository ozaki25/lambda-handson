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

- うまくいけば2章と同じように以下のようなレスピンスが得られるはずです

```json
{"message":"Hello Lambda!"}
```

:::tip
- curlコマンドの代わりにREST Clientサービスを使うと可視性もよく非常に使い勝手が良いです
- [Advanced REST client](https://chrome.google.com/webstore/detail/advanced-rest-client/hgmloofddffdnphfgcellkdfbfbjeloo/details?hl=ja-JP)や[Postman](https://chrome.google.com/webstore/detail/postman/fhbjgbiflinjbdggehcddcbncdddomop?hl=ja-jp)などがあります
:::

