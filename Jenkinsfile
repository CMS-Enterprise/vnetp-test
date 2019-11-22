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
                docker.image('node:lts').inside("-u 0:0 --network=draas -e TEST_DATABASE_NAME=draas -e TEST_DATABASE_HOST=db -e TEST_DATABASE_PORT=5432") {
                  sh 'npm i --unsafe-perm'
                  sh 'npm run test:ci'
                }
              }
            }
          }
      }
      stage('e2e') {
          steps {
            script{ 
              docker.image('postgres:9.6').withRun('--network=draas --network-alias=db -e POSTGRES_USER=draas -e POSTGRES_PASSWORD=draas -e POSTGRES_DB=draas -p 5432:5432') { c ->
                docker.image('postgres:9.6').inside("-u 0:0 --network=draas") {
                  /* Wait until pg service is up */
                  sh 'while ! pg_isready -h db; do sleep 1; done'
                }
                docker.image('node:lts').inside("-u 0:0 --network=draas -e TEST_DATABASE_NAME=draas -e TEST_DATABASE_HOST=db -e TEST_DATABASE_PORT=5432") {
                  sh 'npm i --unsafe-perm'
                  sh 'npm run-script build'
                  sh 'TEST_REPORT_FILENAME=e2e-report.xml npm run test:e2e:ci'
                }
              }
            }
          }
      }      
  }
  post {
    always {
      junit '*-report.xml'
      // permissions problem from root ownership apparently [jvf]
      sh 'cp output/coverage/cobertura-coverage.xml cobertura-coverage.xml'
      cobertura(coberturaReportFile: 'cobertura-coverage.xml')
      script {
        slackNotifier.notify(currentBuild.currentResult)
      }
    }
  }
}