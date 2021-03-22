#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { ServerlessVpcStack } from '../lib/serverless-vpc-stack';

const app = new cdk.App();

new ServerlessVpcStack(app, 'aaServerlessVpcStack', { appName: 'ServerlessVpcStack', env: {account: '488285037276', region: 'us-west-1'}, description: "prototype of a vpc attached lambda"});
