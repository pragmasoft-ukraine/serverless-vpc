import {S3} from 'aws-sdk'

import {
    APIGatewayProxyEventV2,
    APIGatewayProxyResultV2,
} from 'aws-lambda'


const s3: S3 = new S3();

export const main = async (event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResultV2>  => {
    console.info('event: ' + JSON.stringify(event));
    // let { system } = event.queryStringParameters ?? {};
    const list = await s3.listBuckets().promise();
    const names = list.Buckets?.map(b => b.Name);
    const result = JSON.stringify(names)
    return result;
}

main({} as APIGatewayProxyEventV2)
.then(console.info)