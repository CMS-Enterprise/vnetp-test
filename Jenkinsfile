def nodeImage = 'node:lts'
def sonarImage = 'sonarsource/sonar-scanner-cli'

pipeline {
  agent any
  stages {
    stage('Build') {
      steps {
        script {
          docker.image("${nodeImage}").inside("-u 0:0") {
            sh 'npm i --unsafe-perm'
            sh 'npm i -g jest'
            sh 'npm rebuild node-sass'
            sh 'npm run build:prod'
          }
        }
      }
    }

    stage('Tests') {
      steps {
        script {
          docker.image("${nodeImage}").inside("-u 0:0") {
            sh 'npm run test:ci'
          }
        }
      }
    }

    stage("SonarQube - Static Analysis") {
      steps {
        withSonarQubeEnv('dc01') {
          script {
            def readContent = readFile "sonar-project.properties"
            writeFile file: "sonar-project.properties", text: "$readContent \nsonar.branch.name=$BRANCH_NAME\n"
            docker.image("${sonarImage}").withRun('-u 0:0 -v "$PWD:/usr/src"') { c ->
              sh 'while [ ! -f ./.scannerwork/report-task.txt ]; do sleep 5; done'
            }
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
