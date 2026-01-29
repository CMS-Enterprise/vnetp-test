pipeline {
  agent {
    kubernetes {
      yaml """
apiVersion: v1
kind: Pod
spec:
  serviceAccountName: jenkins-role
  restartPolicy: Never
  containers:
  - name: node
    image: artifactory.cloud.cms.gov/docker/node:20.16
    command: ['cat']
    tty: true
    resources:
      limits:
        cpu: 500m
        memory: 5Gi

  - name: snyk-scanner
    image: artifactory.cloud.cms.gov/docker/snyk/snyk:alpine
    command: ["/bin/sh", "-c"]
    args:
      - ls
        
  - name: sonarcli
    image: artifactory.cloud.cms.gov/docker/sonarsource/sonar-scanner-cli:5
    command: ['cat']
    tty: true
    resources:
      limits:
        cpu: 500m
        memory: 5Gi
    
  - name: jfrogcli
    image: artifactory.cloud.cms.gov/docker/jfrog/jfrog-cli-v2-jf
    command: ['cat']
    tty: true
    resources:
      limits:
        cpu: 1000m
        memory: 1024Mi

  
  - name: kaniko
    image: artifactory.cloud.cms.gov/docker/kaniko-project/executor:v1.23.2-debug
    imagePullPolicy: Always
    command: ['/busybox/cat']
    tty: true
    resources:
      limits:
        cpu: 1000m
    volumeMounts:
      - name: jenkins-docker-cfg
        mountPath: /kaniko/.docker
        
  volumes:
  - name: jenkins-docker-cfg
    projected:
      sources:
      - secret:
          name: cds-artifactory4
          items:
            - key: .dockerconfigjson
              path: config.json
"""
    }
  }
  
  stages {
    stage('Build') {
      steps {
        container('node') {
          sh 'npm --version'
          sh 'npm i'
          sh 'npm run build:prod'
        }
      }
    }

    stage('Snyk Scan') {
            steps {
                script {
                    // Invoke Snyk Security scan
                    snykSecurity(
                        snykInstallation: 'snyk-vnetp-ui', // Snyk CLI in Global Tool Configuration
                        snykTokenId: 'SNYK_TOKEN', // ID of your Snyk API Token credential in Jenkins
                        failOnIssues: true, // Fail the build if Snyk finds issues
                        severity: 'high', // Only report issues with 'high' severity or higher
                        monitorProjectOnBuild: true // Monitor the project in Snyk after the scan
                        // You can add other parameters as needed, enyk.g., targetFile: 'package.json'
                    )
                }
            }
      
        }


    


    
  }
}
