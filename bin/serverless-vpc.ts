#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { ServerlessVpcStack } from '../lib/serverless-vpc-stack';

const app = new cdk.App();
new ServerlessVpcStack(app, 'ServerlessVpcStack');
