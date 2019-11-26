pipeline {
  agent any
  stages {
      stage('test') {
          steps {
            script{ 
              docker.image('postgres:9.6').withRun('--network=draas --network-alias=db -e POSTGRES_USER=draas -e POSTGRES_PASSWORD=draas -e POSTGRES_DB=draas -p 5432:5432') { c ->
                docker.image('postgres:9.6').inside("-u 0:0 --network=draas") {
                  /* Wait until pg service is up */
                  sh 'while ! pg_isready -h db; do sleep 1; done'
                }
                docker.image('node:12-alpine').inside("-u 0:0 --network=draas -e TEST_DATABASE_NAME=draas -e TEST_DATABASE_HOST=db -e TEST_DATABASE_PORT=5432 -e CHROME_BIN=/usr/bin/chromium-browser") {
                  sh 'apk add --no-cache  chromium --repository=http://dl-cdn.alpinelinux.org/alpine/v3.10/main'
                  sh 'npm install --save-dev  --unsafe-perm node-sass' 
                  sh 'npm install npm-update-all -g'
                  sh 'npm i --unsafe-perm'

                  sh 'npm install jest --save-dev'
                  sh 'npm install jest-junit --save-dev'
                  sh 'npm install -g @angular/cli'

                  sh 'npm run test:ci'
                  archiveArtifacts artifacts: '*-report.xml', fingerprint: true 

                  
                  


                }
              }
            }



          }
      }
  }
  post {
    always {

      //junit "$WORKSPACE/test-results-unit.xml"
      //junit '**/reports/junit/*.xml'  
      junit '*-report.xml'
      // permissions problem from root ownership apparently [jvf]
      script {
        slackNotifier.notify(currentBuild.currentResult)
      }
    }
  }
}