package main

import (
	"context"
	"fmt"
	"time"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/service/s3"
)

func generatePresigneURL(s3Client *s3.Client, bucket, key string, expiresIn time.Duration) (string, error) {
	presignClient := s3.NewPresignClient(s3Client)
	presignedUrl, err := presignClient.PresignGetObject(context.TODO(), &s3.GetObjectInput{
		Bucket: aws.String(bucket),
		Key:    aws.String(key),
	}, s3.WithPresignExpires(expiresIn))

	if err != nil {
		return "", fmt.Errorf("failed to generate presigned url: %v", err)
	}

	return presignedUrl.URL, nil
}
