# Prototype CDK Typescript project demonstrating the use of CDK Aspect to attach serverless functions to VPC

This project creates a CDK stack, consisting of one lambda function, which queries a list of S3 buckets from the S3 api.

This function's network interface is attached to a VPC by the aspect `lib/vpc-attach-aspect.ts`

## Installation of dependencies

To install dependencies, run `npm i`

## Useful commands

 * `npm run build`   compile typescript to js
 * `npm run watch`   watch for changes and compile
 * `npm run test`    perform the jest unit tests
 * `npm cdk deploy`      deploy this stack to your default AWS account/region
 * `npm cdk diff`        compare deployed stack with current state
 * `npm cdk synth`       emits the synthesized CloudFormation template
