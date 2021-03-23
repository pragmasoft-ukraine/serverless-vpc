import { S3, StepFunctions } from "aws-sdk";
import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from "aws-lambda";
import { config } from "aws-sdk";

process.env.AWS_SDK_LOAD_CONFIG='1'

const conf = { region: config.region };
const s3 = new S3(conf);
const sfn = new StepFunctions(conf);

export const main = async (
  event: APIGatewayProxyEventV2
): Promise<APIGatewayProxyResultV2> => {
  console.info("event: " + JSON.stringify(event));
  const bucketsList = await s3.listBuckets().promise();
  const buckets = bucketsList.Buckets?.map((i) => i.Name);

  const fnList = await sfn.listStateMachines().promise();
  const functions = fnList.stateMachines?.map((i) => i.name);

  const result = JSON.stringify({ buckets, functions }, undefined,2);
  return result;
};

main({} as APIGatewayProxyEventV2)
  .then(console.info)
  .catch(console.error);
