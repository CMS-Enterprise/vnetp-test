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

  - name: kaniko
    image: gcr.io/kaniko-project/executor:debug
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
      steps {
        container("sonarcli") {
            withCredentials([string(credentialsId: 'CB2Sonar', variable: 'SONARQUBE')]) {
              sh '''
              sonar-scanner \
                -Dsonar.projectKey=vnetp-ui \
                -Dsonar.sources=. \
                -Dsonar.host.url=https://sonarqube.cloud.cms.gov \
                -Dsonar.login=sqp_10cbfa7b9096207fc600bab49b10408f26c33258
              '''
            }
        }
      }
    }
  
    // Push to Artifactory
    stage('Kaniko') {
      steps {
        container('kaniko') {
            sh '''
            cat /kaniko/.docker/config.json
            /kaniko/executor --context $(pwd) --build-arg build-number=${BUILD_NUMBER} --dockerfile Dockerfile --destination artifactory.cloud.cms.gov/cds-docker-local/vnetp-ui:${GIT_COMMIT}
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
                    if (env.GIT_BRANCH == 'int' || env.GIT_BRANCH == 'dev' || env.GIT_BRANCH == 'master') {
                        sh 'cp coverage/cobertura-coverage.xml cobertura-coverage.xml'
                        cobertura(coberturaReportFile: 'cobertura-coverage.xml')
                    }
                    slackSend(channel: 'cds-draas-jenkins')
                }
            }
    
  }
}
