def nodeImage = 'node:18.18'
def sonarImage = 'sonarsource/sonar-scanner-cli'

pipeline {
    agent { label 'rehl8-prod2' }
    environment { npm_config_cache = 'npm-cache' }
    stages {
        stage('Build') {
            agent {
                docker {
                    image "${nodeImage}"
                    args '--userns=keep-id -e HOME=/tmp/home --security-opt label=disable'
                    label 'rehl8-prod2'
                }
            }

            steps {
                sh 'npm --version'
                sh 'npm i'
                sh 'npm run build:prod'
            }
    }

    stage('Test') {
       agent {
          docker {
                image "${nodeImage}"
                args '--userns=keep-id -e HOME=/tmp/home --security-opt label=disable'
                label 'rehl8-prod2'
                }
            }
            steps {
                sh 'npm --version'
                sh 'npm run test:ci'
            }
    }

    stage('SonarQube - Static Analysis') {
            when {
                expression { env.GIT_BRANCH == 'master' || env.GIT_BRANCH == 'dev' || env.GIT_BRANCH == 'int'}
            }
            agent { label 'rehl8-prod2' }
            steps {
                    script {
                           try {
                                sh '''
	                                pwd
  	                              cp -R /var/cbjenkins/sonar-scanner  "${PWD}/node_modules"   
                                  export PATH=/var/cbjenkins/workspace/tools/jenkins.plugins.nodejs.tools.NodeJSInstallation/NodeJS/bin:$PATH
                                  "${PWD}/node_modules"/sonar-scanner/bin/sonar-scanner -Dproject.settings="${PWD}"/sonar-project.properties   
                                  if [ -d ${PWD}/.scannerwork ]; then rm -Rf ${PWD}/.scannerwork; fi  
                                '''  
                        } catch (Exception e) {
                           error('Failing sonarqube Test')
                           }
                    }
            }
     }

    stage('Publish') {
            agent { label 'rehl8-prod2' }
            steps {
                script {
                    sh '''
              mkdir -p builds/$GIT_COMMIT
              rm -f dist.tar
              tar cvf dist.tar dist/automation-ui/*
              rm -f dist.tar.gz
              gzip dist.tar
              mv dist.tar.gz builds/$GIT_COMMIT/dist.tar.gz
             if (findmnt -T /mnt/buildartifacts)
             then mkdir -p /mnt/buildartifacts/dcs-ui/builds/$GIT_COMMIT && cp -u builds/$GIT_COMMIT/dist.tar.gz  /mnt/buildartifacts/dcs-ui/builds/$GIT_COMMIT && chmod -R 755 /mnt/buildartifacts/dcs-ui/builds/$GIT_COMMIT
             else echo 'NFS Mount not available'; exit 1
             fi
          '''
                }
            }
     }
      
 
    stage('Selenium-uiTest') {
            agent { label 'rehl8-Selenium' }
            steps {
                script {
                    if (env.GIT_BRANCH == 'int' || env.GIT_BRANCH == 'dev' ) {
                        build job: 'Pipeline-Selenium-uiTest', wait: false, parameters: [string(name: 'BRANCH_NAME', value: "${env.GIT_BRANCH}")]
                    }
                }
            }
      }
  }

   post {
        always {
            echo 'send to cds-draas-jenkins channel in Slack'
        }
        success {
            node('rehl8-prod2') {
                script {
                    if (env.GIT_BRANCH == 'int' || env.GIT_BRANCH == 'dev' || env.GIT_BRANCH == 'master') {
                        sh 'cp coverage/cobertura-coverage.xml cobertura-coverage.xml'
                        cobertura(coberturaReportFile: 'cobertura-coverage.xml')
                    }
                    slackNotifier.notify(currentBuild.currentResult)
                }
            }
        }
    }
}
