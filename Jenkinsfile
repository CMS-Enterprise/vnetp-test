// TODO
pipeline {
  agent any
  stages {
      stage("Static Analysis") {
        agent any
        steps {
          script{
            docker.image('sonarsource/sonar-scanner-cli').run('-u 996:993 -v "$PWD:/usr/src" -e SONAR_HOST_URL=http://10.151.14.60:9000 -e SONAR_TOKEN=b68fdcf3c36a3ecb1151a9c25622600a18a09ef5')
            sh 'env'
            sh 'printenv'

          }
        }
      }
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
                  sh 'npm run test'
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
                  sh 'TEST_REPORT_FILENAME=e2e-report.xml npm run test:e2e'
                }
              }
            }
          }
      }
  }
  post {
    always {
      junit '*-report.xml'
      //sh 'find .'
      // permissions problem from root ownership apparently [jvf]
      //sh 'cp output/coverage/cobertura-coverage.xml cobertura-coverage.xml'
      //cobertura(coberturaReportFile: 'cobertura-coverage.xml')
      script {
        slackNotifier.notify(currentBuild.currentResult)
      }
    }
  }
}
