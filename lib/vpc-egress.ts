import * as ec2 from "@aws-cdk/aws-ec2";
import * as cdk from "@aws-cdk/core";
import { Aspects } from "@aws-cdk/core";
import { VpcAttachAspect } from "./vpc-attach-aspect";

export type InterfaceEndpointsList = ec2.InterfaceVpcEndpointAwsService[];

export type GatewayVpcEndpointsList = ec2.GatewayVpcEndpointAwsService[];

export type VpcEgressProps = {
  cidr?: string;
  useNatGateway?: boolean;
  gatewayEndpoints?: GatewayVpcEndpointsList;
  interfaceEndpoints?: InterfaceEndpointsList;
};

export const defaultGatewayEndpoints: GatewayVpcEndpointsList = [
  ec2.GatewayVpcEndpointAwsService.S3,
  ec2.GatewayVpcEndpointAwsService.DYNAMODB,
];

export const defaultInterfaceEndpoints: InterfaceEndpointsList = [
  ec2.InterfaceVpcEndpointAwsService.STEP_FUNCTIONS,
  ec2.InterfaceVpcEndpointAwsService.ATHENA,
  ec2.InterfaceVpcEndpointAwsService.APIGATEWAY,
  ec2.InterfaceVpcEndpointAwsService.CLOUDWATCH_EVENTS,
];

export const defaultConnectedVpcProps: VpcEgressProps = {
  cidr: "10.0.0.0/16",
  useNatGateway: false,
  gatewayEndpoints: defaultGatewayEndpoints,
  interfaceEndpoints: defaultInterfaceEndpoints,
};

export class VpcEgress extends cdk.Construct {
  readonly vpc: ec2.Vpc;
  readonly securityGroups: ec2.ISecurityGroup[];

  constructor(
    scope: cdk.Construct,
    id: string,
    props: VpcEgressProps = defaultConnectedVpcProps
  ) {
    super(scope, id);

    this.vpc = new ec2.Vpc(this, "vpc", {
      cidr: props.cidr ?? defaultConnectedVpcProps.cidr,
      maxAzs: 2,
      subnetConfiguration: [
        {
          cidrMask: 24,
          name: "isolated",
          subnetType: ec2.SubnetType.ISOLATED,
        },
      ],
    });

    function suffix(s: string, sep: string): string {
      return s.split(sep).pop()!;
    }

    const interfaceEndpoints =
      props.interfaceEndpoints ?? defaultInterfaceEndpoints;

    interfaceEndpoints.forEach((service) =>
      this.vpc.addInterfaceEndpoint(suffix(service.name, "."), { service })
    );

    const gatewayEndpoints = props.gatewayEndpoints ?? defaultGatewayEndpoints;

    gatewayEndpoints.forEach((service) =>
      this.vpc.addGatewayEndpoint(suffix(service.name, "."), { service })
    );

    const securityGroup = new ec2.SecurityGroup(this, "SecurityGroup", {
      vpc: this.vpc,
      description: "Security group for Lambda Function",
      allowAllOutbound: true,
    });
    this.securityGroups = [securityGroup];
  }

  attachVpc(scope: cdk.IConstruct = this.node.scope!): VpcEgress {
    Aspects.of(scope).add(new VpcAttachAspect(this.vpc, this.securityGroups));
    return this;
  }
}
