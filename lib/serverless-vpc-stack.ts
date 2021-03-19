import * as lambda from "@aws-cdk/aws-lambda";
import * as cdk from "@aws-cdk/core";
import { Duration } from "@aws-cdk/core";

export interface ServerlessVpcStackProps extends cdk.StackProps {
  development?: boolean;
  appName: string;
}

export class ServerlessVpcStack extends cdk.Stack {
  readonly lambda: lambda.IFunction;
  readonly NODE_ENV: string;

  constructor(
    scope: cdk.Construct,
    id: string,
    props?: ServerlessVpcStackProps
  ) {
    super(scope, id, props);

    this.NODE_ENV = props?.development ? "development" : "production";

    const environment = {
      NODE_OPTIONS: "--enable-source-maps",
      NODE_ENV: this.NODE_ENV,
      STACK_ARN: this.stackId,
    };

    const handlerProps: lambda.FunctionProps = {
      code: lambda.Code.fromAsset("./lambda"),
      handler: "index.main",
      runtime: lambda.Runtime.NODEJS_12_X,
      timeout: Duration.seconds(30),
      memorySize: 256,
      tracing: lambda.Tracing.ACTIVE,
      environment,
    };

    this.lambda = new lambda.Function(this, "vpc-lambda-handler", handlerProps);
  }
}
