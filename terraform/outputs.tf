output "public_ip" {
  value = aws_instance.app.public_ip
}

output "ssh_command" {
  value = "ssh -i ${path.module}/${var.name}-key.pem ec2-user@${aws_instance.app.public_ip}"
}

output "app_1tier_url" {
  value = "http://${aws_instance.app.public_ip}:8080"
}

output "security_group_id" {
  value = aws_security_group.sg.id
}
