pipeline {
  agent any
  stages {
    stage("Static Analysis") {
      agent any
      steps {
        script{
          def readContent = readFile "sonar-project.properties"
          writeFile file: "sonar-project.properties", text: "$readContent sonar.branch.name=$BRANCH_NAME\n"
          docker.image('sonarsource/sonar-scanner-cli').run('-u 996:993 -v "$PWD:/usr/src"')
        }
      }
    }
    stage('test') {
      steps {
        script{
          docker.image('zenika/alpine-chrome:with-node').inside("-u 0:0") {
            sh 'npm i --unsafe-perm'
            sh 'npm i -g jest'
            sh 'npm rebuild node-sass'
            sh 'npm run test:ci'
            sh 'npm run build:prod'
          }
        }
      }
    }
  }
  post {
    always {
      sh 'cp coverage/cobertura-coverage.xml cobertura-coverage.xml'
      cobertura(coberturaReportFile: 'cobertura-coverage.xml')
      script {
        slackNotifier.notify(currentBuild.currentResult)
      }
    }
  }
}
