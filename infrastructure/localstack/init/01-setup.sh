#!/bin/bash
set -e

echo "Cleaning up existing resources..."
awslocal lambda delete-function --function-name status-change-handler 2>/dev/null || true
awslocal events remove-targets --rule application-status-changed-rule --ids "1" 2>/dev/null || true
awslocal events delete-rule --name application-status-changed-rule 2>/dev/null || true

echo "Creating S3 bucket..."
awslocal s3 mb s3://job-tracker-cvs 2>/dev/null || true

echo "Creating IAM role for Lambda..."
awslocal iam create-role \
  --role-name lambda-exec-role \
  --assume-role-policy-document '{
    "Version": "2012-10-17",
    "Statement": [{
      "Effect": "Allow",
      "Principal": {"Service": "lambda.amazonaws.com"},
      "Action": "sts:AssumeRole"
    }]
  }' 2>/dev/null || true

echo "Attaching S3 access policy to role..."
awslocal iam put-role-policy \
  --role-name lambda-exec-role \
  --policy-name s3-access \
  --policy-document '{
    "Version": "2012-10-17",
    "Statement": [{
      "Effect": "Allow",
      "Action": ["s3:PutObject", "s3:GetObject", "s3:ListBucket"],
      "Resource": ["arn:aws:s3:::job-tracker-cvs", "arn:aws:s3:::job-tracker-cvs/*"]
    }]
  }' 2>/dev/null || true

echo "Zipping Lambda function..."
cd /lambdas/status-change-handler
zip -r function.zip index.js package.json
cd -

echo "Creating Lambda function..."
awslocal lambda create-function \
  --function-name status-change-handler \
  --runtime nodejs18.x \
  --handler index.handler \
  --role arn:aws:iam::000000000000:role/lambda-exec-role \
  --zip-file fileb:///lambdas/status-change-handler/function.zip \
  --environment Variables="{AWS_ENDPOINT_URL=http://localstack:4566,AWS_ACCESS_KEY_ID=test,AWS_SECRET_ACCESS_KEY=test}"

echo "Waiting for Lambda to be active..."
sleep 5

echo "Creating EventBridge rule..."
awslocal events put-rule \
  --name application-status-changed-rule \
  --event-pattern '{"source":["job-tracker"],"detail-type":["ApplicationStatusChanged"]}'

echo "Setting Lambda as EventBridge target..."
awslocal events put-targets \
  --rule application-status-changed-rule \
  --targets "Id"="1","Arn"="arn:aws:lambda:us-east-1:000000000000:function:status-change-handler"

echo "Granting EventBridge permission to invoke Lambda..."
awslocal lambda add-permission \
  --function-name status-change-handler \
  --statement-id eventbridge-invoke \
  --action lambda:InvokeFunction \
  --principal events.amazonaws.com \
  --source-arn arn:aws:events:us-east-1:000000000000:rule/application-status-changed-rule

echo "LocalStack setup complete."