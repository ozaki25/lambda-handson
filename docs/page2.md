# 2章 Lambda

## 概要

- Lambda関数を新規に作成してAWSにデプロイし実行してみます
- ServerlessFrameworkを用いてAWSのWebコンソールをいじることなくコードベースで作成していきます

## ゴール

- ServerlessFrameworkを使ってプロジェクトを作成できるようになる
- Lambda関数の作成のしかたを覚える
- Lambda関数をローカルで実行できるようになる
- Lambda関数をデプロイできるようになる
- AWS上のLambda関数を実行できるようになる

## プロジェクトの作成

- ServerlessFrameworkでプロジェクトを作成します
    - 今回はTypeScriptを使います

```sh
# フォルダを作成
mkdir lambda-handson
```

```sh
# フォルダに移動
cd lambda-handson
```

```sh
# slsコマンドでプロジェクト作成
sls create -t aws-nodejs-typescript
```

- 実行すると以下のようなファイルが生成されました

```sh
lambda-handson
├── .gitignore
├── .vscode
│   └── launch.json
├── handler.ts # Lambdaで実行する処理を書くファイル
├── package.json # 依存ライブラリの情報などが書かれたファイル
├── serverless.ts # ServerlessFrameworkの設定ファイル
├── tsconfig.json # TypeScriptの設定ファイル
└── webpack.config.js # ビルドの設定ファイル
```

:::tip
- ServerlessFrameworkはTypeScript以外にもいろいろな言語のテンプレートが用意されています
    - [https://www.serverless.com/framework/docs/providers/aws/cli-reference/create#available-templates](https://www.serverless.com/framework/docs/providers/aws/cli-reference/create#available-templates)
:::

- 以下のコマンドで依存ライブラリをインストールしておきます
    - lambda-handsonフォルダ内で実行します

```sh
yarn
```

- これからコードを書いていくのでlambda-handsonフォルダをVSCodeで開いておきましょう
    - [#VSCodeのインストール](/page1.html#vscodeのインストール)

### 設定ファイルの修正

- ServerlessFrameworkの設定ファイルである`serverless.ts`を修正します
    - 4行目のservice名の末尾に名前などを追加して一意になるように変更してください
        - 同じAWS環境にデプロイする場合に名前がかぶっていると上書きしてしまうのでかぶらないようにしておく必要があります
    - 15行目にregionの設定を追加してください
        - `ap-northeast-1`は東京リージョンです

```ts{4,15}
import type { AWS } from '@serverless/typescript';

const serverlessConfiguration: AWS = {
  service: 'lambda-handson-xxx', // 一意になるように自分の名前などを後ろにつける
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
    // ...
```

## Lambda関数の作成

### handler.tsの修正

- Lambdaで実行する処理はhandler.tsに書いていきます
- handler.tsを開くと以下のような状態になっています

```ts{4}
import { APIGatewayProxyHandler } from 'aws-lambda';
import 'source-map-support/register';

export const hello: APIGatewayProxyHandler = async (event, _context) => {
  return {
    statusCode: 200,
    body: JSON.stringify({
      message: 'Go Serverless Webpack (Typescript) v1.0! Your function executed successfully!',
      input: event,
    }, null, 2),
  };
}
```

- テンプレートとしてhelloという関数が定義されexportされています
    - ServerlessFrameworkを使う場合はexportされた単位が１つのLambda関数となります
    - 同じように関数を定義してexportすることで１つのファイルに複数のLambda関数を定義することができます
- helloworldという新しい関数を作成してみましょう

```ts{14-19}
import { APIGatewayProxyHandler } from 'aws-lambda';
import 'source-map-support/register';

export const hello: APIGatewayProxyHandler = async (event, _context) => {
  return {
    statusCode: 200,
    body: JSON.stringify({
      message: 'Go Serverless Webpack (Typescript) v1.0! Your function executed successfully!',
      input: event,
    }, null, 2),
  };
}

export const helloworld: APIGatewayProxyHandler = async () => {
  return {
    statusCode: 200,
    body: JSON.stringify({ message: 'Hello Lambda!' }),
  };
};
```

- `Hello Lambda!`と返却するだけの関数ができました

### Serverless.tsの修正

- ServerlessFrameworkの設定ファイルに新しく作成したhelloworld関数の情報を定義していきます
    - Lambdaの情報は`functions`に定義します
    - 現状のコードを見るとhello関数の情報が定義してありますね

```ts{25-36}
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
  },
};

module.exports = serverlessConfiguration;
```

- hello関数と同様にhelloworld関数の設定も追加してみましょう

```ts{37-39}
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

- 37~39行目を追加しました
    - 37行目の`helloworld`はLambdaの関数名です
        - handler.tsでのexport名と合わせておくとよいでしょう
    - 38行目は関数がどのファイルのどこにあるかを指定しています
        - handler.tsというファイル内でhelloworldという名前でexportされた関数を指定しています
- 28行目辺りにある`events`は3章で解説します

## Lambda関数を実行（ローカル編）

- helloworld関数を作るために必要なコードは完成しました
- まずはローカル環境で動作確認してみましょう
- 以下のコマンドで実行することができます

```sh
sls invoke local -f helloworld
```

- `sls invoke`がLambda関数を実行するコマンドです
- `local`をつけるとAWS上ではなくローカルのLambdaを実行します
- `-f`で実行する関数名を指定しています
    - serverless.tsで定義した関数名と紐付いています
- うまくいけば以下のような出力が得られるはずです

```json
{
    "statusCode": 200,
    "body": "{\"message\":\"Hello Lambda!\"}"
}
```

## Lambda関数をデプロイ

- ローカルでの動作確認ができたのでAWSへデプロイしましょう
- 以下のコマンドでデプロイできます

```sh
sls deploy
```

:::warning
[1章 事前準備](page1.html#awsのapiキーのセットアップ)でAWSのキー情報が設定済みである必要があります
:::

- うまくいけば以下のような出力が得られるはずです

```
Serverless: Stack update finished...
Service Information
service: lambda-handson-ozaki25
stage: dev
region: ap-northeast-1
stack: lambda-handson-ozaki25-dev
resources: 14
api keys:
  None
endpoints:
  GET - https://xxxxxxxxxx.execute-api.ap-northeast-1.amazonaws.com/dev/hello
functions:
  hello: lambda-handson-ozaki25-dev-hello
  helloworld: lambda-handson-ozaki25-dev-helloworld
layers:
  None
```

:::tip
- deployしたリソースの削除は`sls remove`で実行できます
- ハンズオン終了後は忘れずに削除しておきましょう
:::

## Lambda関数を実行（AWS編）

- AWSへのデプロイが完了したので実行してみます
- 以下のコマンドで実行できます

```sh
sls invoke -f helloworld
```

- ローカルで実行した時と同様のレスポンスを得られればOKです

```json
{
    "statusCode": 200,
    "body": "{\"message\":\"Hello Lambda!\"}"
}
```

## (参考)ログの確認

- (AWSのWebコンソールアクセスできる人向け)
- CloudWatchLogsというサービスを通してログを確認することができます
- handler.tsを修正してログを出力するようにしてみます
    - 20行目を追加しています

```ts{20}
import { APIGatewayProxyHandler } from 'aws-lambda';
import 'source-map-support/register';

export const hello: APIGatewayProxyHandler = async (event, _context) => {
  return {
    statusCode: 200,
    body: JSON.stringify(
      {
        message:
          'Go Serverless Webpack (Typescript) v1.0! Your function executed successfully!',
        input: event,
      },
      null,
      2,
    ),
  };
};

export const helloworld: APIGatewayProxyHandler = async () => {
  console.log('Hello Lambda');
  return {
    statusCode: 200,
    body: JSON.stringify({ message: 'Hello Lambda!' }),
  };
};
```

- 修正したらデプロイしましょう

```sh
sls deploy
```

- ログを出すために関数を実行しておきます

```sh
sls invoke -f helloworld
```

- 準備は整ったのでAWSのWebコンソールにログインしCloudWatchLogsにアクセスしてみましょう

![cloud watch](/images/2-1.png)
![cloud watch](/images/2-2.png)

- 自身の関数名を探してhelloworldの方を開いてみましょう

![cloud watch](/images/2-3.png)

- 最新のアクセスを開いてみましょう

![cloud watch](/images/2-4.png)

- console.logの出力を確認できるはずです

![cloud watch](/images/2-5.png)

