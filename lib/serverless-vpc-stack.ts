import * as lambda from "@aws-cdk/aws-lambda";
import * as ec2 from "@aws-cdk/aws-ec2";
import * as iam from "@aws-cdk/aws-iam";
import * as cdk from "@aws-cdk/core";
import { Aspects, Duration } from "@aws-cdk/core";
import { SubnetType } from "@aws-cdk/aws-ec2";
import { VpcAttachAspect } from "./vpc-attach-aspect";

export interface ServerlessVpcStackProps extends cdk.StackProps {
  development?: boolean;
  appName: string;
}

export class ServerlessVpcStack extends cdk.Stack {
  readonly lambda: lambda.IFunction;
  readonly NODE_ENV: string;
  readonly vpc: ec2.Vpc;
  readonly cidr: string;

  constructor(
    scope: cdk.Construct,
    id: string,
    props?: ServerlessVpcStackProps
  ) {
    super(scope, id, props);

    this.NODE_ENV = props?.development ? "development" : "production";

    this.cidr = "10.0.0.0/16";

    this.vpc = new ec2.Vpc(this, "serverless-vpc", {
      cidr: this.cidr,
      gatewayEndpoints: {
        S3: {
          service: ec2.GatewayVpcEndpointAwsService.S3,
        },
        DynamoDB: {
          service: ec2.GatewayVpcEndpointAwsService.DYNAMODB,
        },
      },
      maxAzs: 2,
      subnetConfiguration: [
        {
          cidrMask: 24,
          name: "isolated",
          subnetType: ec2.SubnetType.ISOLATED,
        },
      ],
    });

    type InterfaceEndpointsList = {
      [name: string]: ec2.InterfaceVpcEndpointAwsService;
    }

    const interfaceEndpoints: InterfaceEndpointsList = {
      stepfunctions: ec2.InterfaceVpcEndpointAwsService.STEP_FUNCTIONS,
      athena: ec2.InterfaceVpcEndpointAwsService.ATHENA,
      apigw: ec2.InterfaceVpcEndpointAwsService.APIGATEWAY,
      events: ec2.InterfaceVpcEndpointAwsService.CLOUDWATCH_EVENTS,
    };

    Object.keys(interfaceEndpoints).forEach((name) =>
      this.vpc.addInterfaceEndpoint(name, { service: interfaceEndpoints[name] })
    );

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
      vpc: this.vpc,
      vpcSubnets: { subnetType: SubnetType.ISOLATED, onePerAz: true },
    };

    this.lambda = new lambda.Function(
      this,
      "serverless-lambda-handler",
      handlerProps
    );

    const s3Policy = iam.ManagedPolicy.fromAwsManagedPolicyName(
      "AmazonS3ReadOnlyAccess"
    );

    this.lambda.role?.addManagedPolicy(s3Policy);

    Aspects.of(this).add(new VpcAttachAspect(this.vpc));
  }
}
