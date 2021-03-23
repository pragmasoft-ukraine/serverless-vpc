import { IAspect, IConstruct } from "@aws-cdk/core";
import * as ec2 from "@aws-cdk/aws-ec2";
import { CfnFunction, Function } from "@aws-cdk/aws-lambda";
import { ManagedPolicy } from "@aws-cdk/aws-iam";

/**
 * Attaches network interfaces of all lambda functions in the wrapped construct to the private subnets of the passed VPC
 */
export class VpcAttachAspect implements IAspect {
  private vpc: ec2.IVpc;
  private securityGroups: ec2.ISecurityGroup[];

  constructor(_vpc: ec2.IVpc, _sgs: ec2.ISecurityGroup[]) {
    this.vpc = _vpc;
    this.securityGroups = _sgs;
  }

  visit(construct: IConstruct): void {
    if (construct instanceof Function && !construct.isBoundToVpc) {
      this.attachTo(construct);
    }
  }

  private attachTo(lambda: Function) {
    console.log(`attach lambda ${lambda.node.id} to VPC ${this.vpc.node.id}`);
    lambda.role?.addManagedPolicy(
      ManagedPolicy.fromAwsManagedPolicyName(
        "service-role/AWSLambdaVPCAccessExecutionRole"
      )
    );
    lambda["_connections"] = new ec2.Connections({
      securityGroups: this.securityGroups,
    });
    const cfnFunction = lambda.node.defaultChild as CfnFunction;
    const { subnetIds } = this.vpc.selectSubnets({
      subnetType: ec2.SubnetType.ISOLATED,
      onePerAz: true,
    });
    const securityGroupIds = this.securityGroups.map(
      (sg) => sg.securityGroupId
    );
    cfnFunction.vpcConfig = {
      subnetIds,
      securityGroupIds,
    };
  }
}
