import { IAspect, IConstruct } from "@aws-cdk/core";
import * as ec2 from "@aws-cdk/aws-ec2";
import { CfnFunction, Function } from "@aws-cdk/aws-lambda";

/**
 * Attaches network interfaces of all lambda functions in the wrapped construct to the private subnets of the passed VPC
 */
export class VpcAttachAspect implements IAspect {
  readonly vpc: ec2.IVpc;

  constructor(_vpc: ec2.IVpc) {
    this.vpc = _vpc;
  }

  visit(construct: IConstruct): void {
    if (construct instanceof Function) {
      console.log(
        `Function ${construct.node.id} ${
          construct.isBoundToVpc ? "bound to VPC" : ""
        }`
      );
      if (construct.isBoundToVpc) {
        const cfnFunction = construct.node.defaultChild as CfnFunction;
        console.log(JSON.stringify(cfnFunction.vpcConfig));
      }
    }
  }
}
