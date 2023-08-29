def nodeImage = 'node:16.3.0'
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
      
  }  
}


 
