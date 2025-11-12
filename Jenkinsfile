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

  - name: buildah
    image: quay.io/buildah/stable:v1.42.0
    imagePullPolicy: Always
    command: ['cat']
    tty: true
    resources:
      limits:
        cpu: 1000m
    volumeMounts:
      - name: jenkins-docker-cfg
        mountPath: /var/run/.docker
        
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

    // Internal Test
    stage('Test') {
      steps {
        container('node') {
          sh 'npm --version'
          sh 'npm run test:ci'
        }
      }
    }

     // Test with SonarQube
    stage('SonarQube') {
      // Pre-requisites: Use withSonarQubeEnv step in your pipeline 
      when {
                expression { env.GIT_BRANCH == 'master' || env.GIT_BRANCH == 'dev' || env.GIT_BRANCH == 'int'}
            }
      steps {
        container("sonarcli") {
            withCredentials([string(credentialsId: 'CB2Sonar', variable: 'SONARQUBE')]) {
              sh '''
              sonar-scanner \
                -Dsonar.projectKey=vnetp-ui \
                -Dsonar.sources=. \
                -Dsonar.host.url=https://sonarqube.cloud.cms.gov \
                -Dsonar.login=sqp_f96a7ecc246898d6d4f6a72a00ede17335d22c49
              '''
            }
        }
      }
    }
  
    // Push to Artifactory
    stage('Build and Push Image') {
      steps {
        container('buildah') {
            sh '''
            export REGISTRY_AUTH_FILE=/var/run/.docker/config.json
            cat ${REGISTRY_AUTH_FILE}
            buildah bud \
              --storage-driver=vfs \
              --build-arg build-number=${BUILD_NUMBER} \
              -f Dockerfile \
              -t artifactory.cloud.cms.gov/cds-docker-local/vnetp-ui:${GIT_COMMIT} \
              .
            buildah push \
              --storage-driver=vfs \
              artifactory.cloud.cms.gov/cds-docker-local/vnetp-ui:${GIT_COMMIT}
            '''
        }
      }
    }
  }

  // Slack Message
  post {
        always {
            echo 'send to cds-draas-jenkins channel in Slack'
        }
        success {
                script {
                    slackSend(channel: 'cds-draas-jenkins')
                }
            }
    
  }
}
