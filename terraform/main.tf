terraform {
  required_version = ">= 1.5"
  required_providers {
    aws   = { source = "hashicorp/aws", version = "~> 5.0" }
    tls   = { source = "hashicorp/tls", version = "~> 4.0" }
    local = { source = "hashicorp/local", version = "~> 2.0" }
  }
}

provider "aws" {
  region = var.region
  default_tags {
    tags = {
      Project   = "kiro-rehearsal"
      ManagedBy = "terraform"
    }
  }
}

variable "region" {
  default = "us-east-1"
}

variable "instance_type" {
  default = "t3.micro"
}

variable "name" {
  default = "kiro-rehearsal"
}

variable "ssh_cidr" {
  description = "SSH(22) 허용 CIDR. 가능하면 '내IP/32'로 좁힐 것."
  default     = "0.0.0.0/0"
}

# Amazon Linux 2023 최신 AMI (x86_64)
data "aws_ssm_parameter" "al2023" {
  name = "/aws/service/ami-amazon-linux-latest/al2023-ami-kernel-6.1-x86_64"
}

data "aws_vpc" "default" {
  default = true
}

data "aws_subnets" "default" {
  filter {
    name   = "vpc-id"
    values = [data.aws_vpc.default.id]
  }
}

# ── SSH 키 자동 생성 ──────────────────────────────
resource "tls_private_key" "key" {
  algorithm = "RSA"
  rsa_bits  = 4096
}

resource "aws_key_pair" "key" {
  key_name   = "${var.name}-key"
  public_key = tls_private_key.key.public_key_openssh
}

resource "local_file" "pem" {
  content         = tls_private_key.key.private_key_pem
  filename        = "${path.module}/${var.name}-key.pem"
  file_permission = "0400"
}

# ── 보안그룹: 22(SSH), 8080(Next.js 1-Tier)만. 8000은 일부러 안 연다 ──
#    → 리허설에서 인스턴스 Role로 8000을 여는 걸 실제로 검증하기 위함
resource "aws_security_group" "sg" {
  name        = "${var.name}-sg"
  description = "KIRO handson rehearsal"
  vpc_id      = data.aws_vpc.default.id

  ingress {
    description = "SSH"
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = [var.ssh_cidr]
  }

  ingress {
    description = "Next.js 1-Tier"
    from_port   = 8080
    to_port     = 8080
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

# ── 인스턴스 Role: S3 정적호스팅 + 보안그룹 수정 (KIRO가 이 Role로 인프라 조작) ──
resource "aws_iam_role" "instance" {
  name = "${var.name}-role"
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect    = "Allow"
      Principal = { Service = "ec2.amazonaws.com" }
      Action    = "sts:AssumeRole"
    }]
  })
}

resource "aws_iam_role_policy" "instance" {
  name = "${var.name}-policy"
  role = aws_iam_role.instance.id
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid    = "S3StaticHosting"
        Effect = "Allow"
        Action = [
          "s3:CreateBucket", "s3:DeleteBucket", "s3:ListBucket", "s3:GetBucketLocation",
          "s3:PutObject", "s3:DeleteObject",
          "s3:PutBucketWebsite", "s3:PutBucketPolicy", "s3:PutBucketPublicAccessBlock"
        ]
        Resource = "*"
      },
      {
        Sid    = "SecurityGroupEdit"
        Effect = "Allow"
        Action = [
          "ec2:DescribeInstances", "ec2:DescribeSecurityGroups",
          "ec2:AuthorizeSecurityGroupIngress", "ec2:RevokeSecurityGroupIngress"
        ]
        Resource = "*"
      }
    ]
  })
}

resource "aws_iam_instance_profile" "instance" {
  name = "${var.name}-profile"
  role = aws_iam_role.instance.name
}

# ── EC2 인스턴스 ──────────────────────────────────
resource "aws_instance" "app" {
  ami                         = data.aws_ssm_parameter.al2023.value
  instance_type               = var.instance_type
  subnet_id                   = data.aws_subnets.default.ids[0]
  vpc_security_group_ids      = [aws_security_group.sg.id]
  key_name                    = aws_key_pair.key.key_name
  iam_instance_profile        = aws_iam_instance_profile.instance.name
  associate_public_ip_address = true

  user_data = <<-EOF
    #!/bin/bash
    dnf install -y nodejs python3-pip git mariadb105-server
    systemctl enable --now mariadb
  EOF

  tags = { Name = var.name }
}
