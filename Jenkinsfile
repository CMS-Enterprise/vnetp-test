def nodeImage = 'node:16.10'
def sonarImage = 'sonarsource/sonar-scanner-cli'

pipeline {
   agent any
    environment { npm_config_cache = 'npm-cache' }
    stages {
    
     stage('Build') {
         agent {
          docker {
             image "${nodeImage}"
             args "--userns=keep-id -e HOME=/tmp/home --security-opt label=disable"
             label 'rehl8-prod'
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
             args "--userns=keep-id -e HOME=/tmp/home --security-opt label=disable"
             label 'rehl8-prod'
             }
        }
      steps {
        sh 'npm --version'
        sh 'npm run test:ci'
      }
    }     

      
   stage("SonarQube - Static Analysis") {
     agent { label 'rehl8-prod' }
       steps {
        withSonarQubeEnv('CB2Sonarrehl8') {
          script {
            def readContent = readFile "sonar-project.properties"
            writeFile file: "sonar-project.properties", text: "$readContent \nsonar.branch.name=$BRANCH_NAME\n"
            docker.image("${sonarImage}").withRun('--security-opt label=disable -v "$PWD:/usr/src"') { c ->
            
            // NEED THIS LINE TO WORK!
            sh 'while [ ! -f ./.scannerwork/report-task.txt ]; do sleep 5; done'
            sh 'sleep 10'
            sh 'if [ -d ./.scannerwork ]; then chmod -R 777 ./.scannerwork; fi'
            sh 'if [ -d ./.scannerwork ]; then rm -Rf ./.scannerwork; fi'
            }
          }
        }
      }
    }
      

   stage('Publish') {
     agent { label 'rehl8-prod' }
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
             then mkdir -p /mnt/buildartifacts/dcs-ui/builds/$GIT_COMMIT && cp builds/$GIT_COMMIT/dist.tar.gz  /mnt/buildartifacts/dcs-ui/builds/$GIT_COMMIT && chmod -R 755 /mnt/buildartifacts/dcs-ui/builds/$GIT_COMMIT
             else echo 'NFS Mount not available'; exit 1
             fi
          '''         
          }
       }
     } 
  }  

      
  post { 
     always {
         echo 'send to cds-draas-jenkins channel in Slack'
     }
    success {
      node ('rehl8-prod') {
           sh 'cp coverage/cobertura-coverage.xml cobertura-coverage.xml'
           cobertura(coberturaReportFile: 'cobertura-coverage.xml')
              script {
                     slackNotifier.notify(currentBuild.currentResult)
              }
       }
    }
  }
}

